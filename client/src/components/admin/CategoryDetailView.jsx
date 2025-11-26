import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import QuestionManager from '../QuestionManager';

export default function CategoryDetailView({ categoryId, onBack }) {
    const [category, setCategory] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchCategory();
    }, [categoryId]);

    const fetchCategory = async () => {
        try {
            const res = await axios.get(`/categories/${categoryId}`);
            setCategory(res.data);
            setNewName(res.data.name);
        } catch (error) {
            console.error("Failed to fetch category", error);
        }
    };

    const handleUpdateName = async () => {
        try {
            await axios.put(`/categories/${categoryId}`, { name: newName, specialtyId: category.specialtyId });
            setCategory({ ...category, name: newName });
            setIsEditingName(false);
        } catch (error) {
            alert("Erreur lors de la mise à jour du nom");
        }
    };

    if (!category) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ArrowLeft size={24} />
                    </Button>

                    {!isEditingName && (
                        <div className="flex items-center gap-3 group">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{category.name}</h2>
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="md:opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 transition-all"
                            >
                                <Edit size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {isEditingName && (
                    <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 text-xl md:text-2xl font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <Button onClick={handleUpdateName} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            <Save size={20} />
                        </Button>
                        <Button onClick={() => setIsEditingName(false)} variant="ghost" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <X size={20} />
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Questions du module</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les questions pour ce module spécifique.</p>
                </div>
                <QuestionManager categoryId={categoryId} />
            </div>
        </div>
    );
}
