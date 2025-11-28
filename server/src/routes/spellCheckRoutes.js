import express from 'express';
import * as spellCheckController from '../controllers/spellCheckController.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require Super Admin access
router.use(authenticateToken);
router.use(requireSuperAdmin);

router.get('/scan', spellCheckController.scanQuestions);
router.post('/ignore', spellCheckController.ignoreWord);

export default router;
