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
                },
                {
                    text: "Quel est le plus grand organe du corps humain ?",
                    difficulty: "Facile",
                    explanation: "La peau est considérée comme le plus grand organe du corps humain.",
                    choices: [
                        { text: "Le foie", isCorrect: false },
                        { text: "La peau", isCorrect: true },
                        { text: "Les poumons", isCorrect: false },
                        { text: "Le cerveau", isCorrect: false }
                    ]
                },
                {
                    text: "Combien de vertèbres cervicales possède l'être humain ?",
                    difficulty: "Moyen",
                    explanation: "Il y a 7 vertèbres cervicales (C1 à C7).",
                    choices: [
                        { text: "5", isCorrect: false },
                        { text: "7", isCorrect: true },
                        { text: "12", isCorrect: false },
                        { text: "4", isCorrect: false }
                    ]
                },
                {
                    text: "Où se situe le muscle deltoïde ?",
                    difficulty: "Facile",
                    explanation: "Le deltoïde est le muscle qui recouvre l'épaule.",
                    choices: [
                        { text: "Dans la cuisse", isCorrect: false },
                        { text: "Sur l'épaule", isCorrect: true },
                        { text: "Dans le dos", isCorrect: false },
                        { text: "Sur le bras", isCorrect: false }
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
                },
                {
                    text: "Qu'est-ce qu'un effet indésirable ?",
                    difficulty: "Facile",
                    explanation: "C'est une réaction nocive et non voulue à un médicament.",
                    choices: [
                        { text: "L'effet thérapeutique recherché", isCorrect: false },
                        { text: "Une réaction nocive non voulue", isCorrect: true },
                        { text: "Une interaction médicamenteuse", isCorrect: false },
                        { text: "Une erreur de dosage", isCorrect: false }
                    ]
                },
                {
                    text: "Quel est l'antidote des opiacés ?",
                    difficulty: "Difficile",
                    explanation: "La naloxone est un antagoniste des récepteurs opioïdes.",
                    choices: [
                        { text: "Flumazénil", isCorrect: false },
                        { text: "Naloxone", isCorrect: true },
                        { text: "Atropine", isCorrect: false },
                        { text: "Vitamine K", isCorrect: false }
                    ]
                },
                {
                    text: "Parmi ces médicaments, lesquels sont des antalgiques ? (Plusieurs réponses)",
                    difficulty: "Moyen",
                    explanation: "Le paracétamol et la morphine sont des antalgiques. L'ibuprofène est un AINS (aussi antalgique).",
                    choices: [
                        { text: "Paracétamol", isCorrect: true },
                        { text: "Amoxicilline", isCorrect: false },
                        { text: "Morphine", isCorrect: true },
                        { text: "Furosémide", isCorrect: false },
                        { text: "Ibuprofène", isCorrect: true }
                    ]
                }
            ]
        },
        {
            name: "Soins Infirmiers de Base",
            specialty: null, // Common
            questions: [
                {
                    text: "Quelle est la fréquence respiratoire normale chez l'adulte au repos ?",
                    difficulty: "Facile",
                    explanation: "La fréquence normale est généralement comprise entre 12 et 20 cycles par minute.",
                    choices: [
                        { text: "5-10 cycles/min", isCorrect: false },
                        { text: "12-20 cycles/min", isCorrect: true },
                        { text: "25-30 cycles/min", isCorrect: false },
                        { text: "30-40 cycles/min", isCorrect: false }
                    ]
                },
                {
                    text: "Quels sont les sites d'injection intramusculaire courants ? (Plusieurs réponses)",
                    difficulty: "Moyen",
                    explanation: "Le deltoïde, le fessier et le quadriceps sont des sites courants.",
                    choices: [
                        { text: "Deltoïde", isCorrect: true },
                        { text: "Ventre", isCorrect: false },
                        { text: "Fessier (quart supéro-externe)", isCorrect: true },
                        { text: "Quadriceps", isCorrect: true },
                        { text: "Avant-bras", isCorrect: false }
                    ]
                },
                {
                    text: "Lors de la prise de tension artérielle, le premier bruit entendu correspond à :",
                    difficulty: "Moyen",
                    explanation: "Le premier bruit de Korotkoff correspond à la pression systolique.",
                    choices: [
                        { text: "La pression diastolique", isCorrect: false },
                        { text: "La pression systolique", isCorrect: true },
                        { text: "La pression moyenne", isCorrect: false }
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
                },
                {
                    text: "Quelle est la valeur normale de la saturation en oxygène (SpO2) ?",
                    difficulty: "Facile",
                    explanation: "Une SpO2 normale est supérieure à 95%.",
                    choices: [
                        { text: "85-90%", isCorrect: false },
                        { text: "90-94%", isCorrect: false },
                        { text: "> 95%", isCorrect: true },
                        { text: "< 80%", isCorrect: false }
                    ]
                },
                {
                    text: "Dans le score de Glasgow, quelle est la réponse verbale maximale ?",
                    difficulty: "Difficile",
                    explanation: "La réponse verbale est notée sur 5.",
                    choices: [
                        { text: "4", isCorrect: false },
                        { text: "5", isCorrect: true },
                        { text: "6", isCorrect: false },
                        { text: "15", isCorrect: false }
                    ]
                }
            ]
        },
        {
            name: "Pédiatrie",
            specialty: "Sage Femme",
            questions: [
                {
                    text: "Quel est le score utilisé pour évaluer la vitalité du nouveau-né à la naissance ?",
                    difficulty: "Facile",
                    explanation: "Le score d'Apgar évalue la fréquence cardiaque, la respiration, le tonus, la réactivité et la coloration.",
                    choices: [
                        { text: "Score de Glasgow", isCorrect: false },
                        { text: "Score d'Apgar", isCorrect: true },
                        { text: "Score de Silverman", isCorrect: false }
                    ]
                },
                {
                    text: "Quels sont les réflexes archaïques du nouveau-né ? (Plusieurs réponses)",
                    difficulty: "Moyen",
                    explanation: "Le grasping, la marche automatique et le réflexe de Moro sont des réflexes archaïques.",
                    choices: [
                        { text: "Grasping", isCorrect: true },
                        { text: "Marche automatique", isCorrect: true },
                        { text: "Réflexe de Moro", isCorrect: true },
                        { text: "Réflexe rotulien", isCorrect: false }
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
