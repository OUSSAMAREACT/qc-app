import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { ArrowLeft, CheckCircle, XCircle, Trophy, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeeklyExamResultPage() {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await axios.get('/weekly-exams/active'); // Or fetch by ID if needed, but active is safer for now
                // Ideally we should have an endpoint to get a specific exam result even if not active, 
                // but for now let's assume the user is viewing the active exam they just finished.
                // If we need past exams, we'd need a new endpoint. 
                // Let's stick to active for now as per the flow.
                setExam(response.data);
            } catch (err) {
                console.error("Error fetching exam result:", err);
                setError("Impossible de charger les résultats.");
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Chargement des résultats...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!exam || !exam.isSubmitted) return <div className="p-8 text-center">Aucun résultat disponible.</div>;

    const userAnswers = exam.userAnswers || {};

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Retour au Dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-8"
            >
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">Résultats : {exam.title}</h1>
                    <div className="text-6xl font-bold mb-4">{exam.userScore} <span className="text-2xl opacity-75">/ {exam.questions.length}</span></div>
                    <p className="text-indigo-100 mb-6">
                        {exam.userScore === exam.questions.length ? "Excellent ! Un sans faute !" :
                            exam.userScore >= exam.questions.length / 2 ? "Bien joué ! Continuez comme ça." : "Courage, la persévérance est la clé !"}
                    </p>

                    <Link to={`/weekly-exam/${exam.id}/leaderboard`}>
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-bold shadow-lg flex items-center gap-2 mx-auto">
                            <Trophy size={20} /> Voir le Classement
                        </Button>
                    </Link>
                </div>

                <div className="p-8 space-y-8">
                    {exam.questions.map((question, index) => {
                        const userChoiceIds = userAnswers[question.id] || [];
                        const correctChoices = question.choices.filter(c => c.isCorrect);
                        const correctChoiceIds = correctChoices.map(c => c.id);

                        // Determine if user got it right
                        const isCorrect = userChoiceIds.length === correctChoiceIds.length &&
                            userChoiceIds.every(id => correctChoiceIds.includes(id));

                        return (
                            <div key={question.id} className={`border rounded-2xl p-6 ${isCorrect ? 'border-green-200 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10' : 'border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10'}`}>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`mt-1 p-2 rounded-full ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Question {index + 1}
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">{question.text}</p>

                                        <div className="space-y-2 mb-4">
                                            {question.choices.map(choice => {
                                                const isSelected = userChoiceIds.includes(choice.id);
                                                const isActuallyCorrect = choice.isCorrect;

                                                let choiceClass = "p-3 rounded-xl border flex items-center justify-between ";
                                                if (isActuallyCorrect) {
                                                    choiceClass += "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-200";
                                                } else if (isSelected && !isActuallyCorrect) {
                                                    choiceClass += "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200";
                                                } else {
                                                    choiceClass += "bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 opacity-70";
                                                }

                                                return (
                                                    <div key={choice.id} className={choiceClass}>
                                                        <span>{choice.text}</span>
                                                        {isSelected && (
                                                            <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-black/10">Votre choix</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {question.explanation && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-1">
                                                    <HelpCircle size={18} /> Explication
                                                </div>
                                                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                                                    {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
