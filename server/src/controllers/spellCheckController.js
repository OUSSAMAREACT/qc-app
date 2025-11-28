import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use gemini-pro as fallback if flash is not available
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const scanQuestions = async (req, res) => {
    try {
        // Fetch all questions with choices
        const questions = await prisma.question.findMany({
            include: { choices: true }
        });

        // Fetch ignored words
        const ignoredWords = await prisma.ignoredWord.findMany();
        const ignoredSet = new Set(ignoredWords.map(iw => iw.word.toLowerCase()));

        const results = [];
        const BATCH_SIZE = 5; // Smaller batch size for better accuracy

        // Process in batches
        for (let i = 0; i < questions.length; i += BATCH_SIZE) {
            const batch = questions.slice(i, i + BATCH_SIZE);

            // Prepare prompt
            const prompt = `
                You are a proofreader for French medical exams. 
                Analyze the following questions for spelling and grammar errors.
                
                Rules:
                1. Ignore technical medical terms, drug names, and Latin terms.
                2. Ignore proper nouns (author names).
                3. Flag only REAL spelling or grammar mistakes (e.g., "iniative" -> "initiative").
                4. Return a JSON array of objects.
                5. Each object must have: "id" (number), "typos" (array of strings - the exact misspelled words), "correction" (string - the corrected sentence).
                6. Only include questions that have errors.
                7. Do not include questions with no errors.
                8. STRICTLY return valid JSON. No markdown.

                Ignored words: ${Array.from(ignoredSet).join(', ')}

                Questions:
                ${JSON.stringify(batch.map(q => ({ id: q.id, text: q.text })))}
            `;

            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                console.log(`Batch ${i} response:`, text.substring(0, 100) + "..."); // Log first 100 chars

                // Clean up markdown code blocks if present
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

                if (!cleanText || cleanText === '[]') continue;

                const batchResults = JSON.parse(cleanText);

                // Merge with original question data
                batchResults.forEach(resItem => {
                    const originalQuestion = batch.find(q => q.id === resItem.id);
                    if (originalQuestion) {
                        const validTypos = resItem.typos.filter(t => !ignoredSet.has(t.toLowerCase()));

                        if (validTypos.length > 0) {
                            results.push({
                                ...originalQuestion,
                                typos: validTypos,
                                suggestion: resItem.correction
                            });
                        }
                    }
                });

            } catch (err) {
                console.error(`Batch processing failed for index ${i}:`, err);
                // If it's a 404 or authentication error, we should probably stop
                if (err.message.includes('404') || err.message.includes('403')) {
                    throw err;
                }
            }
        }

        res.json(results);

    } catch (error) {
        console.error("Spell check scan failed", error);
        res.status(500).json({ message: "Scan failed: " + error.message });
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
        if (error.code === 'P2002') { // Unique constraint
            res.json({ success: true }); // Already ignored
        } else {
            res.status(500).json({ message: "Failed to ignore word" });
        }
    }
};
