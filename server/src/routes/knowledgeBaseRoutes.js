import express from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/knowledgeBaseController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), uploadDocument);
router.get('/', authenticateToken, requireAdmin, getDocuments);
router.delete('/:id', authenticateToken, requireAdmin, deleteDocument);

export default router;
