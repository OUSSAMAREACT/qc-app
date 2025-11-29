import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
import fs from 'fs';

const prisma = new PrismaClient();

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { originalname, mimetype, buffer } = req.file;
        let content = "";
        let type = "TXT";

        if (mimetype === 'application/pdf') {
            type = "PDF";
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

                const render_page = (pageData) => {
                    let render_options = {
                        normalizeWhitespace: false,
                        disableCombineTextItems: false
                    }

                    return pageData.getTextContent(render_options)
                        .then(function (textContent) {
                            let lastY, text = '';
                            for (let item of textContent.items) {
                                if (lastY == item.transform[5] || !lastY) {
                                    text += item.str;
                                }
                                else {
                                    text += '\n' + item.str;
                                }
                                lastY = item.transform[5];
                            }
                            return `\n--- PAGE ${pageData.pageNumber} ---\n${text}`;
                        });
                }

                const options = {
                    pagerender: render_page
                }

                const data = await pdfParse(buffer, options);
                content = data.text;
            }
            // Fallback for default export weirdness
            else if (pdfParse.default && typeof pdfParse.default === 'function') {
                console.log('Using pdf-parse v1 (Default export function)');

                const render_page = (pageData) => {
                    let render_options = {
                        normalizeWhitespace: false,
                        disableCombineTextItems: false
                    }

                    return pageData.getTextContent(render_options)
                        .then(function (textContent) {
                            let lastY, text = '';
                            for (let item of textContent.items) {
                                if (lastY == item.transform[5] || !lastY) {
                                    text += item.str;
                                }
                                else {
                                    text += '\n' + item.str;
                                }
                                lastY = item.transform[5];
                            }
                            return `\n--- PAGE ${pageData.pageNumber} ---\n${text}`;
                        });
                }

                const options = {
                    pagerender: render_page
                }

                const data = await pdfParse.default(buffer, options);
                content = data.text;
            }
            else {
                throw new Error(`Unsupported pdf-parse version. Exports: ${Object.keys(pdfParse).join(', ')}`);
            }
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            type = "DOCX";
            const result = await mammoth.extractRawText({ buffer: buffer });
            content = result.value;
            if (result.messages.length > 0) {
                console.log("Mammoth messages:", result.messages);
            }
        } else if (mimetype === 'text/plain') {
            type = "TXT";
            content = buffer.toString('utf-8');
        } else {
            return res.status(400).json({ message: "Unsupported file type. Only PDF, DOCX, and TXT are allowed." });
        }

        // Basic cleaning of content (remove excessive whitespace)
        content = content.replace(/\s+/g, ' ').trim();

        const document = await prisma.knowledgeBaseDocument.create({
            data: {
                title: originalname,
                filename: originalname,
                content: content,
                type: type,
                category: req.body.category || null
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
                category: true,
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
export const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category } = req.body;

        const document = await prisma.knowledgeBaseDocument.update({
            where: { id: parseInt(id) },
            data: {
                title: title,
                category: category
            }
        });

        res.json(document);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Failed to update document" });
    }
};
