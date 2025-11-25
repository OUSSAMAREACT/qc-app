import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import {
    createExam,
    getExams,
    getActiveExam,
    submitExam,
    getLeaderboard,
    deleteExam,
    getExamById,
    updateExam,
    saveProgress
} from '../controllers/weeklyExamController.js';

const router = express.Router();

// Public/User routes
router.get('/active', authenticateToken, getActiveExam);
router.post('/submit', authenticateToken, submitExam);
router.post('/progress', authenticateToken, saveProgress);
router.get('/:examId/leaderboard', authenticateToken, getLeaderboard);

// Admin routes
// Admin routes
router.post('/', authenticateToken, requireAdmin, createExam);
router.get('/', authenticateToken, requireAdmin, getExams);
router.get('/:id', authenticateToken, requireAdmin, getExamById);
router.put('/:id', authenticateToken, requireAdmin, updateExam);
router.delete('/:id', authenticateToken, requireAdmin, deleteExam);

export default router;
