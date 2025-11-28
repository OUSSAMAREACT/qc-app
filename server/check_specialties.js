import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.specialty.count();
        console.log(`Total Specialties: ${count}`);

        if (count > 0) {
            const specialties = await prisma.specialty.findMany();
            console.log(JSON.stringify(specialties, null, 2));
        } else {
            console.log("No specialties found in the database.");
        }
    } catch (error) {
        console.error("Error checking specialties:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
