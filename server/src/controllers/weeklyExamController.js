import prisma from '../prisma.js';

// Create a new Weekly Exam
export const createExam = async (req, res) => {
    try {
        const { title, description, startDate, endDate, questionIds } = req.body;

        // Basic validation
        if (!title || !endDate || !questionIds || !Array.isArray(questionIds)) {
            return res.status(400).json({ message: "Title, endDate, and questionIds (array) are required." });
        }

        const exam = await prisma.weeklyExam.create({
            data: {
                title,
                description,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: new Date(endDate),
                questions: {
                    connect: questionIds.map(id => ({ id }))
                }
            },
            include: {
                questions: true
            }
        });

        res.status(201).json(exam);
    } catch (error) {
        console.error("Error creating exam:", error);
        res.status(500).json({ message: "Failed to create exam." });
    }
};

// Get all exams (for Admin)
export const getExams = async (req, res) => {
    try {
        const exams = await prisma.weeklyExam.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { submissions: true, questions: true }
                }
            }
        });
        res.json(exams);
    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ message: "Failed to fetch exams." });
    }
};

// Get the currently active exam (for User)
export const getActiveExam = async (req, res) => {
    try {
        const now = new Date();
        const userId = req.user.userId; // From auth middleware

        // Find an exam that started before now and ends after now
        const exam = await prisma.weeklyExam.findFirst({
            where: {
                startDate: { lte: now },
                endDate: { gte: now }
            },
            include: {
                questions: {
                    include: {
                        choices: true
                    }
                },
                submissions: {
                    where: { userId: userId }
                }
            },
            orderBy: { endDate: 'asc' } // Get the one ending soonest if multiple overlap
        });

        if (!exam) {
            return res.status(404).json({ message: "No active exam found." });
        }

        // Check if user already submitted
        const isSubmitted = exam.submissions.length > 0;

        // If submitted, we might want to return the score or just a flag
        // If not submitted, we return the questions (without correct answers ideally, but for now we send them)
        // SECURITY NOTE: In a real app, we should strip `isCorrect` from choices if not submitted.

        const sanitizedQuestions = exam.questions.map(q => ({
            ...q,
            choices: q.choices.map(c => ({
                id: c.id,
                text: c.text,
                // Only show isCorrect if submitted (or maybe never, depending on policy)
                // For now, let's hide it to prevent cheating via network tab
                // isCorrect: isSubmitted ? c.isCorrect : undefined 
            }))
        }));

        res.json({
            ...exam,
            questions: sanitizedQuestions,
            isSubmitted,
            userScore: isSubmitted ? exam.submissions[0].score : null
        });

    } catch (error) {
        console.error("Error fetching active exam:", error);
        res.status(500).json({ message: "Failed to fetch active exam." });
    }
};

// Submit an exam
export const submitExam = async (req, res) => {
    try {
        const { examId, answers } = req.body; // answers: { questionId: [choiceId1, choiceId2] }
        const userId = req.user.userId;

        if (!examId || !answers) {
            return res.status(400).json({ message: "Exam ID and answers are required." });
        }

        // Check if exam exists and is active
        const exam = await prisma.weeklyExam.findUnique({
            where: { id: parseInt(examId) },
            include: { questions: { include: { choices: true } } }
        });

        if (!exam) {
            return res.status(404).json({ message: "Exam not found." });
        }

        const now = new Date();
        if (now > exam.endDate) {
            return res.status(400).json({ message: "Exam has ended." });
        }

        // Check for existing submission
        const existingSubmission = await prisma.examSubmission.findUnique({
            where: {
                userId_examId: {
                    userId: userId,
                    examId: parseInt(examId)
                }
            }
        });

        if (existingSubmission) {
            return res.status(400).json({ message: "You have already submitted this exam." });
        }

        // Calculate Score
        let score = 0;
        exam.questions.forEach(question => {
            const userChoiceIds = answers[question.id] || [];
            const correctChoiceIds = question.choices.filter(c => c.isCorrect).map(c => c.id);

            // Check if arrays match (same length and all elements match)
            const isCorrect = userChoiceIds.length === correctChoiceIds.length &&
                userChoiceIds.every(id => correctChoiceIds.includes(id));

            if (isCorrect) {
                score++;
            }
        });

        // Create Submission
        const submission = await prisma.examSubmission.create({
            data: {
                userId,
                examId: parseInt(examId),
                score
            }
        });

        res.json({ message: "Exam submitted successfully", score, total: exam.questions.length });

    } catch (error) {
        console.error("Error submitting exam:", error);
        res.status(500).json({ message: "Failed to submit exam." });
    }
};

// Delete an exam
export const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.weeklyExam.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Exam deleted successfully." });
    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({ message: "Failed to delete exam." });
    }
};

// Get Leaderboard for an exam
export const getLeaderboard = async (req, res) => {
    try {
        const { examId } = req.params;

        const submissions = await prisma.examSubmission.findMany({
            where: { examId: parseInt(examId) },
            include: {
                user: {
                    select: { name: true, email: true, specialty: true } // Select minimal user info
                }
            },
            orderBy: [
                { score: 'desc' },
                { submittedAt: 'asc' } // Tie-breaker: earlier submission wins
            ],
            take: 50 // Top 50
        });

        res.json(submissions);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Failed to fetch leaderboard." });
    }
};
