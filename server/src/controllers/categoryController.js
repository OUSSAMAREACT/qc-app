import prisma from '../prisma.js';

export const getCategories = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const where = {};
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            where.OR = [
                { specialtyId: null }, // Common modules
                { specialtyId: user.specialtyId } // User's specialty
            ];
            // Exclude "Banque de Questions" for non-admins
            where.name = { not: "Banque de Questions" };
        }

        const categories = await prisma.category.findMany({
            where,
            include: {
                _count: {
                    select: { questions: true }
                },
                specialty: true // Include specialty details
            },
            orderBy: { name: 'asc' } // Sort alphabetically
        });

        // Flatten specialty name for frontend compatibility if needed, or frontend adapts
        const formattedCategories = categories.map(cat => ({
            ...cat,
            specialty: cat.specialty?.name || null,
            specialtyId: cat.specialtyId,
            isFree: cat.isFree // Explicitly include isFree
        }));

        res.json(formattedCategories);
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des catégories." });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: { specialty: true }
        });

        if (!category) {
            return res.status(404).json({ message: "Catégorie non trouvée." });
        }

        res.json({
            ...category,
            specialty: category.specialty?.name || null
        });
    } catch (error) {
        console.error("Get category error:", error);
        res.status(500).json({ message: "Erreur lors de la récupération de la catégorie." });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, specialtyId, isFree } = req.body;
        if (!name) return res.status(400).json({ message: "Le nom est requis." });

        const category = await prisma.category.create({
            data: {
                name,
                specialtyId: specialtyId ? parseInt(specialtyId) : null,
                isFree: isFree || false
            },
            include: { specialty: true }
        });
        console.log("Category created:", category);

        // Format response
        res.status(201).json({
            ...category,
            specialty: category.specialty?.name || null
        });
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
        const { name, specialtyId, isFree } = req.body;
        if (!name) return res.status(400).json({ message: "Le nom est requis." });

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: {
                name,
                specialtyId: specialtyId ? parseInt(specialtyId) : null,
                isFree: isFree !== undefined ? isFree : undefined
            },
            include: { specialty: true }
        });

        res.json({
            ...category,
            specialty: category.specialty?.name || null
        });
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
