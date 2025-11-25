import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import quizRoutes from './routes/quiz.js';
import categoryRoutes from './routes/categories.js';
import specialtyRoutes from './routes/specialtyRoutes.js';
import weeklyExamRoutes from './routes/weeklyExamRoutes.js';

dotenv.config();

const app = express();
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
