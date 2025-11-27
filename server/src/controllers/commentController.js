import prisma from '../prisma.js';

export const getComments = async (req, res) => {
    try {
        const { questionId } = req.params;
        const comments = await prisma.comment.findMany({
            where: { questionId: parseInt(questionId) },
            include: {
                user: {
                    select: { id: true, name: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(comments);
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des commentaires." });
    }
};

export const addComment = async (req, res) => {
    try {
        const { questionId, text } = req.body;
        const userId = req.user.userId;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
        }

        const comment = await prisma.comment.create({
            data: {
                text,
                questionId: parseInt(questionId),
                userId
            },
            include: {
                user: {
                    select: { id: true, name: true, role: true }
                }
            }
        });

        res.json(comment);
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ message: "Erreur lors de l'ajout du commentaire." });
    }
};
