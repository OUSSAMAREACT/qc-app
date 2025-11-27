import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import QuestionForm from './QuestionForm';
import { Plus, Edit, Trash2, Search, MoveRight, CheckSquare, Square, X } from 'lucide-react';

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
            fetchQuestions();
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
            <div className="max-w-3xl mx-auto">
                <Card className="shadow-xl border-0 ring-1 ring-gray-100 dark:ring-gray-700 bg-white dark:bg-gray-800">
                    <QuestionForm
                        initialData={currentQuestion}
                        categoryId={categoryId}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsEditing(false)}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full sm:max-w-md group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher une question..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {selectedQuestions.length > 0 && (
                        <>
                            <Button onClick={() => setIsMoveModalOpen(true)} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white">
                                <MoveRight className="mr-2" size={20} /> Déplacer ({selectedQuestions.length})
                            </Button>
                            <Button onClick={handleBulkDelete} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white">
                                <Trash2 className="mr-2" size={20} /> Supprimer ({selectedQuestions.length})
                            </Button>
                        </>
                    )}
                    <Button onClick={() => { setCurrentQuestion(null); setIsEditing(true); }} className="flex-1 sm:flex-none shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center">
                        <Plus className="mr-2" size={20} /> <span className="font-medium">Ajouter</span>
                    </Button>
                </div>
            </div>

            {/* Select All Bar */}
            {filteredQuestions.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        {selectedQuestions.length === filteredQuestions.length ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                        Tout sélectionner
                    </button>
                    <span className="text-sm text-gray-400">|</span>
                    <span className="text-sm text-gray-500">{selectedQuestions.length} sélectionné(s)</span>
                </div>
            )}

            {filteredQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full mb-4">
                        <Search size={32} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun résultat</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                        {questionSearch
                            ? `Aucune question ne commence par "${questionSearch}"`
                            : "Il n'y a pas encore de questions dans cette catégorie."}
                    </p>
                    {questionSearch && (
                        <Button variant="ghost" onClick={() => setQuestionSearch('')} className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            Effacer la recherche
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredQuestions.map((q) => (
                        <Card
                            key={q.id}
                            className={`group flex justify-between items-start hover:shadow-lg transition-all duration-200 cursor-default border bg-white dark:bg-gray-800 ${selectedQuestions.includes(q.id)
                                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10 dark:bg-blue-900/10'
                                    : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
                                }`}
                        >
                            <div className="flex items-start gap-4 flex-1 pr-4">
                                <button onClick={() => toggleSelectQuestion(q.id)} className="mt-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                                    {selectedQuestions.includes(q.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                                </button>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium border ${q.difficulty === 'Facile' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30' :
                                            q.difficulty === 'Moyen' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30' :
                                                'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30'
                                            }`}>
                                            {q.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-gray-900 dark:text-white text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{q.text}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        {q.choices.length} choix de réponse
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => handleEdit(q)}
                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all cursor-pointer"
                                    title="Modifier"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(q.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"
                                    title="Supprimer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Move Modal */}
            {isMoveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Déplacer les questions</h3>
                            <button onClick={() => setIsMoveModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sélectionner le module de destination
                            </label>
                            <select
                                value={targetCategory}
                                onChange={(e) => setTargetCategory(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
                            <Button onClick={handleBulkMove} disabled={!targetCategory} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Déplacer {selectedQuestions.length} questions
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
