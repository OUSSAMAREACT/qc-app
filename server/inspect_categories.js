import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({
        include: {
            specialty: true,
        },
    });

    console.log("Categories in DB:");
    categories.forEach(c => {
        const specId = c.specialtyId === null ? "NULL" : c.specialtyId;
        const specName = c.specialty ? c.specialty.name : "NONE";
        console.log(`[${c.id}] ${c.name} | SpecID: ${specId} | SpecName: ${specName}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
