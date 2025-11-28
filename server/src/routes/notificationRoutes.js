import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getNotifications, markAsRead, sendAnnouncement } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markAsRead);
router.post('/broadcast', authenticateToken, sendAnnouncement); // Admin only check is inside controller or add middleware

export default router;
