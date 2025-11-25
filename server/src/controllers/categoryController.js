import prisma from '../prisma.js';

export const getCategories = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const where = {};
        if (user.role !== 'ADMIN') {
            where.OR = [
                { specialty: null }, // Common modules
                { specialty: user.specialty } // User's specialty
            ];
        }

        const categories = await prisma.category.findMany({
            where,
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        });
        res.json(categories);
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des catégories." });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, specialty } = req.body;
        if (!name) return res.status(400).json({ message: "Le nom est requis." });

        const category = await prisma.category.create({
            data: { name, specialty: specialty || null }
        });
        console.log("Category created:", category);
        res.status(201).json(category);
    } catch (error) {
        console.error("Create category error:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Cette catégorie existe déjà." });
        }
        res.status(500).json({ message: "Erreur lors de la création de la catégorie." });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, specialty } = req.body;
        if (!name) return res.status(400).json({ message: "Le nom est requis." });

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name, specialty: specialty || null }
        });
        res.json(category);
    } catch (error) {
        console.error("Update category error:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Cette catégorie existe déjà." });
        }
        res.status(500).json({ message: "Erreur lors de la mise à jour de la catégorie." });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Catégorie supprimée." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression." });
    }
};
