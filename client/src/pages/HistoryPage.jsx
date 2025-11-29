import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Clock, BookOpen, BarChart2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/quiz/history');
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12 transition-colors duration-300">
            <SEO
                title="Mon Historique"
                description="Consultez l'historique de vos quiz et suivez votre progression sur QCMEchelle11."
                url="/history"
            />
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="text-blue-600 dark:text-blue-400" size={24} /> Historique complet
                    </h1>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Chargement de l'historique...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart2 className="text-gray-400 dark:text-gray-500" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun historique</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Vous n'avez pas encore effectué de quiz.</p>
                        <Link to="/dashboard">
                            <Button>Retour au tableau de bord</Button>
                        </Link>
                    </div>
                ) : (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {history.map((result) => (
                                <div key={result.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${(result.score / result.totalQuestions) >= 0.5
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>
                                            <BookOpen size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                                                {result.categoryName || "Quiz"}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <Clock size={14} />
                                                {new Date(result.createdAt).toLocaleDateString('fr-FR', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                                <span>•</span>
                                                {new Date(result.createdAt).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-2xl font-bold mb-1 ${(result.score / result.totalQuestions) >= 0.5
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {Math.round((result.score / result.totalQuestions) * 100)}%
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            Score: {result.score}/{result.totalQuestions}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
