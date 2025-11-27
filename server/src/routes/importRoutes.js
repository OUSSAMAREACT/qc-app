import express from 'express';
import multer from 'multer';
import { importQuestionsFromCSV } from '../controllers/importController.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Protect route with Super Admin
router.post('/csv', authenticateToken, requireSuperAdmin, upload.single('file'), importQuestionsFromCSV);

export default router;
