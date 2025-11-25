import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import {
    createExam,
    getExams,
    getActiveExam,
    submitExam,
    getLeaderboard
} from '../controllers/weeklyExamController.js';

const router = express.Router();

// Public/User routes
router.get('/active', authenticateToken, getActiveExam);
router.post('/submit', authenticateToken, submitExam);
router.get('/:examId/leaderboard', authenticateToken, getLeaderboard);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createExam);
router.get('/', authenticateToken, requireAdmin, getExams);

export default router;
