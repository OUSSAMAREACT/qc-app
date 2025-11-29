import express from 'express';
import { explainWithContext } from '../controllers/aiTutorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/explain', authenticateToken, explainWithContext);

export default router;
