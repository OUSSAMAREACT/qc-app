import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = 'oussamaqarbach@gmail.com';
    console.log(`Attempting to restore privileges for: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error("USER NOT FOUND!");
            return;
        }

        console.log(`User found: ${user.name}, Current Role: ${user.role}`);

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'SUPER_ADMIN' }
        });

        console.log(`SUCCESS: User ${updatedUser.email} is now ${updatedUser.role}`);
    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
