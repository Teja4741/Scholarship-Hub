import express from 'express';
import { advancedSearch, getSearchSuggestions, getPopularSearches } from '../controllers/searchController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Advanced search endpoint (requires authentication)
router.post('/advanced', authenticateToken, advancedSearch);

// Search suggestions (public)
router.get('/suggestions', getSearchSuggestions);

// Popular searches (public)
router.get('/popular', getPopularSearches);

export default router;
