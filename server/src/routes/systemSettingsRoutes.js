import express from 'express';
import { getSettings, updateSetting } from '../controllers/systemSettingsController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get settings (like exam date)
router.get('/', getSettings);

// Admin only route to update settings
router.post('/', authenticateToken, authorizeAdmin, updateSetting);

export default router;
