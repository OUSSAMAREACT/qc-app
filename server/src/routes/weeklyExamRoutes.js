import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import {
    createExam,
    getExams,
    getActiveExam,
    submitExam,
    getLeaderboard
} from '../controllers/weeklyExamController.js';

const router = express.Router();

// Public/User routes
router.get('/active', verifyToken, getActiveExam);
router.post('/submit', verifyToken, submitExam);
router.get('/:examId/leaderboard', verifyToken, getLeaderboard);

// Admin routes
router.post('/', verifyToken, isAdmin, createExam);
router.get('/', verifyToken, isAdmin, getExams);

export default router;
