import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { ArrowLeft, CheckCircle, XCircle, Trophy, HelpCircle, AlertCircle, Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '../components/ui/Modal';

export default function WeeklyExamResultPage() {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // AI Tutor State
    const [aiExplanation, setAiExplanation] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [selectedQuestionForAI, setSelectedQuestionForAI] = useState(null);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await axios.get('/weekly-exams/active');
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

    const handleExplainAI = async (question) => {
        setSelectedQuestionForAI(question);
        setAiModalOpen(true);
        setAiLoading(true);
        setAiExplanation(null);

        try {
            const userChoiceIds = exam.userAnswers[question.id] || [];
            // Find text for user's answer
            const userChoiceText = question.choices
                .filter(c => userChoiceIds.includes(c.id))
                .map(c => c.text)
                .join(", ") || "Aucune réponse";

            const correctChoiceText = question.choices
                .filter(c => c.isCorrect)
                .map(c => c.text)
                .join(", ");

            const res = await axios.post('/ai-tutor/explain', {
                questionText: question.text,
                userAnswer: userChoiceText,
                correctAnswer: correctChoiceText,
                choices: question.choices,
                userName: exam.userName || "Candidat",
                category: question.category?.name || null // Pass category name
            });

            setAiExplanation(res.data.explanation);
        } catch (err) {
            console.error("AI Tutor Error:", err);
            setAiExplanation("Désolé, je n'ai pas pu générer d'explication pour le moment. Vérifiez que la Base Documentaire contient des documents pertinents.");
        } finally {
            setAiLoading(false);
        }
    };

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
                                                        {isSelected && <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-black/10">Votre choix</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                            {question.explanation && (
                                                <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-1">
                                                        <HelpCircle size={18} /> Explication
                                                    </div>
                                                    <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                                                        {question.explanation}
                                                    </p>
                                                </div>
                                            )}

                                            <Button
                                                variant="outline"
                                                onClick={() => handleExplainAI(question)}
                                                className="self-start bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:shadow-md transition-all"
                                            >
                                                <Sparkles size={18} className="mr-2 text-purple-500" />
                                                Explication
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            <Modal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Brain size={24} />
                        <span>Explication (Basé sur les documents officiels)</span>
                    </div>
                }
            >
                <div className="space-y-4">
                    {aiLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 animate-pulse">Analyse des documents officiels en cours...</p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 mb-4">
                                <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                                    <Sparkles size={16} /> Explication Personnalisée
                                </h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {aiExplanation}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={() => setAiModalOpen(false)}>Fermer</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
