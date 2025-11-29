import express from 'express';
import prisma from '../prisma.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

import { getQuestionsWithoutChoices, deleteBrokenQuestion, bulkDeleteBrokenQuestions } from '../controllers/debugController.js';

const router = express.Router();

router.post('/promote', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' }
        });
        res.json({ message: "User promoted to ADMIN", user });
    } catch (error) {
        res.status(500).json({ message: "Error promoting user" });
    }
});

// Data Integrity Routes
router.get('/questions/no-choices', authenticateToken, getQuestionsWithoutChoices);
router.delete('/questions/no-choices/:id', authenticateToken, deleteBrokenQuestion);
router.delete('/questions/no-choices', authenticateToken, bulkDeleteBrokenQuestions);

export default router;
