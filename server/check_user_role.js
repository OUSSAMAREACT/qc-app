import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = "oussamaqarbach@gmail.com"; // Default admin email from seed
    console.log(`Checking role for ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (user) {
        console.log("User found:");
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: '${user.role}'`); // Quote to see whitespace/case
        console.log(`Status: ${user.status}`);
    } else {
        console.log("User not found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
