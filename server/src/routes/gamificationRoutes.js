import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getGamificationStats } from '../services/gamificationService.js';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
    const stats = await getGamificationStats(req.user.userId);
    if (stats) {
        res.json(stats);
    } else {
        res.status(500).json({ message: "Failed to fetch gamification stats" });
    }
});

export default router;
