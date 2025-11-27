import express from 'express';
import { getSettings, updateSetting } from '../controllers/systemSettingsController.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get settings (like exam date)
router.get('/', getSettings);

// Super Admin only route to update settings
router.post('/', authenticateToken, requireSuperAdmin, updateSetting);

export default router;
