import { PrismaClient } from '@prisma/client';
import nspell from 'nspell';
import frDictionary from 'dictionary-fr';

const prisma = new PrismaClient();
let spellChecker = null;

// Initialize spell checker
const initSpellChecker = () => {
    try {
        spellChecker = nspell(frDictionary);
    } catch (err) {
        console.error('Failed to load dictionary', err);
    }
};

initSpellChecker();

export const scanQuestions = async (req, res) => {
    try {
        if (!spellChecker) {
            return res.status(503).json({ message: "Dictionary not loaded yet" });
        }

        // Fetch all questions with choices
        const questions = await prisma.question.findMany({
            include: { choices: true }
        });

        // Fetch ignored words
        const ignoredWords = await prisma.ignoredWord.findMany();
        const ignoredSet = new Set(ignoredWords.map(iw => iw.word.toLowerCase()));

        const results = [];

        for (const q of questions) {
            const text = q.text;
            // Improved tokenization: match words including accents, ignoring punctuation
            // This regex matches sequences of letters (including French accents)
            const words = text.match(/[a-zA-Z\u00C0-\u00FF]+(?:[''-][a-zA-Z\u00C0-\u00FF]+)*/g) || [];

            const typos = [];

            for (const word of words) {
                const cleanWord = word.trim();
                // Ignore short words, numbers, and words with mixed numbers
                if (cleanWord.length > 1 && !/\d/.test(cleanWord)) {
                    if (!spellChecker.correct(cleanWord)) {
                        if (!ignoredSet.has(cleanWord.toLowerCase())) {
                            typos.push(cleanWord);
                        }
                    }
                }
            }

            if (typos.length > 0) {
                results.push({
                    ...q,
                    typos: [...new Set(typos)] // Unique typos per question
                });
            }
        }

        res.json(results);

    } catch (error) {
        console.error("Spell check scan failed", error);
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
        if (error.code === 'P2002') { // Unique constraint
            res.json({ success: true }); // Already ignored
        } else {
            res.status(500).json({ message: "Failed to ignore word" });
        }
    }
};
