const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to normalize strings (trim, handle nulls)
const normalize = (str) => str ? str.trim() : '';

exports.importQuestionsFromCSV = async (req, res) => {
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
        // We look for a column that might contain the name, e.g., "Nom ou pseudonyme"
        // And "Score" column.
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
        // We need to filter out non-question headers like "Timestamp", "Score", "Email Address", etc.
        const headers = Object.keys(results[0]);
        const ignoreHeaders = ['Timestamp', 'Score', 'Email Address', 'Nom ou pseudonyme', 'Commentaires', 'Total score'];

        const questionHeaders = headers.filter(h => !ignoreHeaders.includes(h) && h.length > 5); // Simple heuristic: questions are usually long

        const questionsToImport = [];

        // 4. Process each question
        for (const questionText of questionHeaders) {
            const correctAnswerText = normalize(referenceStudent[questionText]);

            // Collect all unique answers for this question to build choices
            const allAnswers = new Set();
            results.forEach(row => {
                const ans = normalize(row[questionText]);
                if (ans) allAnswers.add(ans);
            });

            // Ensure correct answer is in the choices
            if (correctAnswerText) allAnswers.add(correctAnswerText);

            const choices = Array.from(allAnswers).map(choiceText => ({
                text: choiceText,
                isCorrect: choiceText === correctAnswerText
            }));

            questionsToImport.push({
                text: questionText,
                choices: choices,
                category: "Imported" // Default category
            });
        }

        // 5. Preview Mode vs Commit Mode
        // If query param ?commit=true is NOT present, return preview
        if (req.query.commit !== 'true') {
            // Clean up file
            fs.unlinkSync(filePath);
            return res.json({
                message: "Analysis complete",
                referenceStudent: referenceStudent['Nom ou pseudonyme'],
                score: referenceStudent['Score'],
                questionsFound: questionsToImport.length,
                preview: questionsToImport
            });
        }

        // 6. Commit to Database
        // Create "Imported" category if not exists
        let category = await prisma.category.findFirst({ where: { name: "Imported" } });
        if (!category) {
            category = await prisma.category.create({ data: { name: "Imported", description: "Imported from CSV" } });
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
        fs.unlinkSync(filePath);

        res.json({
            message: "Import successful",
            count: importedCount
        });

    } catch (error) {
        console.error("Import error:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ message: "Error processing CSV", error: error.message });
    }
};
