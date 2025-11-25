import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Plus, Calendar, CheckSquare, Trash2, Users, Trophy, Pencil, X } from 'lucide-react';

export default function WeeklyExamManager() {
    const [exams, setExams] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionObjects, setSelectedQuestionObjects] = useState([]); // Array of {id, text}

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        selectedCategory: '',
        selectedQuestions: [] // Array of IDs
    });

    useEffect(() => {
        fetchExams();
        fetchCategories();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await axios.get('/weekly-exams');
            setExams(res.data);
        } catch (error) {
            console.error("Failed to fetch exams", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleCategoryChange = async (categoryId) => {
        setFormData(prev => ({ ...prev, selectedCategory: categoryId }));
        if (!categoryId) {
            setQuestions([]);
            return;
        }
        try {
            const res = await axios.get(`/questions?categoryId=${categoryId}`);
            setQuestions(res.data);
        } catch (error) {
            console.error("Failed to fetch questions", error);
        }
    };

    const handleQuestionToggle = (question) => {
        const questionId = question.id;
        setFormData(prev => {
            const current = prev.selectedQuestions;
            if (current.includes(questionId)) {
                // Remove
                setSelectedQuestionObjects(prevObjs => prevObjs.filter(q => q.id !== questionId));
                return { ...prev, selectedQuestions: current.filter(id => id !== questionId) };
            } else {
                // Add
                setSelectedQuestionObjects(prevObjs => [...prevObjs, question]);
                return { ...prev, selectedQuestions: [...current, questionId] };
            }
        });
    };

    const handleRemoveQuestion = (questionId) => {
        setFormData(prev => ({
            ...prev,
            selectedQuestions: prev.selectedQuestions.filter(id => id !== questionId)
        }));
        setSelectedQuestionObjects(prev => prev.filter(q => q.id !== questionId));
    };

    const handleEdit = async (examId) => {
        try {
            const res = await axios.get(`/weekly-exams/${examId}`);
            const exam = res.data;

            setFormData({
                title: exam.title,
                description: exam.description || '',
                startDate: new Date(exam.startDate).toISOString().slice(0, 16),
                endDate: new Date(exam.endDate).toISOString().slice(0, 16),
                selectedCategory: '',
                selectedQuestions: exam.questions.map(q => q.id)
            });
            setSelectedQuestionObjects(exam.questions);
            setEditingId(examId);
            setIsCreating(true);
        } catch (error) {
            console.error("Failed to fetch exam details", error);
            alert("Erreur lors du chargement de l'examen");
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            selectedCategory: '',
            selectedQuestions: []
        });
        setSelectedQuestionObjects([]);
        setQuestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                questionIds: formData.selectedQuestions
            };

            if (editingId) {
                await axios.put(`/weekly-exams/${editingId}`, payload);
            } else {
                await axios.post('/weekly-exams', payload);
            }

            handleCancel();
            fetchExams();
        } catch (error) {
            console.error("Failed to save exam", error);
            alert("Erreur lors de l'enregistrement de l'examen");
        }
    };

    const handleDelete = async (examId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet examen ? Cette action est irréversible.")) {
            return;
        }
        try {
            await axios.delete(`/weekly-exams/${examId}`);
            fetchExams();
        } catch (error) {
            console.error("Failed to delete exam", error);
            alert("Erreur lors de la suppression de l'examen");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Partie Commune</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les examens hebdomadaires et consultez les classements.</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)} className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                        <Plus className="mr-2" size={20} /> Nouvel Examen
                    </Button>
                )}
            </div>

            {isCreating ? (
                <Card className="p-6 border-blue-100 dark:border-blue-900/30 bg-white dark:bg-gray-800 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                        {editingId ? 'Modifier l\'examen' : 'Créer un nouvel examen'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Sélection des questions</h4>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Column: Question Picker */}
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrer par module</label>
                                        <select
                                            value={formData.selectedCategory}
                                            onChange={e => handleCategoryChange(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">-- Sélectionner un module --</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {questions.length > 0 ? (
                                        <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2">
                                            {questions.map(q => (
                                                <div key={q.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer" onClick={() => handleQuestionToggle(q)}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.selectedQuestions.includes(q.id)}
                                                        onChange={() => { }} // Handled by div click
                                                        className="mt-1 pointer-events-none"
                                                    />
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{q.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                            <p className="text-gray-500 text-sm">Sélectionnez un module pour voir les questions</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Selected Questions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                        Questions sélectionnées ({formData.selectedQuestions.length})
                                    </label>

                                    {selectedQuestionObjects.length > 0 ? (
                                        <div className="max-h-[420px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2 bg-gray-50 dark:bg-gray-800/50">
                                            {selectedQuestionObjects.map(q => (
                                                <div key={q.id} className="flex justify-between items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-100 dark:border-gray-600">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{q.text}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveQuestion(q.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                            <p className="text-gray-500 text-sm">Aucune question sélectionnée</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={handleCancel}>Annuler</Button>
                            <Button type="submit" disabled={formData.selectedQuestions.length === 0}>
                                {editingId ? 'Enregistrer les modifications' : 'Créer l\'examen'}
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {exams.map(exam => (
                        <Card key={exam.id} className="p-6 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exam.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">{exam.description}</p>
                                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><CheckSquare size={16} /> {exam._count.questions} questions</span>
                                        <span className="flex items-center gap-1"><Users size={16} /> {exam._count.submissions} participants</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => handleEdit(exam.id)}>
                                        <Pencil size={18} />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(exam.id)}>
                                        <Trash2 size={18} />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-blue-600">
                                        <Trophy size={18} />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {exams.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">Aucun examen programmé.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
