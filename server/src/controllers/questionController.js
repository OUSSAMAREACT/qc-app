import prisma from '../prisma.js';

export const getQuestions = async (req, res) => {
    try {
        const { categoryId, difficulty } = req.query;
        const where = {};
        if (categoryId) where.categoryId = parseInt(categoryId);
        if (difficulty) where.difficulty = difficulty;

        const questions = await prisma.question.findMany({
            where,
            include: {
                choices: true,
                category: true,
            },
        });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des questions." });
    }
};

export const getQuestionCount = async (req, res) => {
    try {
        const count = await prisma.question.count();
        // Cache for 5 minutes, allow stale for another 10 minutes
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du comptage des questions." });
    }
};

export const createQuestion = async (req, res) => {
    try {
        const { text, categoryId, difficulty, choices, explanation } = req.body;

        // Validation
        if (!text || !categoryId || !choices || choices.length < 2) {
            return res.status(400).json({ message: "Données invalides." });
        }

        const question = await prisma.question.create({
            data: {
                text,
                categoryId: parseInt(categoryId),
                difficulty,
                explanation,
                choices: {
                    create: choices.map(c => ({
                        text: c.text,
                        isCorrect: c.isCorrect
                    }))
                }
            },
            include: { choices: true, category: true }
        });

        res.status(201).json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la question." });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, categoryId, difficulty, choices, explanation } = req.body;

        // Transaction to update question and choices
        const updatedQuestion = await prisma.$transaction(async (prisma) => {
            // Update basic info
            const q = await prisma.question.update({
                where: { id: parseInt(id) },
                data: {
                    text,
                    categoryId: parseInt(categoryId),
                    difficulty,
                    explanation
                }
            });

            // Delete existing choices and recreate (using Promise.all for SQLite compatibility reliability)
            await prisma.choice.deleteMany({ where: { questionId: parseInt(id) } });

            await Promise.all(choices.map(c =>
                prisma.choice.create({
                    data: {
                        text: c.text,
                        isCorrect: c.isCorrect,
                        questionId: parseInt(id)
                    }
                })
            ));

            return prisma.question.findUnique({
                where: { id: parseInt(id) },
                include: { choices: true, category: true }
            });
        });

        res.json(updatedQuestion);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour: " + error.message });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.question.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Question supprimée." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression." });
    }
};

export const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await prisma.question.findUnique({
            where: { id: parseInt(id) },
            include: {
                choices: true,
                category: true,
            },
        });

        if (!question) {
            return res.status(404).json({ message: "Question non trouvée." });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la question." });
    }
};

export const moveQuestions = async (req, res) => {
    try {
        const { questionIds, targetCategoryId } = req.body;

        if (!questionIds || !Array.isArray(questionIds) || !targetCategoryId) {
            return res.status(400).json({ message: "Données invalides." });
        }

        await prisma.question.updateMany({
            where: {
                id: { in: questionIds.map(id => parseInt(id)) }
            },
            data: {
                categoryId: parseInt(targetCategoryId)
            }
        });

        res.json({ message: "Questions déplacées avec succès." });
    } catch (error) {
        console.error("Move questions error:", error);
        res.status(500).json({ message: "Erreur lors du déplacement des questions." });
    }
};

export const deleteQuestionsBatch = async (req, res) => {
    try {
        const { questionIds } = req.body;

        if (!questionIds || !Array.isArray(questionIds)) {
            return res.status(400).json({ message: "Données invalides." });
        }

        await prisma.question.deleteMany({
            where: {
                id: { in: questionIds.map(id => parseInt(id)) }
            }
        });

        res.json({ message: "Questions supprimées avec succès." });
    } catch (error) {
        console.error("Delete questions batch error:", error);
        res.status(500).json({ message: "Erreur lors de la suppression des questions." });
    }
};
