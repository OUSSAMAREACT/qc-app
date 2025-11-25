import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import QuestionForm from '../components/QuestionForm';
import CategoryManager from '../components/CategoryManager';
import SpecialtyManager from '../components/SpecialtyManager';
import { Plus, Edit, Trash2, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // null = all
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [view, setView] = useState('questions'); // 'questions' or 'categories'

    // Search states
    const [categorySearch, setCategorySearch] = useState('');
    const [questionSearch, setQuestionSearch] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchQuestions();
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const url = selectedCategory
                ? `/questions?categoryId=${selectedCategory.id}`
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

    // Filtering logic (Updated to startsWith as per user request)
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().startsWith(categorySearch.toLowerCase())
    );

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().startsWith(questionSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
            {/* Top Bar */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Administration - QCM Echelle 11</h1>
                </div>
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${view === 'questions'
                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        onClick={() => setView('questions')}
                    >
                        Questions
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${view === 'categories'
                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        onClick={() => setView('categories')}
                    >
                        Catégories
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${view === 'specialties'
                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        onClick={() => setView('specialties')}
                    >
                        Spécialités
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {view === 'categories' ? (
                    <div className="flex-1 p-6 overflow-auto">
                        <CategoryManager />
                    </div>
                ) : view === 'specialties' ? (
                    <div className="flex-1 p-6 overflow-auto">
                        <SpecialtyManager />
                    </div>
                ) : (
                    <>
                        {/* Sidebar for Categories */}
                        <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto hidden md:flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                    Catégories
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">{categories.length}</span>
                                </h2>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Filtrer les catégories..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 border focus:border-blue-500 rounded-xl text-sm transition-all duration-200 outline-none focus:ring-4 focus:ring-blue-500/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent ${selectedCategory === null
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    Toutes les questions
                                </button>
                                {filteredCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent flex justify-between items-center group ${selectedCategory?.id === cat.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${selectedCategory?.id === cat.id
                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                                            }`}>
                                            {cat._count?.questions || 0}
                                        </span>
                                    </button>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <div className="text-center text-sm text-gray-400 py-8 italic">
                                        Aucune catégorie trouvée
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 p-8 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
                            {isEditing ? (
                                <div className="max-w-3xl mx-auto">
                                    <Card className="shadow-xl border-0 ring-1 ring-gray-100 dark:ring-gray-700 bg-white dark:bg-gray-800">
                                        <QuestionForm
                                            initialData={currentQuestion}
                                            onSuccess={handleSuccess}
                                            onCancel={() => setIsEditing(false)}
                                        />
                                    </Card>
                                </div>
                            ) : (
                                <div className="max-w-5xl mx-auto space-y-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                                {selectedCategory ? selectedCategory.name : 'Toutes les questions'}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                {filteredQuestions.length} question{filteredQuestions.length > 1 ? 's' : ''} trouvée{filteredQuestions.length > 1 ? 's' : ''}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                            <div className="relative flex-1 md:w-80 group">
                                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher une question..."
                                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                    value={questionSearch}
                                                    onChange={(e) => setQuestionSearch(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={() => { setCurrentQuestion(null); setIsEditing(true); }} className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center">
                                                <Plus className="mr-2" size={20} /> <span className="font-medium">Ajouter</span>
                                            </Button>
                                        </div>
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
                                                            {!selectedCategory && (
                                                                <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium border border-gray-200 dark:border-gray-600">
                                                                    {q.category?.name || 'Sans catégorie'}
                                                                </span>
                                                            )}
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
                            )}
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}
