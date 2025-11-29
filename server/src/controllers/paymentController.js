import prisma from '../prisma.js';
import { sendPaymentApprovedEmail, sendReceiptUploadedEmail } from '../services/emailService.js';
import { createNotification } from './notificationController.js';
import path from 'path';
import fs from 'fs';

export const uploadReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier téléchargé." });
        }

        const userId = req.user.userId;
        const receiptUrl = `/uploads/receipts/${req.file.filename}`;
        const { planType } = req.body; // "1_MONTH", "3_MONTHS", "1_YEAR"

        // Check if user already has a pending payment
        const existingPayment = await prisma.payment.findFirst({
            where: {
                userId: userId,
                status: 'PENDING'
            }
        });

        if (existingPayment) {
            // Update existing pending payment
            await prisma.payment.update({
                where: { id: existingPayment.id },
                data: {
                    receiptUrl,
                    planType: planType || existingPayment.planType
                }
            });
            return res.json({ message: "Reçu mis à jour avec succès.", receiptUrl });
        }

        // Create new payment
        const payment = await prisma.payment.create({
            data: {
                userId,
                receiptUrl,
                planType,
                status: 'PENDING'
            }
        });

        // Notify ALL Super Admins
        const superAdmins = await prisma.user.findMany({
            where: { role: 'SUPER_ADMIN' },
            select: { id: true, email: true }
        });

        // Fetch user name for the email
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        const studentName = user?.name || 'Étudiant';

        for (const admin of superAdmins) {
            // Send Email
            sendReceiptUploadedEmail(admin.email, studentName, planType);

            // Send In-App Notification
            createNotification(
                admin.id,
                'PAYMENT',
                `Nouveau reçu de paiement de ${studentName}`,
                '/admin/payments'
            );
        }

        res.status(201).json({ message: "Reçu envoyé avec succès. En attente de validation.", payment });
    } catch (error) {
        console.error("Upload receipt error:", error);
        res.status(500).json({ message: "Erreur lors de l'envoi du reçu." });
    }
};

export const getPayments = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const payments = await prisma.payment.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(payments);
    } catch (error) {
        console.error("Get payments error:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des paiements." });
    }
};

export const approvePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!payment) {
            return res.status(404).json({ message: "Paiement non trouvé." });
        }

        if (payment.status === 'APPROVED') {
            return res.status(400).json({ message: "Ce paiement est déjà approuvé." });
        }

        // Calculate Expiration Date
        let expiresAt = new Date();
        const plan = payment.planType || '1_YEAR'; // Default to 1 year if missing

        switch (plan) {
            case '1_MONTH':
                expiresAt.setDate(expiresAt.getDate() + 30);
                break;
            case '3_MONTHS':
                expiresAt.setDate(expiresAt.getDate() + 90);
                break;
            case '1_YEAR':
                expiresAt.setDate(expiresAt.getDate() + 365);
                break;
            default:
                expiresAt.setDate(expiresAt.getDate() + 365);
        }

        // Transaction: Approve payment AND Upgrade user
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: parseInt(id) },
                data: { status: 'APPROVED' }
            }),
            prisma.user.update({
                where: { id: payment.userId },
                data: {
                    role: 'PREMIUM',
                    premiumExpiresAt: expiresAt
                }
            })
        ]);

        // Format plan name for email
        const planNames = {
            '1_MONTH': 'Mensuel (1 Mois)',
            '3_MONTHS': 'Trimestriel (3 Mois)',
            '1_YEAR': 'Annuel (1 An)'
        };
        const readablePlan = planNames[plan] || plan;

        // Send Email & Notification (Async, don't block response)
        sendPaymentApprovedEmail(payment.user.email, payment.user.name, readablePlan, expiresAt);
        createNotification(payment.userId, 'PAYMENT', "Votre paiement a été approuvé ! Bienvenue Premium.", '/dashboard');

        res.json({ message: "Paiement approuvé. L'utilisateur est maintenant PREMIUM jusqu'au " + expiresAt.toLocaleDateString() });
    } catch (error) {
        console.error("Approve payment error:", error);
        res.status(500).json({ message: "Erreur lors de l'approbation." });
    }
};

export const rejectPayment = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.payment.update({
            where: { id: parseInt(id) },
            data: { status: 'REJECTED' }
        });

        res.json({ message: "Paiement rejeté." });
    } catch (error) {
        console.error("Reject payment error:", error);
        res.status(500).json({ message: "Erreur lors du rejet." });
    }
};
