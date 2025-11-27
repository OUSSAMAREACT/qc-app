import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:questionId', authenticateToken, getComments);
router.post('/', authenticateToken, addComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;
