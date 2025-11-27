import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper to normalize strings (trim, handle nulls, remove invisible chars)
const normalize = (str) => {
    if (!str) return '';
    return str
        .toString()
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces/joiners
        .replace(/\s+/g, ' ') // Collapse multiple spaces to one
        .trim();
};

export const importQuestionsFromCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const isJson = req.file.mimetype === 'application/json' || req.file.originalname.endsWith('.json');

    try {
        let questionsToImport = [];

        if (isJson) {
            // --- JSON IMPORT LOGIC ---
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(fileContent);

            if (!Array.isArray(jsonData)) {
                throw new Error("Invalid JSON format. Expected an array of questions.");
            }

            questionsToImport = jsonData.map(q => ({
                text: q.text,
                choices: q.choices.map(c => ({
                    text: c.text,
                    isCorrect: c.isCorrect
                })),
                category: "Banque de Questions"
            }));

            console.log(`Parsed ${questionsToImport.length} questions from JSON.`);

        } else {
            // --- CSV IMPORT LOGIC (Legacy/Fallback) ---
            const results = [];
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            // ... (Existing CSV logic: Najib Strategy) ...
            // For brevity, I'm keeping the existing CSV logic structure but wrapping it
            // Ideally, we might want to separate these into functions

            // 2. Find "Najib" (or highest scorer)
            let referenceStudent = results.find(r =>
                Object.values(r).some(val => val && val.toString().toLowerCase().includes('najib'))
            );

            if (!referenceStudent) {
                referenceStudent = results.sort((a, b) => {
                    const scoreA = parseInt(a['Score']?.split('/')[0] || 0);
                    const scoreB = parseInt(b['Score']?.split('/')[0] || 0);
                    return scoreB - scoreA;
                })[0];
            }

            if (!referenceStudent) {
                throw new Error("Could not find a reference student (Najib) or any valid data in CSV.");
            }

            const headers = Object.keys(results[0]);
            const ignoreHeaders = ['Timestamp', 'Score', 'Email Address', 'Nom ou pseudonyme', 'Commentaires', 'Total score'];
            const questionHeaders = headers.filter(h => !ignoreHeaders.includes(h) && h.length > 5);

            for (const questionText of questionHeaders) {
                const correctAnswerText = normalize(referenceStudent[questionText]);
                const answerCounts = {};
                results.forEach(row => {
                    const ans = normalize(row[questionText]);
                    if (ans) answerCounts[ans] = (answerCounts[ans] || 0) + 1;
                });

                let uniqueAnswers = Object.keys(answerCounts);
                let finalChoices = [];

                if (uniqueAnswers.length <= 5) {
                    finalChoices = uniqueAnswers;
                } else {
                    const sortedAnswers = uniqueAnswers.sort((a, b) => answerCounts[b] - answerCounts[a]);
                    finalChoices = sortedAnswers.slice(0, 4);
                    if (correctAnswerText && !finalChoices.includes(correctAnswerText)) {
                        finalChoices.push(correctAnswerText);
                    }
                }

                const choices = finalChoices.map(choiceText => ({
                    text: choiceText,
                    isCorrect: choiceText === correctAnswerText
                }));

                questionsToImport.push({
                    text: questionText,
                    choices: choices,
                    category: "Banque de Questions"
                });
            }
        }

        // --- PREVIEW MODE ---
        if (req.query.commit !== 'true') {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.json({
                message: "Analysis complete",
                source: isJson ? "JSON Export" : "CSV Analysis",
                questionsFound: questionsToImport.length,
                preview: questionsToImport
            });
        }

        // --- COMMIT MODE ---
        let category = await prisma.category.findFirst({ where: { name: "Banque de Questions" } });
        if (!category) {
            category = await prisma.category.create({ data: { name: "Banque de Questions" } });
        }

        let importedCount = 0;
        await prisma.$transaction(async (tx) => {
            for (const q of questionsToImport) {
                await tx.question.create({
                    data: {
                        text: q.text,
                        categoryId: category.id,
                        choices: {
                            create: q.choices.map(c => ({
                                text: c.text,
                                isCorrect: c.isCorrect
                            }))
                        }
                    }
                });
                importedCount++;
            }
        });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json({ message: "Import successful", count: importedCount });

    } catch (error) {
        console.error("Import error:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({
            message: "Error processing file",
            error: error.message
        });
    }
};
