import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Deleting all quiz history...");
        const { count } = await prisma.quizResult.deleteMany({});
        console.log(`Deleted ${count} records.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
