import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdvancedStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch all quiz results for the user
        const results = await prisma.quizResult.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            select: {
                score: true,
                totalQuestions: true,
                categoryName: true,
                createdAt: true
            }
        });

        // Fetch valid categories
        const validCategories = await prisma.category.findMany({
            select: { name: true }
        });
        const validCategoryNames = new Set(validCategories.map(c => c.name));
        validCategoryNames.add('Général'); // Always include 'Général'

        // --- Radar Chart Data (Strengths/Weaknesses) ---
        // Aggregate average score per category
        const categoryStats = {};

        results.forEach(result => {
            const category = result.categoryName || 'Général';

            // Skip if category is no longer valid
            if (!validCategoryNames.has(category)) return;

            if (!categoryStats[category]) {
                categoryStats[category] = { totalScore: 0, count: 0 };
            }
            // Normalize score to percentage (assuming score is raw correct count)
            // If totalQuestions is 0 or missing, skip or default to 0
            const percentage = result.totalQuestions > 0
                ? (result.score / result.totalQuestions) * 100
                : 0;

            categoryStats[category].totalScore += percentage;
            categoryStats[category].count += 1;
        });

        const radarData = Object.keys(categoryStats).map(category => ({
            subject: category,
            A: Math.round(categoryStats[category].totalScore / categoryStats[category].count),
            fullMark: 100
        }));

        // --- Progress Graph Data (History) ---
        // Aggregate scores by week
        const weeklyStats = {};

        results.forEach(result => {
            const date = new Date(result.createdAt);
            // Get week number and year
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - startOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            const year = date.getFullYear();
            const key = `${year}-W${weekNum}`;

            if (!weeklyStats[key]) {
                weeklyStats[key] = { totalScore: 0, count: 0, weekLabel: `Sem ${weekNum}` };
            }

            const percentage = result.totalQuestions > 0
                ? (result.score / result.totalQuestions) * 100
                : 0;

            weeklyStats[key].totalScore += percentage;
            weeklyStats[key].count += 1;
        });

        const progressData = Object.keys(weeklyStats).map(key => ({
            date: weeklyStats[key].weekLabel,
            score: Math.round(weeklyStats[key].totalScore / weeklyStats[key].count)
        }));

        // Limit progress data to last 12 weeks
        const recentProgress = progressData.slice(-12);

        res.json({
            radarData,
            progressData: recentProgress
        });

    } catch (error) {
        console.error("Error fetching advanced stats:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques." });
    }
};
