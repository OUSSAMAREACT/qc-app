import prisma from '../prisma.js';

export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des catégories." });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Le nom est requis." });

        const category = await prisma.category.create({
            data: { name }
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
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Le nom est requis." });

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name }
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
