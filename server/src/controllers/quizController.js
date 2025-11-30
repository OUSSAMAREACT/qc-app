import prisma from '../prisma.js';

export const startQuiz = async (req, res) => {
    try {
        const { category, difficulty, limit = 20, mode } = req.query;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const where = {};

        // --- Boîte à Erreurs Logic ---
        if (mode === 'mistakes') {
            const mistakes = await prisma.userMistake.findMany({
                where: { userId },
                include: {
                    question: {
                        include: {
                            choices: true,
                            category: true,
                        }
                    }
                },
                take: parseInt(limit) || 50
            });

            const questions = mistakes.map(m => m.question);

            // Randomize
            const shuffled = questions.sort(() => 0.5 - Math.random());

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

            // --- Boîte à Erreurs Update ---
            if (isCorrect) {
                // If correct, remove from mistakes if it exists
                await prisma.userMistake.deleteMany({
                    where: { userId, questionId: question.id }
                });
            } else {
                // If incorrect, add to mistakes (upsert to avoid duplicates)
                try {
                    await prisma.userMistake.upsert({
                        where: { userId_questionId: { userId, questionId: question.id } },
                        update: { addedAt: new Date() },
                        create: { userId, questionId: question.id }
                    });
                } catch (e) {
                    // Ignore unique constraint errors
                }
            }
        }

        // Save result
        const savedResult = await prisma.quizResult.create({
            data: {
                userId,
                score,
                totalQuestions,
                categoryName: req.body.categoryName || "Général",
                answers: answers, // Save detailed answers
            },
        });

        // Update Gamification Stats
        const { updateGamificationStats } = await import('../services/gamificationService.js');
        await updateGamificationStats(userId, totalQuestions);

        // --- Save Question History ---
        if (questionIds.length > 0) {
            // We loop to handle upsert properly for history
            for (const detail of details) {
                try {
                    await prisma.userQuestionHistory.upsert({
                        where: { userId_questionId: { userId, questionId: detail.questionId } },
                        update: { isCorrect: detail.isCorrect, answeredAt: new Date() },
                        create: { userId, questionId: detail.questionId, isCorrect: detail.isCorrect }
                    });
                } catch (e) {
                    // Ignore
                }
            }
        }

        res.json({
            id: savedResult.id, // Return ID for redirection
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

export const getQuizResult = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await prisma.quizResult.findUnique({
            where: { id: parseInt(id) },
        });

        if (!result) {
            return res.status(404).json({ message: "Résultat non trouvé." });
        }

        if (result.userId !== userId) {
            return res.status(403).json({ message: "Accès refusé." });
        }

        // If answers are stored, we can reconstruct the details
        // Note: This assumes questions/choices haven't been deleted.
        // For a robust system, we might want to snapshot the questions at the time of quiz.
        // But for now, we'll fetch current questions.

        let details = null;
        if (result.answers && Array.isArray(result.answers)) {
            const answers = result.answers;
            const questionIds = answers.map(a => a.questionId);

            const questions = await prisma.question.findMany({
                where: { id: { in: questionIds } },
                include: { choices: true },
            });

            details = answers.map(answer => {
                const question = questions.find(q => q.id === answer.questionId);
                if (!question) return null;

                const correctChoiceIds = question.choices.filter(c => c.isCorrect).map(c => c.id);
                const selectedIds = answer.selectedChoiceIds || [];

                // Determine correctness again (or trust stored score, but per-question is better re-calc)
                const sortedCorrect = correctChoiceIds.sort((a, b) => a - b);
                const sortedSelected = selectedIds.sort((a, b) => a - b);
                const isCorrect = JSON.stringify(sortedCorrect) === JSON.stringify(sortedSelected);

                return {
                    questionId: question.id,
                    questionText: question.text,
                    explanation: question.explanation,
                    choices: question.choices.map(c => ({ id: c.id, text: c.text, isCorrect: c.isCorrect })),
                    isCorrect,
                    correctChoiceIds,
                    userSelectedIds: selectedIds,
                };
            }).filter(Boolean);
        }

        res.json({ ...result, details });

    } catch (error) {
        console.error("Get quiz result error:", error);
        res.status(500).json({ message: "Erreur lors de la récupération du résultat." });
    }
};
