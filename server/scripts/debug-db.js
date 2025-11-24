import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking last 5 QuizResults...");
        const results = await prisma.quizResult.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
