import prisma from '../prisma.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to last 20 notifications
        });
        res.json(notifications);
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des notifications." });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        if (id === 'all') {
            await prisma.notification.updateMany({
                where: { userId, read: false },
                data: { read: true }
            });
        } else {
            await prisma.notification.update({
                where: { id: parseInt(id), userId },
                data: { read: true }
            });
        }

        res.json({ message: "Notification(s) marquée(s) comme lue(s)." });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la notification." });
    }
};

// Internal Helper
export const createNotification = async (userId, type, message, link) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                link,
                read: false
            }
        });
    } catch (error) {
        console.error("Create notification error:", error);
    }
};

// Admin Broadcast
import { sendAnnouncementEmail } from '../services/emailService.js';

export const sendAnnouncement = async (req, res) => {
    try {
        const { subject, message, type } = req.body; // type: 'EMAIL', 'IN_APP', 'BOTH'

        // Get all users
        const users = await prisma.user.findMany({
            where: { status: 'ACTIVE' }, // Only active users
            select: { id: true, email: true }
        });

        if (type === 'IN_APP' || type === 'BOTH') {
            const notifications = users.map(user => ({
                userId: user.id,
                type: 'ANNOUNCEMENT',
                message: subject, // Use subject as short message
                link: '/dashboard', // Generic link
                read: false
            }));

            // Bulk create notifications
            await prisma.notification.createMany({
                data: notifications
            });
        }

        if (type === 'EMAIL' || type === 'BOTH') {
            // Send emails in background with rate limiting (1 email every 600ms to stay under 2/sec)
            const sendEmailsWithDelay = async () => {
                for (const user of users) {
                    await sendAnnouncementEmail(user.email, subject, message);
                    await new Promise(resolve => setTimeout(resolve, 600)); // Wait 600ms
                }
            };
            sendEmailsWithDelay(); // Start background process
        }

        res.json({ message: `Annonce envoyée à ${users.length} utilisateurs.` });
    } catch (error) {
        console.error("Send announcement error:", error);
        res.status(500).json({ message: "Erreur lors de l'envoi de l'annonce." });
    }
};
