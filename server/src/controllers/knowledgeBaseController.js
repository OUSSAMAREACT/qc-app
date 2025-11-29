import { PrismaClient } from '@prisma/client';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs';

const prisma = new PrismaClient();

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { originalname, mimetype, buffer } = req.file;
        let content = "";

        if (mimetype === 'application/pdf') {
            const data = await pdf(buffer);
            content = data.text;
        } else if (mimetype === 'text/plain') {
            content = buffer.toString('utf-8');
        } else {
            return res.status(400).json({ message: "Unsupported file type. Only PDF and TXT are allowed." });
        }

        // Basic cleaning of content (remove excessive whitespace)
        content = content.replace(/\s+/g, ' ').trim();

        const document = await prisma.knowledgeBaseDocument.create({
            data: {
                title: originalname,
                filename: originalname,
                content: content,
                type: mimetype === 'application/pdf' ? 'PDF' : 'TXT'
            }
        });

        res.status(201).json(document);

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Failed to process document", error: error.message });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.knowledgeBaseDocument.findMany({
            select: {
                id: true,
                title: true,
                filename: true,
                type: true,
                createdAt: true,
                // Exclude content to keep response light
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ message: "Failed to fetch documents" });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.knowledgeBaseDocument.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Failed to delete document" });
    }
};
