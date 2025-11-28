import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const specialties = [
    "Cardiologie",
    "Pneumologie",
    "Gastro-entérologie",
    "Neurologie",
    "Psychiatrie",
    "Pédiatrie",
    "Gynécologie-Obstétrique",
    "Chirurgie Générale",
    "Orthopédie",
    "Urologie",
    "Néphrologie",
    "Hématologie",
    "Endocrinologie",
    "Dermatologie",
    "Rhumatologie",
    "Infectiologie",
    "Ophtalmologie",
    "ORL",
    "Médecine Interne",
    "Réanimation"
];

async function main() {
    console.log("Seeding specialties...");

    for (const name of specialties) {
        const exists = await prisma.specialty.findUnique({
            where: { name }
        });

        if (!exists) {
            await prisma.specialty.create({
                data: { name }
            });
            console.log(`Created: ${name}`);
        } else {
            console.log(`Skipped (exists): ${name}`);
        }
    }

    const count = await prisma.specialty.count();
    console.log(`\nTotal Specialties in DB: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
