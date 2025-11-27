
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
