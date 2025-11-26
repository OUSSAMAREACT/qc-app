import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Plus, Award, BookOpen, ArrowLeft, Trash2, Edit } from 'lucide-react';

export default function SpecialtyView({ onSelectCategory }) {
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [categories, setCategories] = useState([]);

    // Creation states
    const [isCreatingSpecialty, setIsCreatingSpecialty] = useState(false);
    const [newSpecialtyName, setNewSpecialtyName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchSpecialties();
    }, []);

    useEffect(() => {
        if (selectedSpecialty) {
            fetchCategories(selectedSpecialty.id);
        }
    }, [selectedSpecialty]);

    const fetchSpecialties = async () => {
        try {
            const res = await axios.get('/specialties');
            setSpecialties(res.data);
        } catch (error) {
            console.error("Failed to fetch specialties", error);
        }
    };

    const fetchCategories = async (specialtyId) => {
        try {
            const res = await axios.get('/categories');
            const filtered = res.data.filter(c => c.specialtyId === specialtyId);
            setCategories(filtered);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleCreateSpecialty = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/specialties', { name: newSpecialtyName });
            setNewSpecialtyName('');
            setIsCreatingSpecialty(false);
            fetchSpecialties();
        } catch (error) {
            alert("Erreur lors de la création de la spécialité");
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/categories', { name: newCategoryName, specialtyId: selectedSpecialty.id });
            setNewCategoryName('');
            setIsCreatingCategory(false);
            fetchCategories(selectedSpecialty.id);
        } catch (error) {
            alert("Erreur lors de la création du module");
        }
    };

    const handleDeleteSpecialty = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Supprimer cette spécialité ?")) return;
        try {
            await axios.delete(`/specialties/${id}`);
            fetchSpecialties();
        } catch (error) {
            alert("Impossible de supprimer une spécialité utilisée.");
        }
    };

    const handleDeleteCategory = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Supprimer ce module ?")) return;
        try {
            await axios.delete(`/categories/${id}`);
            fetchCategories(selectedSpecialty.id);
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    // View: List of Categories for a Specialty
    if (selectedSpecialty) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setSelectedSpecialty(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Award className="text-blue-600" /> {selectedSpecialty.name}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les modules spécifiques à cette spécialité.</p>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={() => setIsCreatingCategory(true)} className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                            <Plus className="mr-2" size={20} /> Nouveau Module
                        </Button>
                    </div>
                </div>

                {isCreatingCategory && (
                    <Card className="p-6 border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 mb-6 animate-in fade-in slide-in-from-top-4">
                        <form onSubmit={handleCreateCategory} className="flex flex-col md:flex-row gap-4 md:items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du module</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    placeholder="Ex: Anatomie Cardiaque"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1 md:flex-none">Créer</Button>
                                <Button type="button" variant="ghost" onClick={() => setIsCreatingCategory(false)} className="flex-1 md:flex-none">Annuler</Button>
                            </div>
                        </form>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory(cat)}
                            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                    <BookOpen size={24} />
                                </div>
                                <button
                                    onClick={(e) => handleDeleteCategory(e, cat.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {cat.name}
                            </h3>

                            <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>{cat._count?.questions || 0} questions</span>
                                <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-1 transition-transform">Gérer &rarr;</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // View: List of Specialties
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Spécialités</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les différentes spécialités et leurs modules.</p>
                </div>
                <Button onClick={() => setIsCreatingSpecialty(true)} className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                    <Plus className="mr-2" size={20} /> Nouvelle Spécialité
                </Button>
            </div>

            {isCreatingSpecialty && (
                <Card className="p-6 border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 mb-6 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleCreateSpecialty} className="flex flex-col md:flex-row gap-4 md:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la spécialité</label>
                            <input
                                type="text"
                                value={newSpecialtyName}
                                onChange={(e) => setNewSpecialtyName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Ex: Anesthésie Réanimation"
                                autoFocus
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1 md:flex-none">Créer</Button>
                            <Button type="button" variant="ghost" onClick={() => setIsCreatingSpecialty(false)} className="flex-1 md:flex-none">Annuler</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialties.map((spec) => (
                    <div
                        key={spec.id}
                        onClick={() => setSelectedSpecialty(spec)}
                        className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                <Award size={24} />
                            </div>
                            <button
                                onClick={(e) => handleDeleteSpecialty(e, spec.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {spec.name}
                        </h3>

                        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Voir les modules</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
