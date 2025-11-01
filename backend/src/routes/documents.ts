import { Router, RequestHandler } from 'express';
import { documentController } from '../controllers/documentController';
import { fileUploadService } from '../services/fileUploadService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All document routes require authentication
router.use(authenticateToken);

// Upload document
router.post('/upload', fileUploadService.upload.single('document') as unknown as RequestHandler, documentController.uploadDocument);

// Get documents for an application
router.get('/application/:applicationId', documentController.getDocuments);

// Get single document
router.get('/:id', documentController.getDocument);

// Delete document
router.delete('/:id', documentController.deleteDocument);

// Verify document (admin only)
router.put('/:id/verify', documentController.verifyDocument);

// Get document statistics (admin only)
router.get('/admin/stats', documentController.getDocumentStats);

export default router;
