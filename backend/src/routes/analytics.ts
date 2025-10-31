import express from 'express';
import { getDashboardStats, getUserAnalytics, getScholarshipAnalytics, exportData } from '../controllers/analyticsController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All analytics routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User analytics
router.get('/users', getUserAnalytics);

// Scholarship analytics
router.get('/scholarships', getScholarshipAnalytics);

// Data export
router.get('/export', exportData);

export default router;
