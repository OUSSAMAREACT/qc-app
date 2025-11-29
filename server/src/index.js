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
import userRoutes from './routes/userRoutes.js';
import systemSettingsRoutes from './routes/systemSettingsRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import importRoutes from './routes/importRoutes.js';
import spellCheckRoutes from './routes/spellCheckRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import knowledgeBaseRoutes from './routes/knowledgeBaseRoutes.js';
import aiTutorRoutes from './routes/aiTutorRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Use process.env.PORT for Render/Vercel, fallback to 5002 for local dev
const PORT = process.env.PORT || 5002;

const allowedOrigins = [
    "http://localhost:5173",
    "https://qc-app-zeta.vercel.app",
    "http://qcmechelle11.com",
    "https://qcmechelle11.com",
    "https://www.qcmechelle11.com",
    "https://api.qcmechelle11.com"
];

app.use(cors({
    origin: true, // Reflects the request origin, effectively allowing all origins while keeping credentials working
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
}));

app.use('/api/spell-check', spellCheckRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);

app.get('/', (req, res) => {
    res.send('Quiz API is running');
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log("Server starting...");
    });
}

export default app;
