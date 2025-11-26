import express from 'express';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, getQuestionCount } from '../controllers/questionController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get total question count
router.get('/count', getQuestionCount);

// Public or Student: Get questions (maybe filter fields for students later, but for now send all)
// Actually, for students taking a quiz, we shouldn't send 'isCorrect'.
// But this endpoint might be general. Let's keep it simple for now and handle quiz logic separately.
router.get('/', authenticateToken, getQuestions);

// Admin only
router.post('/', authenticateToken, requireAdmin, createQuestion);
router.put('/:id', authenticateToken, requireAdmin, updateQuestion);
router.delete('/:id', authenticateToken, requireAdmin, deleteQuestion);

export default router;
