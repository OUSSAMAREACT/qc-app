import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import QuestionForm from './QuestionForm';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function QuestionManager({ categoryId }) {
    const [questions, setQuestions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionSearch, setQuestionSearch] = useState('');

    useEffect(() => {
        if (categoryId) {
            fetchQuestions();
        }
    }, [categoryId]);

    const fetchQuestions = async () => {
        try {
            const url = categoryId
                ? `/questions?categoryId=${categoryId}`
                : '/questions';
            const res = await axios.get(url);
            setQuestions(res.data);
        } catch (error) {
            console.error("Failed to fetch questions", error);
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
                <Button onClick={() => { setCurrentQuestion(null); setIsEditing(true); }} className="w-full sm:w-auto shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center">
                    <Plus className="mr-2" size={20} /> <span className="font-medium">Ajouter une question</span>
                </Button>
            </div>

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
                        <Card key={q.id} className="group flex justify-between items-start hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 cursor-default border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex-1 pr-4">
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
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => handleEdit(q)}
                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                    title="Modifier"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(q.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    title="Supprimer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
