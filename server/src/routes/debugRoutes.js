import express from 'express';
import prisma from '../prisma.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/files', (req, res) => {
    try {
        const uploadDir = path.join(process.cwd(), 'uploads/receipts');

        if (!fs.existsSync(uploadDir)) {
            return res.json({ message: 'Directory does not exist', path: uploadDir, cwd: process.cwd() });
        }

        const files = fs.readdirSync(uploadDir);
        res.json({
            path: uploadDir,
            files: files,
            cwd: process.cwd()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/db-check', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'Database connected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

export default router;
