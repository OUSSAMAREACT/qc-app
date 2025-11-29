import prisma from '../prisma.js';

// Get questions with no choices
export const getQuestionsWithoutChoices = async (req, res) => {
    try {
        const questions = await prisma.question.findMany({
            where: {
                choices: {
                    none: { isCorrect: true } // Finds questions where NO choice is marked as correct
                }
            },
            include: {
                category: {
                    select: {
                        name: true,
                        specialty: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(questions);
    } catch (error) {
        console.error("Error fetching questions without choices:", error);
        res.status(500).json({ message: "Failed to fetch broken questions." });
    }
};

// Delete a specific broken question
export const deleteBrokenQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.question.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Question deleted." });
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ message: "Failed to delete question." });
    }
};

// Bulk delete all broken questions
export const bulkDeleteBrokenQuestions = async (req, res) => {
    try {
        const result = await prisma.question.deleteMany({
            where: {
                choices: {
                    none: { isCorrect: true }
                }
            }
        });
        res.json({ message: `${result.count} questions deleted.` });
    } catch (error) {
        console.error("Error bulk deleting questions:", error);
        res.status(500).json({ message: "Failed to delete questions." });
    }
};
