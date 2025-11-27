import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import quizRoutes from './routes/quiz.js';
import categoryRoutes from './routes/categories.js';
import specialtyRoutes from './routes/specialtyRoutes.js';
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

app.get('/', (req, res) => {
    res.send('Quiz API is running');
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
