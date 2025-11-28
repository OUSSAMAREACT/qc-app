import express from 'express';
import * as spellCheckController from '../controllers/spellCheckController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require Super Admin access
router.use(requireAuth);
router.use(requireSuperAdmin);

router.get('/scan', spellCheckController.scanQuestions);
router.post('/ignore', spellCheckController.ignoreWord);

export default router;
