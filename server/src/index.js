import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import quizRoutes from './routes/quiz.js';
import categoryRoutes from './routes/categories.js';

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

app.get('/', (req, res) => {
    res.send('Quiz API is running');
});

console.log("Starting server initialization...");
console.log("Environment:", process.env.NODE_ENV);
console.log("VERCEL env:", process.env.VERCEL);
console.log("PORT env:", process.env.PORT);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    console.log("Attempting to bind to port...");
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
} else {
    console.log("Skipping app.listen (Vercel environment detected)");
}

export default app;
