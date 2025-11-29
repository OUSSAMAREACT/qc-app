import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY;

// Lazy load AI client
const getAI = () => {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    return new GoogleGenAI({ apiKey });
};

export const explainWithContext = async (req, res) => {
    try {
        const { questionText, userAnswer, correctAnswer, choices, userName, category } = req.body;

        if (!questionText) {
            return res.status(400).json({ message: "Question text is required" });
        }

        // 1. Retrieve Context
        // Filter by category if provided, otherwise fetch most recent
        const whereClause = category ? { category: category } : {};

        const documents = await prisma.knowledgeBaseDocument.findMany({
            where: whereClause,
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        if (documents.length === 0) {
            return res.status(404).json({
                message: "Aucun document de référence trouvé. Veuillez en ajouter dans la Base Documentaire."
            });
        }

        const contextText = documents.map(doc => `--- DOCUMENT: ${doc.title} ---\n${doc.content}\n`).join("\n");

        // 2. Construct Prompt
        const prompt = `
You are an expert Nursing Tutor for Moroccan students (ISPITS/ENSP).
Your goal is to explain why a specific answer is correct/incorrect based STRICTLY on the provided official documents.

CONTEXT (Official Laws & Guidelines):
${contextText}

QUESTION:
${questionText}

CHOICES:
${choices ? choices.map(c => `- ${c.text} ${c.isCorrect ? '(Correct)' : ''}`).join('\n') : ''}

STUDENT ANSWER: ${userAnswer}
CORRECT ANSWER: ${correctAnswer}
STUDENT NAME: ${userName || "Candidat"}

INSTRUCTIONS:
1. Start by addressing the student formally: "M. ${userName || "Candidat"}, vous avez choisi..." (Use "Mme" if appropriate, but default to "M." or just the name if unsure, or "Bonjour ${userName || "Candidat"}").
2. Explain specifically why the student's answer is wrong (if it is) and why the correct answer is right.
3. CITE YOUR SOURCES. Use the document titles provided in the context (e.g., "Selon la Loi 43-13...").
4. If the answer is NOT found in the context, state clearly: "Je ne trouve pas la réponse exacte dans les documents fournis, mais voici une explication générale..." (and provide a general medical explanation).
5. Keep it concise, encouraging, and professional (French).
`;

        // 3. Call Gemini
        const aiClient = getAI();
        const response = await aiClient.models.generateContent({
            model: "gemini-2.0-flash", // Fast model for interactive tutor
            contents: prompt,
        });

        let explanation = "";
        if (typeof response.text === 'function') {
            explanation = response.text();
        } else if (response.text) {
            explanation = response.text;
        } else {
            explanation = "Erreur de génération de réponse.";
        }

        res.json({ explanation });

    } catch (error) {
        console.error("AI Tutor Error:", error);
        res.status(500).json({ message: "Failed to generate explanation", error: error.message });
    }
};
