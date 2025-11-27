import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getComments, addComment } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:questionId', authenticateToken, getComments);
router.post('/', authenticateToken, addComment);

export default router;
