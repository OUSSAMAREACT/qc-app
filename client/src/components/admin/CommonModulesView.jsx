import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Plus, BookOpen, MoreVertical, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CommonModulesView({ onSelectCategory }) {
    const [categories, setCategories] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isFree, setIsFree] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            // Filter for common modules (specialtyId is null)
            const common = res.data.filter(c => !c.specialtyId);
            setCategories(common);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/categories', { name: newCategoryName, specialtyId: null, isFree });
            setNewCategoryName('');
            setIsFree(false);
            setIsCreating(false);
            fetchCategories();
        } catch (error) {
            alert("Erreur lors de la création");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Supprimer ce module et toutes ses questions ?")) return;
        try {
            await axios.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Modules Communs</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les modules transversaux accessibles à tous les étudiants.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                    <Plus className="mr-2" size={20} /> Nouveau Module
                </Button>
            </div>

            {isCreating && (
                <Card className="p-6 border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 mb-6 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 md:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du module</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Ex: Santé Publique"
                                autoFocus
                                required
                            />
                            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isFree}
                                    onChange={(e) => setIsFree(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Module Gratuit (Freemium)
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1 md:flex-none">Créer</Button>
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="flex-1 md:flex-none">Annuler</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                    const isLocked = user.role === 'STUDENT' && !cat.isFree;

                    return (
                        <div
                            key={cat.id}
                            onClick={() => {
                                if (isLocked) {
                                    alert("Ce module est réservé aux membres Premium.");
                                    return;
                                }
                                onSelectCategory(cat);
                            }}
                            className={`group relative rounded-2xl p-6 border shadow-sm transition-all duration-300 overflow-hidden ${isLocked
                                    ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-75'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                                }`}
                        >
                            {!isLocked && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />}

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl transition-colors duration-300 ${isLocked
                                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                                    }`}>
                                    {isLocked ? <Lock size={24} /> : <BookOpen size={24} />}
                                </div>

                                {/* Admin Actions */}
                                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                    <button
                                        onClick={(e) => handleDelete(e, cat.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                {/* Free Badge */}
                                {cat.isFree && (
                                    <span className="absolute top-4 right-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                        GRATUIT
                                    </span>
                                )}
                            </div>

                            <h3 className={`text-lg font-bold mb-2 transition-colors ${isLocked ? 'text-gray-500' : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                }`}>
                                {cat.name}
                            </h3>

                            <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>{cat._count?.questions || 0} questions</span>
                                {!isLocked && <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">Gérer &rarr;</span>}
                                {isLocked && <span className="text-gray-400 font-medium flex items-center gap-1"><Lock size={12} /> Premium</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
