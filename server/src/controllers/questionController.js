import prisma from '../prisma.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDir = path.join(__dirname, '../../uploads/audio');

export const getQuestions = async (req, res) => {
    try {
        const { categoryId, difficulty } = req.query;
        const userId = req.user?.userId; // Assuming auth middleware populates this

        // Access Control Logic
        if (userId) {
            const user = await prisma.user.findUnique({ where: { id: userId } });

            // If user is a basic STUDENT (Freemium), enforce restrictions
            if (user && user.role === 'STUDENT') {
                if (categoryId) {
                    // Check if the requested category is free
                    const category = await prisma.category.findUnique({ where: { id: parseInt(categoryId) } });
                    if (category && !category.isFree) {
                        return res.status(403).json({ message: "Accès réservé aux membres Premium." });
                    }
                } else {
                    // If no specific category requested, only return questions from free categories
                    // This might be used for "Random Quiz" across all available modules
                    // We need to filter where category.isFree = true
                    // However, prisma where clause needs to be adjusted.
                }
            }
        }

        const where = {};
        if (categoryId) where.categoryId = parseInt(categoryId);
        if (difficulty) where.difficulty = difficulty;

        // Apply Freemium filter for students if no specific category was checked above (or if we want to be double safe)
        // Actually, let's do it cleanly:
        if (req.user?.role === 'STUDENT') {
            // If fetching by specific category, we already checked it above (or will check it).
            // If fetching general list, enforce isFree.
            where.category = { isFree: true };
        }

        const questions = await prisma.question.findMany({
            where,
            include: {
                choices: true,
                category: true,
            },
        });
        res.json(questions);
    } catch (error) {
        console.error("Get questions error:", error);
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
            const existingQuestion = await prisma.question.findUnique({ where: { id: parseInt(id) } });

            // Check if text changed to cleanup audio
            let audioFileUpdate = undefined;
            if (existingQuestion.audioFile && existingQuestion.text !== text) {
                try {
                    const filePath = path.join(audioDir, existingQuestion.audioFile);
                    await fs.unlink(filePath);
                    console.log(`Deleted old audio file: ${filePath}`);
                } catch (err) {
                    console.error(`Failed to delete old audio file: ${err.message}`);
                }
                audioFileUpdate = null; // Reset audio file in DB
            }

            const q = await prisma.question.update({
                where: { id: parseInt(id) },
                data: {
                    text,
                    categoryId: parseInt(categoryId),
                    difficulty,
                    explanation,
                    audioFile: audioFileUpdate // Will be null if text changed, or undefined (unchanged) otherwise
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
        const question = await prisma.question.findUnique({ where: { id: parseInt(id) } });

        if (question && question.audioFile) {
            try {
                const filePath = path.join(audioDir, question.audioFile);
                await fs.unlink(filePath);
                console.log(`Deleted audio file for deleted question: ${filePath}`);
            } catch (err) {
                console.error(`Failed to delete audio file: ${err.message}`);
            }
        }

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
