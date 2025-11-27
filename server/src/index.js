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
import prisma from './prisma.js'; // Keep this if it's actually used, otherwise remove. It seems unused in the current file content I saw.
// Actually, I saw "import prisma from './prisma.js';" in the file view, but no usage.
// I will remove it to be clean.

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
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
    });
}

export default app;
