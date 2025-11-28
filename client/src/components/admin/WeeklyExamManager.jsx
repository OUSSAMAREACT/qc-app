import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Plus, Calendar, CheckSquare, Trash2, Users, Trophy, Pencil, X, CheckCircle, FileText, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WeeklyExamManager() {
    const [exams, setExams] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionObjects, setSelectedQuestionObjects] = useState([]); // Array of {id, text}
    const [loading, setLoading] = useState(true);
    const [questionSearch, setQuestionSearch] = useState('');

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
        setQuestionSearch('');
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

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(questionSearch.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Examen de la semaine</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les examens hebdomadaires et consultez les classements.</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => {
                        setEditingId(null);
                        setFormData({
                            title: '',
                            description: '',
                            startDate: new Date().toISOString().slice(0, 16),
                            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                            selectedCategory: '',
                            selectedQuestions: []
                        });
                        setSelectedQuestionObjects([]);
                        setIsCreating(true);
                    }} className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                        <Plus size={20} className="mr-2" /> Créer un examen
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isCreating ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full"
                    >
                        <Card className="overflow-hidden border-0 ring-1 ring-gray-100 dark:ring-gray-700 shadow-xl">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    {editingId ? 'Modifier l\'examen' : 'Créer un nouvel examen'}
                                </h3>
                                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Titre</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="Ex: Examen de Cardiologie - Semaine 42"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                                            <textarea
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Instructions pour les étudiants..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Date de début</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Date de fin</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={formData.endDate}
                                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Question Selection UI */}
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <CheckSquare className="text-blue-500" size={20} />
                                            Sélection des questions
                                            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full ml-2">
                                                {formData.selectedQuestions.length} sélectionnées
                                            </span>
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                                        {/* Left Column: Filter & Add */}
                                        <div className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700 space-y-3">
                                                <select
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={formData.selectedCategory}
                                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                                >
                                                    <option value="">Choisir un module source...</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Filtrer les questions..."
                                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={questionSearch}
                                                        onChange={(e) => setQuestionSearch(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-gray-50/50 dark:bg-gray-900/20">
                                                {questions.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm p-4 text-center">
                                                        <AlertCircle size={32} className="mb-2 opacity-50" />
                                                        <p>Sélectionnez un module pour voir les questions.</p>
                                                    </div>
                                                ) : filteredQuestions.length === 0 ? (
                                                    <p className="text-center text-gray-500 py-8 text-sm">Aucune question trouvée.</p>
                                                ) : (
                                                    filteredQuestions.map(q => {
                                                        const isSelected = formData.selectedQuestions.includes(q.id);
                                                        return (
                                                            <div
                                                                key={q.id}
                                                                onClick={() => handleQuestionToggle(q)}
                                                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                                                    }`}
                                                            >
                                                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected
                                                                    ? 'bg-blue-500 border-blue-500 text-white'
                                                                    : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
                                                                    }`}>
                                                                    {isSelected && <CheckSquare size={14} />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{q.text}</p>
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{q.category?.name}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Column: Selected Questions List */}
                                        <div className="flex flex-col border border-blue-100 dark:border-blue-900/30 rounded-xl overflow-hidden bg-blue-50/30 dark:bg-blue-900/5 shadow-sm">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 flex justify-between items-center h-[58px]">
                                                <h5 className="font-bold text-sm text-blue-900 dark:text-blue-100">Questions retenues</h5>
                                                {formData.selectedQuestions.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, selectedQuestions: [] }));
                                                            setSelectedQuestionObjects([]);
                                                        }}
                                                        className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    >
                                                        Tout retirer
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                                {selectedQuestionObjects.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm p-4 text-center">
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3 text-blue-400">
                                                            <ArrowRight size={24} />
                                                        </div>
                                                        <p>Aucune question sélectionnée</p>
                                                        <p className="text-xs mt-1 opacity-70">Cochez des questions à gauche pour les ajouter</p>
                                                    </div>
                                                ) : (
                                                    selectedQuestionObjects.map((q, idx) => (
                                                        <div key={q.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm group hover:shadow-md transition-all">
                                                            <span className="text-xs font-bold font-mono text-blue-500 mt-0.5 w-6">{idx + 1}.</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{q.text}</p>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">{q.category?.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveQuestion(q.id)}
                                                                className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <Button type="button" variant="ghost" onClick={handleCancel} className="dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Button>
                                    <Button type="submit" disabled={formData.selectedQuestions.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                        {editingId ? 'Mettre à jour l\'examen' : 'Créer l\'examen'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {exams.map(exam => {
                            const isActive = new Date() >= new Date(exam.startDate) && new Date() <= new Date(exam.endDate);
                            const isFuture = new Date() < new Date(exam.startDate);
                            const isFinished = new Date() > new Date(exam.endDate);

                            return (
                                <motion.div
                                    key={exam.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className={`h-full flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-300 border ${isActive ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-gray-100 dark:border-gray-700'
                                        }`}>
                                        {isActive && (
                                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                                EN COURS
                                            </div>
                                        )}
                                        {isFuture && (
                                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                                À VENIR
                                            </div>
                                        )}
                                        {isFinished && (
                                            <div className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                                TERMINÉ
                                            </div>
                                        )}

                                        <div className="p-6 flex-1">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {exam.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10">
                                                    {exam.description || "Aucune description"}
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-gray-500"><Calendar size={14} /> Fin</span>
                                                    <span className="font-medium">{new Date(exam.endDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-gray-500"><Users size={14} /> Participants</span>
                                                    <span className="font-medium">{exam._count.submissions}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-gray-500"><FileText size={14} /> Questions</span>
                                                    <span className="font-medium">{exam._count.questions}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center gap-2">
                                            <Link to={`/weekly-exam/${exam.id}/leaderboard`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full hover:bg-white dark:hover:bg-gray-700">
                                                    <Trophy size={14} className="mr-2 text-yellow-500" /> Classement
                                                </Button>
                                            </Link>

                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(exam.id)} className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600">
                                                    <Pencil size={16} />
                                                </Button>
                                                {isActive && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 rounded-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                        onClick={() => handleFinalize(exam.id)}
                                                        title="Terminer maintenant"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(exam.id)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
