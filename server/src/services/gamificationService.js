import prisma from '../prisma.js';
import { startOfWeek, endOfWeek, isSameDay, subDays } from 'date-fns';

/**
 * Updates the user's gamification stats (Streak & Weekly Progress)
 * Should be called after a quiz or exam submission.
 * @param {number} userId 
 * @param {number} questionsCount 
 */
export const updateGamificationStats = async (userId, questionsCount = 0) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { currentStreak: true, longestStreak: true, lastStudyDate: true }
        });

        if (!user) return;

        const today = new Date();
        const lastStudyDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;

        let newCurrentStreak = user.currentStreak;
        let daysStudiedIncrement = 0;

        // 1. Streak Logic
        if (!lastStudyDate) {
            // First time studying
            newCurrentStreak = 1;
            daysStudiedIncrement = 1;
        } else if (isSameDay(today, lastStudyDate)) {
            // Already studied today, streak doesn't change
            daysStudiedIncrement = 0;
        } else if (isSameDay(subDays(today, 1), lastStudyDate)) {
            // Studied yesterday, increment streak
            newCurrentStreak += 1;
            daysStudiedIncrement = 1;
        } else {
            // Missed a day (or more), reset streak
            newCurrentStreak = 1;
            daysStudiedIncrement = 1;
        }

        const newLongestStreak = Math.max(newCurrentStreak, user.longestStreak);

        // Update User Streak
        await prisma.user.update({
            where: { id: userId },
            data: {
                currentStreak: newCurrentStreak,
                longestStreak: newLongestStreak,
                lastStudyDate: today
            }
        });

        // 2. Weekly Progress Logic
        // Calculate Week Number and Year
        // Note: Using ISO week might be better, but simple calculation is often enough for this context.
        // We'll use a simple approach based on current date.
        const currentYear = today.getFullYear();
        // Get ISO week number
        const getWeekNumber = (d) => {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            return weekNo;
        };
        const currentWeek = getWeekNumber(today);

        // Find or Create WeeklyProgress
        const weeklyProgress = await prisma.weeklyProgress.upsert({
            where: {
                userId_year_weekNumber: {
                    userId,
                    year: currentYear,
                    weekNumber: currentWeek
                }
            },
            update: {
                questionsAnswered: { increment: questionsCount },
                daysStudied: { increment: daysStudiedIncrement }
            },
            create: {
                userId,
                year: currentYear,
                weekNumber: currentWeek,
                questionsAnswered: questionsCount,
                daysStudied: daysStudiedIncrement,
                goalQuestions: 100, // Default goal
                goalDays: 5         // Default goal
            }
        });

        return {
            streak: newCurrentStreak,
            weeklyProgress
        };

    } catch (error) {
        console.error("Error updating gamification stats:", error);
    }
};

/**
 * Get user's gamification stats
 * @param {number} userId 
 */
export const getGamificationStats = async (userId) => {
    try {
        const today = new Date();
        const currentYear = today.getFullYear();

        const getWeekNumber = (d) => {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            return weekNo;
        };
        const currentWeek = getWeekNumber(today);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { currentStreak: true, longestStreak: true }
        });

        const weeklyProgress = await prisma.weeklyProgress.findUnique({
            where: {
                userId_year_weekNumber: {
                    userId,
                    year: currentYear,
                    weekNumber: currentWeek
                }
            }
        });

        return {
            streak: user?.currentStreak || 0,
            longestStreak: user?.longestStreak || 0,
            weeklyProgress: weeklyProgress || {
                questionsAnswered: 0,
                daysStudied: 0,
                goalQuestions: 100,
                goalDays: 5
            }
        };

    } catch (error) {
        console.error("Error fetching gamification stats:", error);
        return null;
    }
};
