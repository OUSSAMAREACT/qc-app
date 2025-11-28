import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("Please provide an email address.");
        console.log("Usage: node promote_admin.js <email>");
        process.exit(1);
    }

    console.log(`Promoting ${email} to SUPER_ADMIN...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'SUPER_ADMIN' }
        });

        console.log(`Success! User ${user.email} is now a ${user.role}.`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error("User not found.");
        } else {
            console.error("Error promoting user:", error);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
