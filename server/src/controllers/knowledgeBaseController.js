import { PrismaClient } from '@prisma/client';
import pdfParseLib from 'pdf-parse';

// Handle potential ESM/CJS default export mismatch
const pdfParse = pdfParseLib.default || pdfParseLib;
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
            // Check if we are dealing with v2/v3 (Class based)
            if (pdfParse.PDFParse) {
                console.log('Using pdf-parse v2/v3 (Class based)');
                // The docs say: new PDFParse({ data: buffer })
                const parser = new pdfParse.PDFParse({ data: buffer });
                const result = await parser.getText();
                content = result.text;
            }
            // Check if it's the standard v1 (Function based)
            else if (typeof pdfParse === 'function') {
                console.log('Using pdf-parse v1 (Function based)');
                const data = await pdfParse(buffer);
                content = data.text;
            }
            // Fallback for default export weirdness
            else if (pdfParse.default && typeof pdfParse.default === 'function') {
                console.log('Using pdf-parse v1 (Default export function)');
                const data = await pdfParse.default(buffer);
                content = data.text;
            }
            else {
                throw new Error(`Unsupported pdf-parse version. Exports: ${Object.keys(pdfParse).join(', ')}`);
            }
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
