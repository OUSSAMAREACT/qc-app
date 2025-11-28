import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRole() {
    try {
        // Check for the most likely admin user (usually the first one or by email)
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'SUPER_ADMIN']
                }
            }
        });

        console.log('Admin Users found:', users.length);
        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}`);
        });

    } catch (error) {
        console.error('Error checking user role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserRole();
