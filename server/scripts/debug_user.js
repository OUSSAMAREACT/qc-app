import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("Listing users...");
    try {
        const users = await prisma.user.findMany({
            take: 10,
            select: { id: true, email: true, role: true, name: true }
        });
        console.log("Users found:", users);
    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
