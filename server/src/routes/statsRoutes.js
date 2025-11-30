import express from 'express';
import { getAdvancedStats } from '../controllers/statsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/advanced', authenticateToken, getAdvancedStats);

export default router;
