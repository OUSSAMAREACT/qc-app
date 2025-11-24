import express from 'express';
import { startQuiz, submitQuiz, getHistory } from '../controllers/quizController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/start', authenticateToken, startQuiz);
router.post('/submit', authenticateToken, submitQuiz);
router.get('/history', authenticateToken, getHistory);

export default router;
