import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Trash2, Plus, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function QuestionForm({ initialData, categoryId, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        text: '',
        categoryId: '',
        difficulty: 'Moyen',
        explanation: '',
        choices: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]
    });
    const [categories, setCategories] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
        if (initialData) {
            setFormData({
                text: initialData.text,
                categoryId: initialData.categoryId || initialData.category?.id || '',
                difficulty: initialData.difficulty,
                explanation: initialData.explanation || '',
                choices: initialData.choices.map(c => ({ text: c.text, isCorrect: c.isCorrect }))
            });
        } else if (categoryId) {
            // Pre-select category if passed via props
            setFormData(prev => ({ ...prev, categoryId: categoryId }));
        }
    }, [initialData, categoryId]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data);
            // Set default category if creating new, categories exist, AND no category is already selected
            if (!initialData && !categoryId && res.data.length > 0) {
                setFormData(prev => ({ ...prev, categoryId: res.data[0].id }));
            }
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validation: At least one correct answer
        if (!formData.choices.some(c => c.isCorrect)) {
            setError("Veuillez sélectionner au moins une bonne réponse.");
            setIsSubmitting(false);
            return;
        }

        try {
            if (initialData) {
                await axios.put(`/questions/${initialData.id}`, formData);
            } else {
                await axios.post('/questions', formData);
            }
            onSuccess();
        } catch (error) {
            console.error("Submission error:", error);
            setError(error.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateChoice = (index, field, value) => {
        const newChoices = [...formData.choices];
        newChoices[index][field] = value;
        setFormData({ ...formData, choices: newChoices });
    };

    const addChoice = () => {
        if (formData.choices.length < 6) {
            setFormData({
                ...formData,
                choices: [...formData.choices, { text: '', isCorrect: false }]
            });
        }
    };

    const removeChoice = (index) => {
        if (formData.choices.length > 2) {
            const newChoices = formData.choices.filter((_, i) => i !== index);
            setFormData({ ...formData, choices: newChoices });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2" role="alert">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Question</label>
                    <Input
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        required
                        placeholder="Intitulé de la question"
                        className="text-lg font-medium bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-3"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Catégorie</label>
                        <div className="relative">
                            <select
                                className={`w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${categoryId ? 'opacity-60 cursor-not-allowed' : ''}`}
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                                disabled={!!categoryId}
                            >
                                <option value="" disabled>Choisir une catégorie</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Difficulté</label>
                        <div className="relative">
                            <select
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            >
                                <option value="Facile">Facile</option>
                                <option value="Moyen">Moyen</option>
                                <option value="Difficile">Difficile</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Explication (Optionnel)</label>
                    <textarea
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                        value={formData.explanation || ''}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        placeholder="Expliquez la bonne réponse ici. Cette explication sera visible après le quiz."
                    />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Réponses</label>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                        Cochez les bonnes réponses
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.choices.map((choice, index) => (
                        <div
                            key={index}
                            className={`group flex gap-3 items-center p-3 rounded-xl border transition-all duration-200 ${choice.isCorrect
                                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 ring-1 ring-green-500/20'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                                }`}
                        >
                            <button
                                type="button"
                                onClick={() => updateChoice(index, 'isCorrect', !choice.isCorrect)}
                                className={`flex-shrink-0 p-1 rounded-full transition-colors ${choice.isCorrect
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
                                    }`}
                            >
                                {choice.isCorrect ? <CheckCircle size={24} className="fill-green-100 dark:fill-green-900/20" /> : <Circle size={24} />}
                            </button>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={choice.text}
                                    onChange={(e) => updateChoice(index, 'text', e.target.value)}
                                    placeholder={`Réponse ${index + 1}`}
                                    required
                                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-2 py-1 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-colors"
                                />
                            </div>
                            {formData.choices.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeChoice(index)}
                                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Supprimer cette réponse"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.choices.length < 6 && (
                        <button
                            type="button"
                            onClick={addChoice}
                            className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/10"
                        >
                            <Plus size={20} />
                            <span className="font-medium">Ajouter une réponse</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8">
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer la question'}
                </Button>
            </div>
        </form>
    );
}
