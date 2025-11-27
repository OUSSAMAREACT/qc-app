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
