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
            take: 1, // OPTIMIZATION: Limit to 1 document to save tokens
            orderBy: { createdAt: 'desc' }
        });

        if (documents.length === 0) {
            return res.status(404).json({
                message: "Aucun document de référence trouvé. Veuillez en ajouter dans la Base Documentaire."
            });
        }

        // OPTIMIZATION: Truncate content to ~20k chars to avoid huge bills
        // A standard PDF page is ~2-3k chars. 20k chars is ~7-10 pages.
        const MAX_CONTEXT_LENGTH = 20000;
        const contextText = documents.map(doc => {
            let content = doc.content;
            if (content.length > MAX_CONTEXT_LENGTH) {
                content = content.substring(0, MAX_CONTEXT_LENGTH) + "\n...[TRUNCATED]...";
            }
            return `--- DOCUMENT: ${doc.title} ---\n${content}\n`;
        }).join("\n");

        // 2. Construct Prompt
        const prompt = `
Tu es un Tuteur Expert en Soins Infirmiers pour les étudiants marocains (ISPITS/ENSP).
Ton objectif est d'expliquer pourquoi une réponse spécifique est correcte ou incorrecte en te basant STRICTEMENT sur les documents officiels fournis.

CONTEXTE (Lois et Guides Officiels) :
${contextText}

QUESTION :
${questionText}

CHOIX :
${choices ? choices.map(c => `- ${c.text} ${c.isCorrect ? '(Correct)' : ''}`).join('\n') : ''}

RÉPONSE DE L'ÉTUDIANT : ${userAnswer}
RÉPONSE CORRECTE : ${correctAnswer}
NOM DE L'ÉTUDIANT : ${userName || "Candidat"}

INSTRUCTIONS STRICTES :
1. **LANGUE :** Tu dois TOUJOURS répondre en FRANÇAIS. Ne réponds JAMAIS en anglais.
2. **Salutation :** Commence par : "Bonjour ${userName || "Candidat"}, vous avez choisi..."
3. **Explication :** Explique spécifiquement pourquoi la réponse de l'étudiant est fausse (le cas échéant) et pourquoi la réponse correcte est juste.
4. **SOURCES :** CITE TES SOURCES. Utilise les titres des documents fournis dans le contexte (ex: "Selon la Loi 43-13..."). IMPORTANT : Les documents contiennent des marqueurs de page comme "--- PAGE 15 ---". Utilise ces marqueurs pour citer le numéro de page précis (ex: "Page 15"). Ignore les autres numéros de page trouvés dans le texte.
5. **Absence de contexte :** Si la réponse ne se trouve PAS dans le contexte, dis clairement : "Je ne trouve pas la réponse exacte dans les documents fournis, mais voici une explication générale..." (et fournis une explication médicale générale).
6. **Ton :** Sois concis, encourageant et professionnel.
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
