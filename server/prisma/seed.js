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

    // --- Seeding Categories and Questions ---
    console.log('Seeding categories and questions...');

    const categoriesData = [
        {
            name: "Anatomie Générale",
            specialty: null, // Common
            questions: [
                {
                    text: "Quels sont les os du bras ?",
                    difficulty: "Facile",
                    explanation: "L'humérus est le seul os du bras. Le radius et l'ulna sont dans l'avant-bras.",
                    choices: [
                        { text: "Humérus", isCorrect: true },
                        { text: "Fémur", isCorrect: false },
                        { text: "Tibia", isCorrect: false },
                        { text: "Radius", isCorrect: false }
                    ]
                },
                {
                    text: "Parmi les organes suivants, lesquels font partie du système digestif ? (Plusieurs réponses)",
                    difficulty: "Moyen",
                    explanation: "L'estomac et l'intestin grêle sont des organes clés de la digestion.",
                    choices: [
                        { text: "Estomac", isCorrect: true },
                        { text: "Cœur", isCorrect: false },
                        { text: "Intestin grêle", isCorrect: true },
                        { text: "Poumons", isCorrect: false },
                        { text: "Foie", isCorrect: true }
                    ]
                }
            ]
        },
        {
            name: "Pharmacologie de base",
            specialty: null, // Common
            questions: [
                {
                    text: "Quelle est la voie d'administration la plus rapide ?",
                    difficulty: "Moyen",
                    explanation: "La voie intraveineuse permet au médicament d'atteindre directement la circulation sanguine.",
                    choices: [
                        { text: "Orale", isCorrect: false },
                        { text: "Intraveineuse", isCorrect: true },
                        { text: "Intramusculaire", isCorrect: false },
                        { text: "Sous-cutanée", isCorrect: false }
                    ]
                }
            ]
        },
        {
            name: "Soins en Réanimation",
            specialty: "Anesthésie Réanimation",
            questions: [
                {
                    text: "Quels sont les signes d'un arrêt cardiaque ? (Plusieurs réponses)",
                    difficulty: "Difficile",
                    explanation: "L'absence de pouls et de respiration sont les signes cliniques majeurs.",
                    choices: [
                        { text: "Absence de pouls", isCorrect: true },
                        { text: "Pupilles en myosis", isCorrect: false },
                        { text: "Absence de respiration", isCorrect: true },
                        { text: "Peau chaude", isCorrect: false },
                        { text: "Perte de connaissance", isCorrect: true }
                    ]
                },
                {
                    text: "Quel médicament est utilisé en première intention lors d'un choc anaphylactique ?",
                    difficulty: "Moyen",
                    explanation: "L'adrénaline est le traitement d'urgence du choc anaphylactique.",
                    choices: [
                        { text: "Atropine", isCorrect: false },
                        { text: "Adrénaline", isCorrect: true },
                        { text: "Amiodarone", isCorrect: false }
                    ]
                }
            ]
        }
    ];

    for (const catData of categoriesData) {
        let specialtyId = null;
        if (catData.specialty) {
            const spec = await prisma.specialty.findUnique({ where: { name: catData.specialty } });
            if (spec) specialtyId = spec.id;
        }

        const category = await prisma.category.upsert({
            where: { name: catData.name },
            update: { specialtyId },
            create: {
                name: catData.name,
                specialtyId
            }
        });

        for (const qData of catData.questions) {
            // Check if question exists to avoid duplicates
            const existingQuestion = await prisma.question.findFirst({
                where: {
                    text: qData.text,
                    categoryId: category.id
                }
            });

            if (!existingQuestion) {
                await prisma.question.create({
                    data: {
                        text: qData.text,
                        difficulty: qData.difficulty,
                        explanation: qData.explanation,
                        categoryId: category.id,
                        choices: {
                            create: qData.choices
                        }
                    }
                });
            }
        }
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
