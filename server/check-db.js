import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking database connection...");
        await prisma.$connect();
        console.log("Connected.");

        console.log("Checking for Specialty table...");
        try {
            const count = await prisma.specialty.count();
            console.log(`Specialty table exists. Count: ${count}`);
        } catch (e) {
            console.log("Specialty table query failed:", e.message);
        }

    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
