import { Request, Response } from 'express';
import { fileUploadService, UploadedFile } from '../services/fileUploadService';
import pool from '../database';
import { AuthRequest } from '../middleware/auth';

export interface Document {
  id: number;
  applicationId: number;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  verified: boolean;
  extractedText?: string;
  uploadedAt: Date;
}

export class DocumentController {
  // Upload document
  async uploadDocument(req: AuthRequest, res: Response) {
    try {
      const { applicationId, documentType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!applicationId) {
        return res.status(400).json({ error: 'Application ID is required' });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: user not found' });
      }

      // Verify user owns the application
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: user not found' });
      }
      const [applications] = await pool.execute(
        'SELECT id FROM applications WHERE id = ? AND userId = ?',
        [applicationId, req.user.userId]
      );

      if ((applications as any[]).length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Upload to cloud storage
      const cloudUrl = await fileUploadService.uploadToCloud(
        file.path,
        file.filename,
        file.mimetype
      );

      // Extract text and verify document
      const { verified, extractedData } = await fileUploadService.verifyDocument(
        file.path,
        documentType
      );

      // Save document record to database
      const [result] = await pool.execute(
        `INSERT INTO documents (applicationId, filename, originalname, mimetype, size, url, verified, extractedText, uploadedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          applicationId,
          file.filename,
          file.originalname,
          file.mimetype,
          file.size,
          cloudUrl,
          verified,
          extractedData ? JSON.stringify(extractedData) : null
        ]
      );

      const documentId = (result as any).insertId;

      // Clean up local file
      fileUploadService.cleanup(file.path);

      // Create notification for document upload
      await pool.execute(
        `INSERT INTO notifications (userId, type, title, message, data, createdAt)
         VALUES (?, 'document_upload', 'Document Uploaded', ?, ?, NOW())`,
        [
          req.user.userId,
          `Your document "${file.originalname}" has been uploaded and ${verified ? 'verified' : 'is pending verification'}.`,
          JSON.stringify({ documentId, applicationId, verified })
        ]
      );

      res.status(201).json({
        id: documentId,
        applicationId,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: cloudUrl,
        verified,
        extractedData,
        uploadedAt: new Date()
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }

  // Get documents for an application
  async getDocuments(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;

      // Verify user owns the application
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: user not found' });
      }
      const [applications] = await pool.execute(
        'SELECT id FROM applications WHERE id = ? AND userId = ?',
        [applicationId, req.user.userId]
      );

      if ((applications as any[]).length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const [documents] = await pool.execute(
        'SELECT * FROM documents WHERE applicationId = ? ORDER BY uploadedAt DESC',
        [applicationId]
      );

      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  }

  // Get single document
  async getDocument(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const [documents] = await pool.execute(
        `SELECT d.*, a.userId FROM documents d
         JOIN applications a ON d.applicationId = a.id
         WHERE d.id = ?`,
        [id]
      );

      if ((documents as any[]).length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const document = (documents as any[])[0];

      // Check if user owns the document
      if (!req.user || document.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(document);
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  }

  // Delete document
  async deleteDocument(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const [documents] = await pool.execute(
        `SELECT d.*, a.userId FROM documents d
         JOIN applications a ON d.applicationId = a.id
         WHERE d.id = ?`,
        [id]
      );

      if ((documents as any[]).length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const document = (documents as any[])[0];

      // Check if user owns the document
      if (!req.user || document.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete from database
      await pool.execute('DELETE FROM documents WHERE id = ?', [id]);

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  // Verify document manually (admin function)
  async verifyDocument(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { verified, notes } = req.body;

      // Check if user is admin (assuming role-based access)
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: user not found' });
      }
      const [users] = await pool.execute(
        'SELECT role FROM users WHERE id = ?',
        [req.user.userId]
      );

      if ((users as any[])[0]?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await pool.execute(
        'UPDATE documents SET verified = ?, verifiedAt = NOW(), verificationNotes = ? WHERE id = ?',
        [verified, notes, id]
      );

      // Create notification for user
      const [documents] = await pool.execute(
        `SELECT d.applicationId, a.userId FROM documents d
         JOIN applications a ON d.applicationId = a.id
         WHERE d.id = ?`,
        [id]
      );

      if ((documents as any[]).length > 0) {
        const { userId, applicationId } = (documents as any[])[0];

        await pool.execute(
          `INSERT INTO notifications (userId, type, title, message, data, createdAt)
           VALUES (?, 'document_verification', 'Document Verified', ?, ?, NOW())`,
          [
            userId,
            `Your document has been ${verified ? 'approved' : 'rejected'} by our verification team.`,
            JSON.stringify({ documentId: id, applicationId, verified, notes })
          ]
        );
      }

      res.json({ message: 'Document verification updated' });
    } catch (error) {
      console.error('Error verifying document:', error);
      res.status(500).json({ error: 'Failed to verify document' });
    }
  }

  // Get document statistics (admin)
  async getDocumentStats(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: user not found' });
      }
      const [users] = await pool.execute(
        'SELECT role FROM users WHERE id = ?',
        [req.user.userId]
      );

      if ((users as any[])[0]?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const [stats] = await pool.execute(`
        SELECT
          COUNT(*) as totalDocuments,
          SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verifiedDocuments,
          SUM(CASE WHEN verified = 0 THEN 1 ELSE 0 END) as pendingDocuments,
          AVG(size) as avgFileSize
        FROM documents
      `);

      res.json((stats as any[])[0]);
    } catch (error) {
      console.error('Error fetching document stats:', error);
      res.status(500).json({ error: 'Failed to fetch document statistics' });
    }
  }
}

export const documentController = new DocumentController();
