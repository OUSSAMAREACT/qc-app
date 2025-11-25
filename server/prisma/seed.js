import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const specialties = [
    "Infirmier Polyvalent",
    "Anesthésie Réanimation",
    "Radiologie",
    "Kinésithérapie",
    "Santé Mentale",
    "Laboratoire",
    "Sage Femme",
    "Assistante Sociale"
];

async function main() {
    console.log('Seeding specialties...');

    for (const name of specialties) {
        await prisma.specialty.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // Assign "Infirmier Polyvalent" to users without specialty
    const polyvalent = await prisma.specialty.findUnique({ where: { name: "Infirmier Polyvalent" } });

    if (polyvalent) {
        const updateResult = await prisma.user.updateMany({
            where: {
                role: 'STUDENT',
                specialtyId: null
            },
            data: { specialtyId: polyvalent.id }
        });
        console.log(`Assigned default specialty to ${updateResult.count} users.`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
