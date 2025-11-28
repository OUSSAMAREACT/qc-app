import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import QuestionForm from './QuestionForm';
import { Plus, Edit, Trash2, Search, MoveRight, CheckSquare, Square, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionManager({ categoryId }) {
    const [questions, setQuestions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionSearch, setQuestionSearch] = useState('');

    // Bulk Actions State
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [targetCategory, setTargetCategory] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (categoryId) {
            fetchQuestions();
        }
        fetchCategories();
    }, [categoryId]);

    const fetchQuestions = async () => {
        try {
            const url = categoryId
                ? `/questions?categoryId=${categoryId}`
                : '/questions';
            const res = await axios.get(url);
            setQuestions(res.data);
            setSelectedQuestions([]); // Reset selection on fetch
        } catch (error) {
            console.error("Failed to fetch questions", error);
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

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette question ?")) return;
        try {
            await axios.delete(`/questions/${id}`);
            setQuestions(prev => prev.filter(q => q.id !== id));
            setSelectedQuestions(prev => prev.filter(qId => qId !== id));
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    const handleEdit = (question) => {
        setCurrentQuestion(question);
        setIsEditing(true);
    };

    const handleSuccess = () => {
        setIsEditing(false);
        setCurrentQuestion(null);
        fetchQuestions();
    };

    // Bulk Action Handlers
    const toggleSelectAll = () => {
        if (selectedQuestions.length === filteredQuestions.length) {
            setSelectedQuestions([]);
        } else {
            setSelectedQuestions(filteredQuestions.map(q => q.id));
        }
    };

    const toggleSelectQuestion = (id) => {
        if (selectedQuestions.includes(id)) {
            setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
        } else {
            setSelectedQuestions([...selectedQuestions, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Supprimer ${selectedQuestions.length} questions ?`)) return;
        try {
            await axios.post('/questions/batch-delete', { questionIds: selectedQuestions });
            fetchQuestions();
        } catch (error) {
            alert("Erreur lors de la suppression de masse");
        }
    };

    const handleBulkMove = async () => {
        if (!targetCategory) return alert("Veuillez sélectionner une catégorie cible");
        try {
            await axios.post('/questions/move', {
                questionIds: selectedQuestions,
                targetCategoryId: targetCategory
            });
            setIsMoveModalOpen(false);
            fetchQuestions();
        } catch (error) {
            alert("Erreur lors du déplacement");
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().startsWith(questionSearch.toLowerCase())
    );

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-xl border-0 ring-1 ring-gray-100 dark:ring-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {currentQuestion ? 'Modifier la question' : 'Nouvelle question'}
                        </h3>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6">
                        <QuestionForm
                            initialData={currentQuestion}
                            categoryId={categoryId}
                            onSuccess={handleSuccess}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full sm:max-w-md group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher une question..."
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <AnimatePresence>
                        {selectedQuestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex gap-2 flex-1 sm:flex-none"
                            >
                                <Button onClick={() => setIsMoveModalOpen(true)} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                                    <MoveRight className="mr-2" size={18} /> <span className="hidden sm:inline">Déplacer</span> ({selectedQuestions.length})
                                </Button>
                                <Button onClick={handleBulkDelete} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-red-900/20">
                                    <Trash2 className="mr-2" size={18} /> <span className="hidden sm:inline">Supprimer</span>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <Button onClick={() => { setCurrentQuestion(null); setIsEditing(true); }} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all flex items-center justify-center">
                        <Plus className="mr-2" size={20} /> <span className="font-medium">Ajouter</span>
                    </Button>
                </div>
            </div>

            {/* Select All Bar */}
            {filteredQuestions.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                    <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {selectedQuestions.length === filteredQuestions.length ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                        Tout sélectionner
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-sm text-gray-500">{selectedQuestions.length} sélectionné(s)</span>
                </div>
            )}

            {filteredQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-4">
                        <Search size={40} className="text-blue-400 dark:text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun résultat</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        {questionSearch
                            ? `Aucune question ne correspond à "${questionSearch}"`
                            : "Commencez par ajouter des questions à ce module."}
                    </p>
                    {questionSearch && (
                        <Button variant="ghost" onClick={() => setQuestionSearch('')} className="mt-6 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            Effacer la recherche
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredQuestions.map((q) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                key={q.id}
                            >
                                <Card
                                    className={`group relative h-full flex flex-col justify-between hover:shadow-xl transition-all duration-300 cursor-default border overflow-hidden ${selectedQuestions.includes(q.id)
                                        ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30 dark:bg-blue-900/20'
                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                                        }`}
                                >
                                    {/* Selection Overlay for click target */}
                                    <div
                                        className="absolute inset-0 z-0 cursor-pointer"
                                        onClick={() => toggleSelectQuestion(q.id)}
                                    />

                                    <div className="relative z-10 p-5 flex items-start gap-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSelectQuestion(q.id); }}
                                            className="mt-1 text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {selectedQuestions.includes(q.id) ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${q.difficulty === 'Facile' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30' :
                                                    q.difficulty === 'Moyen' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30' :
                                                        'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">ID: {q.id}</span>
                                            </div>

                                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-snug mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
                                                {q.text}
                                            </h3>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                                                    {q.choices.length} choix
                                                </span>
                                                {q.explanation && (
                                                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Explication disponible">
                                                        <AlertCircle size={14} /> Explication
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="relative z-20 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700/50 px-4 py-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(q); }}
                                            className="h-8 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                                        >
                                            <Edit size={16} className="mr-1.5" /> Modifier
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                                            className="h-8 px-3 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 size={16} className="mr-1.5" /> Supprimer
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Move Modal */}
            <AnimatePresence>
                {isMoveModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMoveModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Déplacer les questions</h3>
                                <button onClick={() => setIsMoveModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Sélectionner le module de destination
                                    </label>
                                    <select
                                        value={targetCategory}
                                        onChange={(e) => setTargetCategory(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="">Choisir un module...</option>
                                        {categories
                                            .filter(c => c.id !== parseInt(categoryId)) // Exclude current category
                                            .map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} {c.specialty ? `(${c.specialty})` : '(Commun)'}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="ghost" onClick={() => setIsMoveModalOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button onClick={handleBulkMove} disabled={!targetCategory} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                        Déplacer {selectedQuestions.length} questions
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
