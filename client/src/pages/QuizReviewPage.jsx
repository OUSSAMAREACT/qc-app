import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import { Button } from '../components/ui/Button';

const QuizReviewPage = () => {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/quiz/history/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResult(res.data);
            } catch (err) {
                console.error("Error fetching result:", err);
                setError("Impossible de charger les détails du quiz.");
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erreur</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "Résultat non trouvé."}</p>
                <Link to="/history">
                    <Button>Retour à l'historique</Button>
                </Link>
            </div>
        );
    }

    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const isSuccess = percentage >= 50;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12 transition-colors duration-300">
            <SEO
                title={`Résultat du Quiz - ${result.categoryName || 'Général'}`}
                description="Détails de votre performance au quiz."
                url={`/history/${id}`}
            />

            {/* Header */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link to="/history">
                        <Button variant="ghost" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Détails du Quiz
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {result.categoryName || 'Général'} • {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-8 text-center relative overflow-hidden"
                >
                    <div className={`absolute top-0 left-0 w-full h-2 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>

                    <div className="relative z-10">
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Votre Score</div>
                        <div className={`text-6xl font-black mb-2 ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {percentage}%
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                            {result.score} sur {result.totalQuestions} réponses correctes
                        </div>
                    </div>
                </motion.div>

                {/* Questions Review */}
                {!result.details ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 text-center">
                        <AlertCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-blue-700 dark:text-blue-300 font-medium">
                            Les détails des réponses ne sont pas disponibles pour ce quiz (ancien format).
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white px-2">Revue des questions</h3>

                        {result.details.map((detail, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 ${detail.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                                    } border-y border-r border-gray-100 dark:border-gray-700 dark:border-r-gray-700 dark:border-y-gray-700`}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`mt-1 min-w-[24px] ${detail.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                        {detail.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                            {index + 1}. {detail.questionText}
                                        </h4>

                                        <div className="space-y-2">
                                            {detail.choices.map((choice) => {
                                                const isSelected = detail.userSelectedIds.includes(choice.id);
                                                const isCorrect = choice.isCorrect;

                                                let choiceClass = "p-3 rounded-xl border transition-colors flex items-center justify-between ";

                                                if (isCorrect) {
                                                    choiceClass += "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 font-medium";
                                                } else if (isSelected && !isCorrect) {
                                                    choiceClass += "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200";
                                                } else {
                                                    choiceClass += "bg-gray-50 dark:bg-gray-700/30 border-transparent text-gray-600 dark:text-gray-400";
                                                }

                                                return (
                                                    <div key={choice.id} className={choiceClass}>
                                                        <span>{choice.text}</span>
                                                        {isSelected && (
                                                            <span className="text-xs font-bold uppercase px-2 py-1 bg-white/50 rounded-md ml-2">
                                                                Votre choix
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {detail.explanation && (
                                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                                                <span className="font-bold block mb-1">Explication :</span>
                                                {detail.explanation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizReviewPage;
