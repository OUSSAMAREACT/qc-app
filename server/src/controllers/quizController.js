import prisma from '../prisma.js';

export const startQuiz = async (req, res) => {
    try {
        const { category, difficulty, limit = 20 } = req.query;
        const where = {};

        // If category is provided (name), find the category first or filter by relation
        if (category) {
            const cat = await prisma.category.findUnique({ where: { name: category } });
            if (cat) {
                where.categoryId = cat.id;
            } else {
                // If category name doesn't exist, return empty or error? 
                // For now, let's return empty to avoid crash
                return res.json([]);
            }
        }

        if (difficulty) where.difficulty = difficulty;

        // Fetch random questions (Prisma doesn't support random natively well, so we fetch more and shuffle or use raw query)
        // For simplicity, we'll fetch all matching (or a subset) and shuffle in memory for now.
        // In production with many questions, use raw query "ORDER BY RANDOM()".

        const questions = await prisma.question.findMany({
            where,
            include: {
                choices: true,
                category: true,
            },
            take: 100, // Limit pool size
        });

        // Shuffle and slice
        const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, parseInt(limit));

        // Remove isCorrect from choices
        const sanitized = shuffled.map(q => ({
            ...q,
            choices: q.choices.map(c => ({ id: c.id, text: c.text, questionId: c.questionId })),
        }));

        res.json(sanitized);
    } catch (error) {
        console.error("Start quiz error:", error);
        res.status(500).json({ message: "Erreur lors du démarrage du quiz." });
    }
};

export const submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body; // [{ questionId, selectedChoiceIds: [1, 2] }]
        const userId = req.user.userId;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Format de réponse invalide." });
        }

        let score = 0;
        const totalQuestions = answers.length;
        const details = [];

        // Fetch all questions involved
        const questionIds = answers.map(a => a.questionId);
        const questions = await prisma.question.findMany({
            where: { id: { in: questionIds } },
            include: { choices: true },
        });

        // Calculate score
        for (const answer of answers) {
            const question = questions.find(q => q.id === answer.questionId);
            if (!question) continue;

            const correctChoiceIds = question.choices.filter(c => c.isCorrect).map(c => c.id);
            const selectedIds = answer.selectedChoiceIds || [];

            // Strict comparison: All correct choices must be selected, and NO incorrect choices.
            // Sort both arrays to compare
            const sortedCorrect = correctChoiceIds.sort((a, b) => a - b);
            const sortedSelected = selectedIds.sort((a, b) => a - b);

            const isCorrect = JSON.stringify(sortedCorrect) === JSON.stringify(sortedSelected);

            if (isCorrect) {
                score++;
            }

            details.push({
                questionId: question.id,
                questionText: question.text,
                explanation: question.explanation,
                choices: question.choices.map(c => ({ id: c.id, text: c.text, isCorrect: c.isCorrect })),
                isCorrect,
                correctChoiceIds,
                userSelectedIds: selectedIds,
            });
        }

        // Save result
        await prisma.quizResult.create({
            data: {
                userId,
                score,
                totalQuestions,
                categoryName: req.body.categoryName || "Général",
            },
        });

        // Update Gamification Stats
        // We assume any quiz submission counts as activity.
        // We pass totalQuestions as questionsAnswered count.
        const { updateGamificationStats } = await import('../services/gamificationService.js');
        await updateGamificationStats(userId, totalQuestions);

        res.json({
            score,
            totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            details,
        });
    } catch (error) {
        console.error("Submit quiz error:", error);
        res.status(500).json({ message: "Erreur lors de la soumission du quiz." });
    }
};

export const getHistory = async (req, res) => {
    try {
        const results = await prisma.quizResult.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'historique." });
    }
};
