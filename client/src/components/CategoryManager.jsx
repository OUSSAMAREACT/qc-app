import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { Trash2, Plus, AlertTriangle, Edit2, Check, X } from 'lucide-react';

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setLoading(true);
        try {
            if (editingCategory) {
                await axios.put(`/categories/${editingCategory.id}`, { name: newCategory, specialty: specialty || null });
            } else {
                await axios.post('/categories', { name: newCategory, specialty: specialty || null });
            }
            setNewCategory('');
            setSpecialty('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error("Operation failed:", error);
            const message = error.response?.data?.message || "Erreur lors de l'opération";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setNewCategory(category.name);
        setSpecialty(category.specialty || '');
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setNewCategory('');
        setSpecialty('');
    };

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            console.log("Deleting category:", categoryToDelete.id);
            await axios.delete(`/categories/${categoryToDelete.id}`);
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Erreur lors de la suppression. Vérifiez la console.");
        }
    };

    return (
        <>
            <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Gérer les Catégories</h2>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mb-6">
                    <Input
                        placeholder="Nouvelle catégorie..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Commun (Tous)</option>
                        <option value="POLYVALENT">Polyvalent</option>
                        <option value="ANESTHESIE">Anesthésie</option>
                        <option value="RADIOLOGIE">Radiologie</option>
                        <option value="KINESITHERAPIE">Kinésithérapie</option>
                        <option value="SANTE_MENTALE">Santé Mentale</option>
                        <option value="LABORATOIRE">Laboratoire</option>
                        <option value="SAGE_FEMME">Sage Femme</option>
                        <option value="ASSISTANTE_SOCIALE">Assistante Sociale</option>
                    </select>
                    {editingCategory ? (
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                                <Check size={20} />
                            </Button>
                            <Button type="button" onClick={cancelEdit} disabled={loading} variant="secondary">
                                <X size={20} />
                            </Button>
                        </div>
                    ) : (
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus size={20} />
                        </Button>
                    )}
                </form>

                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 transition-colors">
                            <div>
                                <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({cat._count?.questions || 0} questions)</span>
                                {cat.specialty && (
                                    <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
                                        {cat.specialty}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => startEdit(cat)}
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                    title="Modifier la catégorie"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => confirmDelete(cat)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    title="Supprimer la catégorie"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-center text-sm">Aucune catégorie.</p>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Supprimer la catégorie"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertTriangle size={24} />
                    </div>

                    <div>
                        <p className="text-gray-600">
                            Vous êtes sur le point de supprimer la catégorie <span className="font-bold text-gray-900">"{categoryToDelete?.name}"</span>.
                        </p>
                        {categoryToDelete?._count?.questions > 0 && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                                <strong>Attention :</strong> Cette catégorie contient <strong>{categoryToDelete._count.questions} question(s)</strong>.
                                Elles seront toutes supprimées définitivement.
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 w-full mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteModalOpen(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            className="flex-1"
                        >
                            Supprimer
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
