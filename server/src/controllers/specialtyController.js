import prisma from '../prisma.js';

export const getSpecialties = async (req, res) => {
    try {
        const specialties = await prisma.specialty.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(specialties);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des spécialités." });
    }
};

export const createSpecialty = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Le nom est requis." });

        const specialty = await prisma.specialty.create({
            data: { name }
        });
        res.status(201).json(specialty);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Cette spécialité existe déjà." });
        }
        res.status(500).json({ message: "Erreur lors de la création." });
    }
};

export const updateSpecialty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Le nom est requis." });

        const specialty = await prisma.specialty.update({
            where: { id: parseInt(id) },
            data: { name }
        });
        res.json(specialty);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Cette spécialité existe déjà." });
        }
        res.status(500).json({ message: "Erreur lors de la mise à jour." });
    }
};

export const deleteSpecialty = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if used
        const usedInUsers = await prisma.user.count({ where: { specialtyId: parseInt(id) } });
        const usedInCategories = await prisma.category.count({ where: { specialtyId: parseInt(id) } });

        if (usedInUsers > 0 || usedInCategories > 0) {
            return res.status(400).json({ message: "Impossible de supprimer : cette spécialité est utilisée." });
        }

        await prisma.specialty.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Spécialité supprimée." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression." });
    }
};
