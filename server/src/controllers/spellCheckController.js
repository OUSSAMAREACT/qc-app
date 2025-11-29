import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from "@google/genai";

const prisma = new PrismaClient();

// Lazy initialization of Gemini AI
let ai;

const getAI = () => {
    if (!ai) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables!");
            throw new Error("API Key missing");
        }
        console.log("GEMINI_API_KEY loaded successfully (starts with: " + apiKey.substring(0, 4) + "...)");
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

export const scanQuestions = async (req, res) => {
    try {
        // Pagination parameters
        const take = req.query.take ? parseInt(req.query.take) : undefined;
        const skip = req.query.skip ? parseInt(req.query.skip) : undefined;

        console.log(`Spell check request: skip=${skip}, take=${take}`);

        const questions = await prisma.question.findMany({
            orderBy: { id: 'asc' },
            take: take,
            skip: skip,
            include: { choices: true }
        });

        if (questions.length === 0) {
            return res.json([]);
        }

        console.log(`Processing ${questions.length} questions...`);

        // Fetch ignored words
        const ignoredWords = await prisma.ignoredWord.findMany();
        const ignoredSet = new Set(ignoredWords.map(iw => iw.word.toLowerCase()));

        const results = [];
        const batchSize = 15; // Process in batches to avoid limits

        for (let i = 0; i < questions.length; i += batchSize) {
            console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(questions.length / batchSize)}...`);
            const batch = questions.slice(i, i + batchSize);

            // Prepare batch text
            const questionsText = batch.map(q => `ID: ${q.id}\nText: ${q.text}`).join('\n\n');

            const prompt = `
You are an expert French medical editor and linguist.
Your task is to review medical exam questions for:
1. **Spelling & Grammar (STRICT)**: Fix ALL typos, agreement errors, and conjugation mistakes.
2. **Academic Style (PROFESSIONAL)**: Suggest improvements if the phrasing is awkward, informal, or unclear.

CRITICAL INSTRUCTIONS:
- **"santée" is ALWAYS a mistake.** It must be corrected to "santé".
- **"acceuil" is ALWAYS a mistake.** It must be corrected to "accueil".
- **"tachycardie"** is correct. Do not change technical terms if they are spelled correctly.
- IGNORE ignored words: ${Array.from(ignoredSet).join(', ')}.

OUTPUT FORMAT (JSON Array):
[
    {
        "id": 123,
        "corrections": [
            { "original": "santée", "correction": "santé" }
        ],
        "improved_text": "Optional: Provide a fully rewritten version ONLY if the original style is poor or contains multiple errors. If the style is good, leave this null.",
        "critique": "Optional: Brief explanation of why the style was improved."
    }
]

If a question is perfect (no typos, good style), DO NOT include it in the array.

QUESTIONS TO ANALYZE:
${questionsText}
`;

            try {
                const aiClient = getAI();
                const response = await aiClient.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });

                // Handle response.text being a property or function depending on SDK version
                let responseText;
                if (typeof response.text === 'function') {
                    responseText = response.text();
                } else if (response.text) {
                    responseText = response.text;
                } else {
                    console.warn("Unexpected Gemini response structure:", Object.keys(response));
                    responseText = JSON.stringify(response);
                }

                console.log(`AI Response for batch ${i}:`, responseText); // DEBUG LOG
                // Clean markdown if present
                const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();

                let batchResults = [];
                try {
                    batchResults = JSON.parse(jsonStr);
                } catch (e) {
                    console.error("Failed to parse Gemini JSON response:", responseText);
                    continue;
                }

                if (Array.isArray(batchResults)) {
                    for (const result of batchResults) {
                        const originalQ = batch.find(q => q.id === result.id);
                        if (originalQ) {
                            results.push({
                                ...originalQ,
                                corrections: result.corrections || [],
                                improved_text: result.improved_text,
                                critique: result.critique || result.suggestion // Fallback for older prompt versions
                            });
                        }
                    }
                }

            } catch (err) {
                console.error(`Error processing batch ${i}:`, err);
            }
        }

        res.json(results);

    } catch (error) {
        console.error("AI Spell check scan failed", error);
        let errorMessage = "Scan failed";
        if (error.response) {
            errorMessage = `AI Error: ${error.response.status} ${error.response.statusText || ''}`;
        } else if (error.message) {
            errorMessage = `AI Error: ${error.message}`;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const ignoreWord = async (req, res) => {
    const { word } = req.body;
    try {
        await prisma.ignoredWord.create({
            data: { word: word.toLowerCase() }
        });
        res.json({ success: true });
    } catch (error) {
        if (error.code === 'P2002') {
            res.json({ success: true });
        } else {
            res.status(500).json({ message: "Failed to ignore word" });
        }
    }
};

export const getQuestionCount = async (req, res) => {
    try {
        const count = await prisma.question.count();
        res.json({ count });
    } catch (error) {
        console.error("Failed to get question count", error);
        res.status(500).json({ message: "Failed to get count" });
    }
};
