import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // Validate name format
        const nameRegex = /^[a-zA-Z\u00C0-\u00FF\s'-]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: "Le nom ne doit contenir que des lettres, des espaces et des tirets." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: "STUDENT",
            },
        });

        // Generate token
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Erreur lors de l'inscription." });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Erreur lors de la connexion." });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const updates = {};
        if (name) {
            const nameRegex = /^[a-zA-Z\u00C0-\u00FF\s'-]+$/;
            if (!nameRegex.test(name)) {
                return res.status(400).json({ message: "Le nom ne doit contenir que des lettres, des espaces et des tirets." });
            }
            updates.name = name;
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Le mot de passe actuel est requis pour changer de mot de passe." });
            }
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(400).json({ message: "Mot de passe actuel incorrect." });
            }
            updates.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updates,
        });

        res.json({
            message: "Profil mis à jour avec succès.",
            user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du profil." });
    }
};
