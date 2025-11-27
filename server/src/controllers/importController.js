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

    const results = [];
    const filePath = req.file.path;

    try {
        // 1. Parse CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        // 2. Find "Najib" (or highest scorer)
        let referenceStudent = results.find(r =>
            Object.values(r).some(val => val && val.toString().toLowerCase().includes('najib'))
        );

        // Fallback: Find highest score if Najib not found
        if (!referenceStudent) {
            console.log("Najib not found, using highest scorer.");
            referenceStudent = results.sort((a, b) => {
                const scoreA = parseInt(a['Score']?.split('/')[0] || 0);
                const scoreB = parseInt(b['Score']?.split('/')[0] || 0);
                return scoreB - scoreA;
            })[0];
        }

        if (!referenceStudent) {
            return res.status(400).json({ message: "Could not find a reference student (Najib) or any valid data." });
        }

        console.log(`Using reference student: ${referenceStudent['Nom ou pseudonyme'] || 'Unknown'} (Score: ${referenceStudent['Score']})`);

        // 3. Extract Questions (Headers)
        const headers = Object.keys(results[0]);
        const ignoreHeaders = ['Timestamp', 'Score', 'Email Address', 'Nom ou pseudonyme', 'Commentaires', 'Total score'];

        const questionHeaders = headers.filter(h => !ignoreHeaders.includes(h) && h.length > 5);

        const questionsToImport = [];

        // 4. Process each question
        for (const questionText of questionHeaders) {
            const correctAnswerText = normalize(referenceStudent[questionText]);

            // Collect all unique answers and count frequencies
            const answerCounts = {};
            results.forEach(row => {
                const ans = normalize(row[questionText]);
                if (ans) {
                    answerCounts[ans] = (answerCounts[ans] || 0) + 1;
                }
            });

            // Filter choices: Top 4 most frequent + Correct Answer
            let uniqueAnswers = Object.keys(answerCounts);
            let finalChoices = [];

            if (uniqueAnswers.length <= 5) {
                finalChoices = uniqueAnswers;
            } else {
                // Sort by frequency (descending)
                const sortedAnswers = uniqueAnswers.sort((a, b) => answerCounts[b] - answerCounts[a]);

                // Take top 4
                finalChoices = sortedAnswers.slice(0, 4);

                // Ensure correct answer is included
                if (correctAnswerText && !finalChoices.includes(correctAnswerText)) {
                    // If correct answer is not in top 4, add it as a 5th choice
                    finalChoices.push(correctAnswerText);
                }
            }

            // Map to choice objects
            const choices = finalChoices.map(choiceText => ({
                text: choiceText,
                isCorrect: choiceText === correctAnswerText
            }));

            questionsToImport.push({
                text: questionText,
                choices: choices,
                category: "Banque de Questions" // Updated category name
            });
        }

        // 5. Preview Mode vs Commit Mode
        if (req.query.commit !== 'true') {
            // Clean up file
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.json({
                message: "Analysis complete",
                referenceStudent: referenceStudent['Nom ou pseudonyme'],
                score: referenceStudent['Score'],
                questionsFound: questionsToImport.length,
                preview: questionsToImport
            });
        }

        // 6. Commit to Database
        // Create "Banque de Questions" category if not exists
        let category = await prisma.category.findFirst({ where: { name: "Banque de Questions" } });
        if (!category) {
            category = await prisma.category.create({ data: { name: "Banque de Questions" } });
        }

        let importedCount = 0;

        await prisma.$transaction(async (tx) => {
            for (const q of questionsToImport) {
                // Create Question
                const newQuestion = await tx.question.create({
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

        // Clean up file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        res.json({
            message: "Import successful",
            count: importedCount
        });

    } catch (error) {
        console.error("Import error:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({
            message: "Error processing CSV",
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
