import prisma from '../prisma.js';
import { sendReplyNotificationEmail } from '../services/emailService.js';

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
            orderBy: { createdAt: 'asc' }
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

        // Fetch current user to get name for notification
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });
        const userName = currentUser?.name || 'Utilisateur';

        // --- Notification Logic ---
        // 1. Find all Admins
        const admins = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'SUPER_ADMIN'] },
                id: { not: userId } // Don't notify self if admin
            },
            select: { id: true }
        });

        // 2. Find all participants (users who commented on this question)
        const participants = await prisma.comment.findMany({
            where: {
                questionId: parseInt(questionId),
                userId: { not: userId } // Don't notify self
            },
            distinct: ['userId'],
            select: { userId: true }
        });

        // Combine unique recipients
        const recipientIds = new Set([
            ...admins.map(a => a.id),
            ...participants.map(p => p.userId)
        ]);

        // Create notifications
        const notificationsData = Array.from(recipientIds).map(recipientId => ({
            userId: recipientId,
            type: 'COMMENT',
            message: `Nouveau commentaire de ${userName} sur une question.`,
            link: `/result?questionId=${questionId}`,
            read: false
        }));

        if (notificationsData.length > 0) {
            await prisma.notification.createMany({
                data: notificationsData
            });

            // Send Email Notifications (Async)
            // We need to fetch emails for these users
            const recipients = await prisma.user.findMany({
                where: { id: { in: Array.from(recipientIds) } },
                select: { email: true }
            });

            recipients.forEach(recipient => {
                sendReplyNotificationEmail(recipient.email, userName, questionId);
            });
        }
        // --------------------------

        res.json(comment);
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ message: "Erreur lors de l'ajout du commentaire." });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(id) }
        });

        if (!comment) {
            return res.status(404).json({ message: "Commentaire non trouvé." });
        }

        // Allow deletion if user is Admin, Super Admin, or the author of the comment
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && comment.userId !== userId) {
            return res.status(403).json({ message: "Non autorisé." });
        }

        await prisma.comment.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Commentaire supprimé." });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ message: "Erreur lors de la suppression du commentaire." });
    }
};
