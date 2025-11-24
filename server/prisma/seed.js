import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Admin User
    const email = 'admin@test.com';
    const password = 'password123';
    const name = 'Admin User';

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN',
            },
        });
        console.log(`Admin user created: ${email}`);
    } else {
        console.log('Admin user already exists');
    }

    // 2. Create Categories & Questions
    const categoriesData = [
        { name: 'Système national de santé', count: 100 },
        { name: 'Épidémiologie', count: 40 },
        { name: 'Sociologie', count: 30 },
        { name: 'Catégorie Test 1', count: 5 },
        { name: 'Catégorie Test 2', count: 5 },
        { name: 'Catégorie Test 3', count: 5 },
    ];

    for (const catData of categoriesData) {
        console.log(`Seeding category: ${catData.name}...`);

        // Create or get Category
        const category = await prisma.category.upsert({
            where: { name: catData.name },
            update: {},
            create: { name: catData.name },
        });

        // Check count
        const count = await prisma.question.count({ where: { categoryId: category.id } });
        if (count >= catData.count) {
            console.log(`  Category ${catData.name} already has ${count} questions. Skipping.`);
            continue;
        }

        const questionsToCreate = catData.count - count;
        const questionsData = [];

        for (let i = 1; i <= questionsToCreate; i++) {
            questionsData.push({
                text: `Question ${i} sur ${catData.name} (Exemple)`,
                categoryId: category.id,
                difficulty: i % 3 === 0 ? 'Difficile' : i % 2 === 0 ? 'Moyen' : 'Facile',
                choices: {
                    create: [
                        { text: 'Réponse Correcte A', isCorrect: true },
                        { text: 'Réponse Incorrecte B', isCorrect: false },
                        { text: 'Réponse Incorrecte C', isCorrect: false },
                        { text: 'Réponse Correcte D (Parfois)', isCorrect: i % 4 === 0 },
                    ]
                }
            });
        }

        for (const q of questionsData) {
            await prisma.question.create({ data: q });
        }
        console.log(`  Added ${questionsToCreate} questions to ${catData.name}.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
