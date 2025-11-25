import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address.');
    console.log('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
}

async function main() {
    try {
        console.log(`Looking for user with email: ${email}...`);
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error('User not found!');
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`✅ Success! User ${updatedUser.email} is now an ADMIN.`);
    } catch (e) {
        console.error('Error updating user:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
