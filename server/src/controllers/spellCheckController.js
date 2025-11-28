import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from "@google/genai";

const prisma = new PrismaClient();

// Initialize Gemini AI
// Using the key directly as verified in testing
const ai = new GoogleGenAI({ apiKey: "AIzaSyAMZzszrUCxuUSBo1I7VraT_wSDuMllHMM" });

export const scanQuestions = async (req, res) => {
    try {
        // Fetch all questions
        const questions = await prisma.question.findMany({
            orderBy: { id: 'asc' }
        });

        // Fetch ignored words to filter locally if needed, though we'll ask AI to ignore medical terms
        const ignoredWords = await prisma.ignoredWord.findMany();
        const ignoredSet = new Set(ignoredWords.map(iw => iw.word.toLowerCase()));

        const results = [];
        const BATCH_SIZE = 15; // Process in chunks to respect token limits

        for (let i = 0; i < questions.length; i += BATCH_SIZE) {
            const batch = questions.slice(i, i + BATCH_SIZE);

            // Prepare prompt content
            const questionsText = batch.map(q => `ID: ${q.id}\nText: ${q.text}`).join('\n\n');

            const prompt = `
You are a professional proofreader for French medical exams. 
Analyze the following questions for spelling and grammar errors.

RULES:
1. Identify REAL typos (e.g., "iniative" -> "initiative", "tachycardie" -> "tachycardie" is correct).
2. IGNORE technical medical terms, drug names, and proper nouns unless they are clearly misspelled.
3. IGNORE ignored words: ${Array.from(ignoredSet).join(', ')}.
4. Return ONLY a JSON array.

FORMAT:
[
  { 
    "id": 123, 
    "corrections": [
      { "original": "iniative", "correction": "initiative" }
    ],
    "suggestion": "Corrected sentence or explanation" 
  }
]

If a question has no errors, DO NOT include it in the array.

QUESTIONS TO ANALYZE:
${questionsText}
`;

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-3-pro-preview",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });

                const responseText = response.text;
                // Clean up markdown code blocks if present
                const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();

                let batchResults = [];
                try {
                    batchResults = JSON.parse(jsonStr);
                } catch (e) {
                    console.error("Failed to parse Gemini JSON response:", responseText);
                    continue;
                }

                // Merge with original question data
                if (Array.isArray(batchResults)) {
                    for (const result of batchResults) {
                        const originalQ = batch.find(q => q.id === result.id);
                        if (originalQ) {
                            results.push({
                                ...originalQ,
                                corrections: result.corrections || [],
                                suggestion: result.suggestion
                            });
                        }
                    }
                }
            } catch (err) {
                console.error(`Error processing batch ${i}: `, err);
                // Continue to next batch instead of failing everything
            }
        }

        res.json(results);

    } catch (error) {
        console.error("AI Spell check scan failed", error);
        res.status(500).json({ message: "Scan failed" });
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
