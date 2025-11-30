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

        // --- Radar Chart Data (Strengths/Weaknesses) ---
        // Aggregate average score per category
        const categoryStats = {};

        results.forEach(result => {
            const category = result.categoryName || 'Général';
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
        // Map results to a simple format: { date: 'DD/MM', score: % }
        const progressData = results.map(result => ({
            date: new Date(result.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            score: result.totalQuestions > 0
                ? Math.round((result.score / result.totalQuestions) * 100)
                : 0
        }));

        // Limit progress data to last 20 attempts to avoid clutter
        const recentProgress = progressData.slice(-20);

        res.json({
            radarData,
            progressData: recentProgress
        });

    } catch (error) {
        console.error("Error fetching advanced stats:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques." });
    }
};
