import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Trash2, Plus, CheckCircle, Circle } from 'lucide-react';
import axios from 'axios';

export default function QuestionForm({ initialData, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        text: '',
        categoryId: '',
        difficulty: 'Moyen',
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
        console.log("Submitting form...", formData);

        try {
            if (initialData) {
                console.log("Updating question", initialData.id);
                await axios.put(`/questions/${initialData.id}`, formData);
            } else {
                console.log("Creating new question");
                await axios.post('/questions', formData);
            }
            console.log("Success!");
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
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erreur : </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
                <Input
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    required
                    placeholder="Intitulé de la question"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                    <select
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                    >
                        <option value="" disabled>Choisir une catégorie</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulté</label>
                    <select
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                        <option value="Facile">Facile</option>
                        <option value="Moyen">Moyen</option>
                        <option value="Difficile">Difficile</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Explication (Optionnel)</label>
                <textarea
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 placeholder-gray-400 dark:placeholder-gray-500"
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Expliquez la bonne réponse ici. Cette explication sera visible après le quiz."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Réponses (Cochez les bonnes réponses)</label>
                <div className="space-y-3">
                    {formData.choices.map((choice, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <button
                                type="button"
                                onClick={() => updateChoice(index, 'isCorrect', !choice.isCorrect)}
                                className={`p-2 rounded-full ${choice.isCorrect ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {choice.isCorrect ? <CheckCircle size={20} /> : <Circle size={20} />}
                            </button>
                            <Input
                                value={choice.text}
                                onChange={(e) => updateChoice(index, 'text', e.target.value)}
                                placeholder={`Réponse ${index + 1}`}
                                required
                                className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            {formData.choices.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeChoice(index)}
                                    className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {formData.choices.length < 6 && (
                    <Button type="button" variant="ghost" onClick={addChoice} className="mt-2 text-sm dark:text-gray-300 dark:hover:bg-gray-700">
                        <Plus size={16} className="mr-1" /> Ajouter une réponse
                    </Button>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
}
