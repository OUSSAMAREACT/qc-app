import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: "Accès non autorisé. Token manquant." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide ou expiré." });
        }

        // Check for Premium Expiration
        if (user.role === 'PREMIUM' && user.premiumExpiresAt) {
            const expiresAt = new Date(user.premiumExpiresAt);
            if (expiresAt < new Date()) {
                // Expired! Downgrade for this request
                user.role = 'STUDENT';
                // Optional: Trigger async DB update to persist downgrade
                // prisma.user.update({ where: { id: user.userId }, data: { role: 'STUDENT' } }).catch(console.error);
            }
        }

        req.user = user;
        next();
    });
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Accès réservé aux administrateurs." });
    }
    next();
};

export const requireSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Accès réservé aux super administrateurs." });
    }
    next();
};
