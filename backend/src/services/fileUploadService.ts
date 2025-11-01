import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';
import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';

export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  verified?: boolean;
  extractedText?: string;
}

export class FileUploadService {
  private firebaseBucket: Bucket | null = null;
  private s3Client!: S3Client;
  private useAWS: boolean;

  constructor() {
    this.useAWS = process.env.USE_AWS_S3 === 'true';

    if (this.useAWS) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });
    } else {
      // Initialize Firebase if not using AWS
      if (!admin.apps.length) {
        // Check if Firebase credentials are available
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          });
          this.firebaseBucket = admin.storage().bucket();
        } else {
          console.warn('Firebase credentials not found. File upload service will use local storage only.');
        }
      } else {
        this.firebaseBucket = admin.storage().bucket();
      }
    }
  }

  // Multer configuration for file uploads
  private multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  private multerFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
    }
  };

  public upload = multer({
    storage: this.multerStorage,
    fileFilter: this.multerFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    }
  });

  // Upload file to cloud storage
  async uploadToCloud(localPath: string, filename: string, mimetype: string): Promise<string> {
    if (this.useAWS) {
      return this.uploadToS3(localPath, filename, mimetype);
    } else if (this.firebaseBucket) {
      return this.uploadToFirebase(localPath, filename, mimetype);
    } else {
      // Fallback to local storage if no cloud service is configured
      return `file://${localPath}`;
    }
  }

  private async uploadToS3(localPath: string, filename: string, mimetype: string): Promise<string> {
    const fileStream = fs.createReadStream(localPath);
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'gradious-scholar-docs';

    const uploadParams = {
      Bucket: bucketName,
      Key: `documents/${Date.now()}-${filename}`,
      Body: fileStream,
      ContentType: mimetype,
      ACL: 'private' as const,
    };

    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    // Generate signed URL for access
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: uploadParams.Key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 });
    return signedUrl;
  }

  private async uploadToFirebase(localPath: string, filename: string, mimetype: string): Promise<string> {
    if (!this.firebaseBucket) throw new Error('Firebase not initialized');

    const fileName = `documents/${Date.now()}-${filename}`;
    const file = this.firebaseBucket.file(fileName);

    await this.firebaseBucket.upload(localPath, {
      destination: fileName,
      metadata: {
        contentType: mimetype,
      },
    });

    // Generate signed URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 3600000, // 1 hour
    });

    return url;
  }

  // OCR text extraction
  async extractText(filePath: string): Promise<string> {
    const worker = await createWorker('eng');

    try {
      const { data: { text } } = await worker.recognize(filePath);
      return text;
    } finally {
      await worker.terminate();
    }
  }

  // Document verification logic
  async verifyDocument(filePath: string, documentType: string): Promise<{ verified: boolean; extractedData?: any }> {
    const extractedText = await this.extractText(filePath);

    // Basic verification logic - can be enhanced based on document type
    switch (documentType) {
      case 'transcript':
        return this.verifyTranscript(extractedText);
      case 'recommendation':
        return this.verifyRecommendationLetter(extractedText);
      case 'id':
        return this.verifyID(extractedText);
      default:
        return { verified: false };
    }
  }

  private verifyTranscript(text: string): { verified: boolean; extractedData?: any } {
    // Look for GPA, course names, grades, etc.
    const gpaMatch = text.match(/GPA:?\s*([0-4]\.?\d*)/i);
    const courses = text.match(/([A-Z]{2,4}\s*\d{3,4})/g) || [];

    return {
      verified: !!(gpaMatch || courses.length > 0),
      extractedData: {
        gpa: gpaMatch ? parseFloat(gpaMatch[1]) : null,
        coursesCount: courses.length,
      }
    };
  }

  private verifyRecommendationLetter(text: string): { verified: boolean; extractedData?: any } {
    // Look for recommendation letter keywords
    const keywords = ['recommend', 'excellent', 'outstanding', 'pleasure', 'endorse'];
    const hasKeywords = keywords.some(keyword => text.toLowerCase().includes(keyword));

    return {
      verified: hasKeywords && text.length > 200,
      extractedData: {
        wordCount: text.split(' ').length,
        hasKeywords,
      }
    };
  }

  private verifyID(text: string): { verified: boolean; extractedData?: any } {
    // Look for ID patterns (name, date of birth, ID number)
    const nameMatch = text.match(/Name:?\s*([A-Za-z\s]+)/i);
    const dobMatch = text.match(/DOB:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/);
    const idMatch = text.match(/ID:?\s*([A-Z0-9]+)/i);

    return {
      verified: !!(nameMatch && (dobMatch || idMatch)),
      extractedData: {
        name: nameMatch ? nameMatch[1].trim() : null,
        dob: dobMatch ? dobMatch[1] : null,
        id: idMatch ? idMatch[1] : null,
      }
    };
  }

  // Clean up local files after upload
  cleanup(localPath: string): void {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }

  // New method to handle file upload for applications
  async uploadFile(file: Express.Multer.File, applicationId: number, documentType: string): Promise<void> {
    // For now, we'll store files locally and create a document record
    // In production, you'd upload to cloud storage

    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${applicationId}_${documentType}_${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, filename);

    // Move file from memory to disk
    fs.writeFileSync(filePath, file.buffer);

    // Create document record in database
    const pool = require('../database').default;
    await pool.execute(
      'INSERT INTO documents (applicationId, documentType, filename, originalName, mimeType, fileSize, filePath) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [applicationId, documentType, filename, file.originalname, file.mimetype, file.size, filePath]
    );
  }
}

export const fileUploadService = new FileUploadService();
