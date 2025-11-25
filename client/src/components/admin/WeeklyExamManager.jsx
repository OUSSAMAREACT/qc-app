import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Plus, Calendar, CheckSquare, Trash2, Users, Trophy, Pencil, X, CheckCircle, FileText } from 'lucide-react';

export default function WeeklyExamManager() {
    const [exams, setExams] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionObjects, setSelectedQuestionObjects] = useState([]); // Array of {id, text}
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
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

    const handleFinalize = async (examId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir terminer cet examen maintenant ? Les badges seront attribués aux gagnants.")) {
            return;
        }
        try {
            await axios.post(`/weekly-exams/${examId}/finalize`);
            fetchExams();
            alert("Examen terminé et badges attribués !");
        } catch (error) {
            console.error("Failed to finalize exam", error);
            alert("Erreur lors de la finalisation de l'examen");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Examen de la semaine (Partie Commune)</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les examens hebdomadaires et consultez les classements.</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => {
                        setEditingExam(null);
                        setFormData({
                            title: '',
                            description: '',
                            startDate: new Date().toISOString().slice(0, 16),
                            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                            questionIds: []
                        });
                        setSelectedQuestions([]);
                        setIsCreating(true);
                    }}>
                        <Plus size={20} className="mr-2" /> Créer un examen
                    </Button>
                )}
            </div>

            {isCreating ? (
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">{editingExam ? 'Modifier l\'examen' : 'Créer un nouvel examen'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Titre</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date de début</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date de fin</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Question Selection UI */}
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium mb-4">Sélection des questions ({selectedQuestions.length} sélectionnées)</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Filter & Add */}
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                                            value={selectedModule}
                                            onChange={(e) => setSelectedModule(e.target.value)}
                                        >
                                            <option value="">Tous les modules</option>
                                            {modules.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="h-96 overflow-y-auto border rounded-lg p-2 space-y-2 bg-gray-50 dark:bg-gray-900/50">
                                        {availableQuestions.length === 0 ? (
                                            <p className="text-center text-gray-500 py-4">Aucune question disponible dans ce module.</p>
                                        ) : (
                                            availableQuestions.map(q => {
                                                const isSelected = selectedQuestions.some(sq => sq.id === q.id);
                                                return (
                                                    <div key={q.id} className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleQuestionToggle(q)}
                                                            className="mt-1"
                                                        />
                                                        <div className="text-sm">
                                                            <p className="font-medium line-clamp-2">{q.text}</p>
                                                            <span className="text-xs text-gray-500">{q.category?.name}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Selected Questions List */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center h-[42px]">
                                        <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300">Questions retenues</h5>
                                        {selectedQuestions.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedQuestions([])}
                                                className="text-xs text-red-500 hover:text-red-600"
                                            >
                                                Tout retirer
                                            </button>
                                        )}
                                    </div>

                                    <div className="h-96 overflow-y-auto border rounded-lg p-2 space-y-2 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                                        {selectedQuestions.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                                <p>Aucune question sélectionnée</p>
                                                <p className="text-xs mt-1">Cochez des questions à gauche pour les ajouter</p>
                                            </div>
                                        ) : (
                                            selectedQuestions.map((q, idx) => (
                                                <div key={q.id} className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800 shadow-sm relative group">
                                                    <span className="text-xs font-mono text-blue-500 mt-0.5 w-5">{idx + 1}.</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                                                        <span className="text-xs text-gray-500">{q.category?.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuestionToggle(q)}
                                                        className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Annuler</Button>
                            <Button type="submit" disabled={selectedQuestions.length === 0}>
                                {editingExam ? 'Mettre à jour' : 'Créer l\'examen'}
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {exams.map(exam => {
                        const isActive = new Date() >= new Date(exam.startDate) && new Date() <= new Date(exam.endDate);
                        return (
                            <Card key={exam.id} className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold">{exam.title}</h3>
                                            {isActive ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">En cours</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Terminé</span>
                                            )}
                                        </div>
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Calendar size={14} /> Fin: {new Date(exam.endDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Users size={14} /> {exam._count.submissions} participants</span>
                                            <span className="flex items-center gap-1"><FileText size={14} /> {exam._count.questions} questions</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to={`/weekly-exam/${exam.id}/leaderboard`}>
                                            <Button variant="outline" size="sm">
                                                <Trophy size={16} className="mr-2" /> Classement
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(exam.id)}>
                                            <Pencil size={16} />
                                        </Button>
                                        {isActive && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                onClick={() => handleFinalize(exam.id)}
                                                title="Terminer maintenant"
                                            >
                                                <CheckCircle size={16} />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(exam.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
