import prisma from '../prisma.js';
import path from 'path';
import fs from 'fs';

export const uploadReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier téléchargé." });
        }

        const userId = req.user.userId;
        const receiptUrl = `/uploads/receipts/${req.file.filename}`;

        // Check if user already has a pending payment
        const existingPayment = await prisma.payment.findFirst({
            where: {
                userId: userId,
                status: 'PENDING'
            }
        });

        if (existingPayment) {
            // Update existing pending payment
            // Optionally delete old file here if needed
            await prisma.payment.update({
                where: { id: existingPayment.id },
                data: { receiptUrl }
            });
            return res.json({ message: "Reçu mis à jour avec succès.", receiptUrl });
        }

        // Create new payment
        const payment = await prisma.payment.create({
            data: {
                userId,
                receiptUrl,
                status: 'PENDING'
            }
        });

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

        // Transaction: Approve payment AND Upgrade user
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: parseInt(id) },
                data: { status: 'APPROVED' }
            }),
            prisma.user.update({
                where: { id: payment.userId },
                data: { role: 'PREMIUM' } // Upgrade to PREMIUM
            })
        ]);

        res.json({ message: "Paiement approuvé. L'utilisateur est maintenant PREMIUM." });
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
