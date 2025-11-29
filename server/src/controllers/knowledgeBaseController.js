import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pdfParse = require('pdf-parse');

// Handle CommonJS/ESM interop: if it's an object with .default, use that
if (typeof pdfParse !== 'function' && pdfParse.default) {
    pdfParse = pdfParse.default;
}
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
            console.log('--- DEBUG PDF-PARSE ---');
            console.log('Type:', typeof pdfParse);
            console.log('Is Array:', Array.isArray(pdfParse));
            console.log('Keys:', Object.keys(pdfParse));
            console.log('String representation:', pdfParse.toString());
            if (pdfParse.default) {
                console.log('Has .default:', typeof pdfParse.default);
            }
            console.log('-----------------------');

            if (typeof pdfParse !== 'function') {
                // Try .default
                if (pdfParse.default && typeof pdfParse.default === 'function') {
                    console.log('Using .default as function');
                    const data = await pdfParse.default(buffer);
                    content = data.text;
                }
                // Try .PDFParse (based on debug logs showing this key)
                else if (pdfParse.PDFParse) {
                    console.log('Using .PDFParse with new');
                    const instance = new pdfParse.PDFParse(buffer);
                    console.log('Instance keys:', Object.keys(instance));

                    // Standard pdf-parse pattern: new PDFParse(...).promise
                    if (instance.promise) {
                        console.log('Found .promise on instance, awaiting it...');
                        const data = await instance.promise;
                        console.log('Data keys:', Object.keys(data || {}));
                        content = data.text;
                    } else {
                        console.log('No .promise found, trying to await instance directly...');
                        const data = await instance;
                        console.log('Data keys (direct await):', Object.keys(data || {}));
                        content = data ? data.text : '';
                    }
                }
                else {
                    throw new Error(`pdf-parse library is not a function. It is: ${typeof pdfParse}. Keys: ${Object.keys(pdfParse).join(', ')}`);
                }
            } else {
                const data = await pdfParse(buffer);
                content = data.text;
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
