import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import quizRoutes from './routes/quiz.js';
import categoryRoutes from './routes/categories.js';
import specialtyRoutes from './routes/specialtyRoutes.js';
import weeklyExamRoutes from './routes/weeklyExamRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';

dotenv.config();

const app = express();
// Use process.env.PORT for Render/Vercel, fallback to 5002 for local dev
const PORT = process.env.PORT || 5002;

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://qc-app-zeta.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/weekly-exams', weeklyExamRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.get('/', (req, res) => {
    res.send('Quiz API is running');
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
