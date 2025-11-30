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

        // --- Recent History Data ---
        const recentHistory = await prisma.quizResult.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                score: true,
                totalQuestions: true,
                categoryName: true,
                createdAt: true
            }
        });

        res.json({
            radarData,
            recentHistory
        });

    } catch (error) {
        console.error("Error fetching advanced stats:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques." });
    }
};
