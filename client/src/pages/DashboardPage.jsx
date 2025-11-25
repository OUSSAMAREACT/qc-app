import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Clock, Award, BarChart2, BookOpen } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchHistory();
        fetchCategories();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/quiz/history');
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
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

    // Helper to assign gradients based on index
    const getCategoryGradient = (index) => {
        const gradients = [
            'from-emerald-500 to-teal-600',
            'from-blue-500 to-indigo-600',
            'from-purple-500 to-pink-600',
            'from-orange-500 to-red-600',
            'from-cyan-500 to-blue-600',
            'from-rose-500 to-orange-600'
        ];
        return gradients[index % gradients.length];
    };

    const averageScore = history.length > 0
        ? Math.round(history.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0) / history.length)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
                {/* Welcome Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left transition-colors duration-300">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Bonjour, {user.name} 👋</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">Prêt à tester vos connaissances aujourd'hui ?</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 w-full md:w-auto justify-center">
                        <div className="text-center px-4 border-r border-gray-200 dark:border-gray-600 last:border-0">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{history.length}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mt-1">Quiz Terminés</div>
                        </div>
                        <div className="text-center px-4">
                            <div className={`text-2xl font-bold ${averageScore >= 50 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {averageScore}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mt-1">Score Moyen</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Main Content: Modules */}
                    {/* Main Content: Modules */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Common Modules */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BookOpen className="text-blue-600 dark:text-blue-400" size={24} /> Tronc Commun
                                </h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                    {categories.filter(c => !c.specialty).length} disponibles
                                </span>
                            </div>

                            {categories.filter(c => !c.specialty).length === 0 ? (
                                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400">Aucun module commun disponible.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-5">
                                    {categories.filter(c => !c.specialty).map((cat, index) => (
                                        <div key={cat.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                                            <div className={`h-2 w-full bg-gradient-to-r ${getCategoryGradient(index)}`} />
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {cat.name}
                                                    </h3>
                                                    <span className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-600">
                                                        {cat._count?.questions || 0} Q
                                                    </span>
                                                </div>

                                                <div className="mt-auto pt-4">
                                                    <Link to={`/quiz?category=${encodeURIComponent(cat.name)}`}>
                                                        <Button className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-blue-600 dark:hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/20 cursor-pointer">
                                                            <Play size={16} fill="currentColor" /> Commencer
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Specialty Modules */}
                        {user.specialty && categories.filter(c => c.specialty === user.specialty).length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Award className="text-emerald-600 dark:text-emerald-400" size={24} /> Spécialité: {user.specialty}
                                    </h2>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                        {categories.filter(c => c.specialty === user.specialty).length} disponibles
                                    </span>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    {categories.filter(c => c.specialty === user.specialty).map((cat, index) => (
                                        <div key={cat.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                                            <div className={`h-2 w-full bg-gradient-to-r ${getCategoryGradient(index + 5)}`} />
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {cat.name}
                                                    </h3>
                                                    <span className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-600">
                                                        {cat._count?.questions || 0} Q
                                                    </span>
                                                </div>

                                                <div className="mt-auto pt-4">
                                                    <Link to={`/quiz?category=${encodeURIComponent(cat.name)}`}>
                                                        <Button className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/20 cursor-pointer">
                                                            <Play size={16} fill="currentColor" /> Commencer
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Recent Activity */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="text-blue-600 dark:text-blue-400" size={24} /> Activités Récentes
                        </h2>

                        <Card className="border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                            {history.length === 0 ? (
                                <div className="text-center py-8 px-4">
                                    <div className="bg-gray-50 dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <BarChart2 className="text-gray-400 dark:text-gray-500" size={20} />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun quiz effectué pour le moment.</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Vos résultats apparaîtront ici.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {history.slice(0, 5).map((result) => (
                                        <div key={result.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                    {result.categoryName || "Quiz"}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(result.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} • {new Date(result.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className={`text-sm font-bold ${(result.score / result.totalQuestions) >= 0.5 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {Math.round((result.score / result.totalQuestions) * 100)}%
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {result.score}/{result.totalQuestions}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {history.length > 5 && (
                                        <div className="p-3 text-center bg-gray-50 dark:bg-gray-700/50">
                                            <Link to="/history">
                                                <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">
                                                    Voir tout l'historique
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Motivation Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                                    <Award className="text-white" size={20} />
                                </div>
                                <h3 className="font-bold text-lg mb-1">Continuez comme ça !</h3>
                                <p className="text-blue-100 text-sm mb-4">La régularité est la clé du succès. Faites un quiz par jour.</p>
                            </div>
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-blue-500/30 rounded-full blur-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
