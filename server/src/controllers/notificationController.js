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
