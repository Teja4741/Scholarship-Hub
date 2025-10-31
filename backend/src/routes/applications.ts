import express from 'express';
import multer from 'multer';
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/applicationController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads (Your config is correct)
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for processing
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Allow only images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      // Add 'as any' to satisfy some versions of @types/multer
      cb(new Error('Only image and PDF files are allowed') as any);
    }
  },
});

router.post('/', authenticateToken, createApplication);

// User can view their own applications, admin can view all
router.get('/', authenticateToken, getAllApplications);
router.put('/:id/status', authenticateToken, requireRole(['admin']), updateApplicationStatus);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteApplication);

// User can view their own applications
router.get('/:id', authenticateToken, getApplicationById);

export default router;