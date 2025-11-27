import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendConfirmationEmail, sendPasswordResetEmail } from '../services/emailService.js';

export const register = async (req, res) => {
    try {
        const { email, password, name, specialtyId } = req.body;

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
                specialtyId: specialtyId ? parseInt(specialtyId) : null,
            },
            include: { specialty: true }
        });

        // Generate token
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // Send confirmation email
        await sendConfirmationEmail(user.email, user.name);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                specialty: user.specialty,
                onboardingCompleted: user.onboardingCompleted
            }
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
        const user = await prisma.user.findUnique({
            where: { email },
            include: { specialty: true }
        });
        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // Check status (Admins bypass this check)
        // We allow PENDING users to login now, but frontend will redirect them

        if (user.status === 'REJECTED') {
            return res.status(403).json({
                message: "Compte désactivé.",
                code: "ACCOUNT_REJECTED"
            });
        }

        // Auto-promote Super Admin (Hardcoded for safety/recovery)
        // Case-insensitive check
        console.log(`[LOGIN DEBUG] Checking auto-promotion for: ${user.email}, Current Role: ${user.role}`);
        if (user.email.toLowerCase() === 'oussamaqarbach@gmail.com') {
            console.log("[LOGIN DEBUG] Email matches Super Admin target.");
            try {
                if (user.role !== 'SUPER_ADMIN') {
                    console.log("[LOGIN DEBUG] Role is not SUPER_ADMIN. Attempting DB update...");
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: 'SUPER_ADMIN' }
                    });
                    console.log("[LOGIN DEBUG] DB update successful.");
                } else {
                    console.log("[LOGIN DEBUG] User is already SUPER_ADMIN in DB.");
                }
            } catch (e) {
                console.error("[LOGIN DEBUG] Auto-promotion DB update failed:", e);
            }
            // Force role in local object so token is generated with SUPER_ADMIN
            user.role = 'SUPER_ADMIN';
            console.log("[LOGIN DEBUG] Forced local user.role to SUPER_ADMIN for token generation.");
        }

        // Generate token
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        console.log(`[LOGIN DEBUG] Token generated with role: ${user.role}`);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                specialty: user.specialty,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Erreur lors de la connexion." });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { specialty: true, badges: true }
        });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                specialty: user.specialty,
                badges: user.badges,
                onboardingCompleted: user.onboardingCompleted
            }
        });
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

        // Allow setting specialty ONLY if it's currently null
        if (req.body.specialtyId) {
            if (user.specialtyId === null) {
                updates.specialtyId = parseInt(req.body.specialtyId);
            } else {
                // If user tries to change it but already has one, we can either ignore or throw error.
                // Let's ignore it to be safe, or return a message if strict.
                // For now, we'll just ignore it if they already have one, effectively making it immutable.
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updates,
            include: { specialty: true } // Include specialty to return it
        });

        res.json({
            message: "Profil mis à jour avec succès.",
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                specialty: updatedUser.specialty, // Return full specialty object
                onboardingCompleted: updatedUser.onboardingCompleted
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du profil." });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: "Email de réinitialisation envoyé." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: "Jeton invalide ou expiré." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe." });
    }
};
