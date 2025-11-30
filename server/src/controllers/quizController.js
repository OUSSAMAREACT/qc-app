import prisma from '../prisma.js';

export const startQuiz = async (req, res) => {
    try {
        const { category, difficulty, limit = 20, mode } = req.query;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const where = {};

        // --- Quiz Rapide Logic ---
        if (mode === 'rapide') {
            // 1. Limit to 30 questions
            const quizLimit = 30;

            // 2. Access Control: Free users only get Free categories
            if (userRole === 'STUDENT') {
                where.category = { isFree: true };
            }

            // 3. History Tracking: Exclude answered questions
            // Fetch IDs of questions already answered by this user
            const answeredHistory = await prisma.userQuestionHistory.findMany({
                where: { userId },
                select: { questionId: true }
            });
            const answeredIds = answeredHistory.map(h => h.questionId);

            if (answeredIds.length > 0) {
                where.id = { notIn: answeredIds };
            }

            // 4. Fetch available questions
            let questions = await prisma.question.findMany({
                where,
                include: {
                    choices: true,
                    category: true,
                },
                take: 100, // Fetch a pool to randomize from
            });

            // 5. Reset Logic: If no questions left, reset history and fetch again
            if (questions.length === 0) {
                // Check if there are ANY questions available for this user (ignoring history)
                // If so, it means they finished them all.
                const totalAvailable = await prisma.question.count({
                    where: userRole === 'STUDENT' ? { category: { isFree: true } } : {}
                });

                if (totalAvailable > 0) {
                    // Reset history
                    await prisma.userQuestionHistory.deleteMany({
                        where: { userId }
                    });

                    // Fetch again
                    questions = await prisma.question.findMany({
                        where: userRole === 'STUDENT' ? { category: { isFree: true } } : {},
                        include: {
                            choices: true,
                            category: true,
                        },
                        take: 100,
                    });
                }
            }

            // 6. Randomize and Slice
            const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, quizLimit);

            // Sanitize
            const sanitized = shuffled.map(q => ({
                ...q,
                text: q.text.replace(/\s*\(plusieurs\s+réponses?\)/gi, '').trim(),
                choices: q.choices
                    .sort(() => 0.5 - Math.random())
                    .map(c => ({ id: c.id, text: c.text, questionId: c.questionId })),
            }));

            return res.json(sanitized);
        }

        // --- Normal Quiz Logic (Existing) ---

        // If category is provided (name), find the category first or filter by relation
        if (category) {
            const cat = await prisma.category.findUnique({ where: { name: category } });
            if (cat) {
                where.categoryId = cat.id;
            } else {
                return res.json([]);
            }
        }

        if (difficulty) where.difficulty = difficulty;

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

        // Remove isCorrect from choices and shuffle them
        const sanitized = shuffled.map(q => ({
            ...q,
            text: q.text.replace(/\s*\(plusieurs\s+réponses?\)/gi, '').trim(),
            choices: q.choices
                .sort(() => 0.5 - Math.random()) // Shuffle choices
                .map(c => ({ id: c.id, text: c.text, questionId: c.questionId })),
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

        // --- Save Question History ---
        // We save all answered questions (correct or not) to history so they aren't repeated in "Quiz Rapide"
        // Use createMany with skipDuplicates if supported, or loop.
        // Prisma createMany skipDuplicates is supported in recent versions.
        if (questionIds.length > 0) {
            await prisma.userQuestionHistory.createMany({
                data: questionIds.map(qId => ({
                    userId,
                    questionId: qId,
                    isCorrect: details.find(d => d.questionId === qId)?.isCorrect || false
                })),
                skipDuplicates: true
            });
        }

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
