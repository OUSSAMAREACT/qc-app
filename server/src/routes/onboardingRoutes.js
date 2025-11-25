import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getWeek } from 'date-fns';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/complete', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { examDate, studyMinutesPerDay } = req.body;

        // Calculate initial goals based on study time
        // E.g., 10 questions per 15 minutes of study
        const questionsPerDay = Math.round((studyMinutesPerDay || 30) / 1.5);
        const weeklyQuestionGoal = questionsPerDay * 5; // Assume 5 days/week
        const weeklyDayGoal = 5;

        // Update User
        await prisma.user.update({
            where: { id: userId },
            data: {
                onboardingCompleted: true,
                examDate: examDate ? new Date(examDate) : null,
                studyMinutesPerDay: parseInt(studyMinutesPerDay) || 30
            }
        });

        // Create/Update Weekly Progress for current week
        const now = new Date();
        const weekNumber = getWeek(now, { weekStartsOn: 1 });
        const year = now.getFullYear();

        await prisma.weeklyProgress.upsert({
            where: {
                userId_year_weekNumber: {
                    userId,
                    year,
                    weekNumber
                }
            },
            update: {
                goalQuestions: weeklyQuestionGoal,
                goalDays: weeklyDayGoal
            },
            create: {
                userId,
                year,
                weekNumber,
                goalQuestions: weeklyQuestionGoal,
                goalDays: weeklyDayGoal
            }
        });

        res.json({ message: "Onboarding completed successfully", goals: { weeklyQuestionGoal, weeklyDayGoal } });

    } catch (error) {
        console.error("Error completing onboarding:", error);
        res.status(500).json({ message: "Failed to complete onboarding", error: error.message });
    }
});

export default router;
