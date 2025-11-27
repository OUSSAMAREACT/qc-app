import prisma from '../prisma.js';

export const getSettings = async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Convert array to object for easier frontend consumption
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des paramètres." });
    }
};

export const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ message: "Clé et valeur requises." });
        }

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });

        res.json(setting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du paramètre." });
    }
};
