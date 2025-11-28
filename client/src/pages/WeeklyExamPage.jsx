import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Clock, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WeeklyExamPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // { questionId: [choiceId1, choiceId2] }
    const [submitting, setSubmitting] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        fetchExam();
    }, [id]);

    useEffect(() => {
        if (exam && exam.endDate) {
            const timer = setInterval(() => {
                const now = new Date();
                const end = new Date(exam.endDate);
                const diff = end - now;
                if (diff <= 0) {
                    setTimeLeft(0);
                    clearInterval(timer);
                    // Optionally auto-submit here
                } else {
                    setTimeLeft(diff);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [exam]);

    const fetchExam = async () => {
        try {
            const res = await axios.get('/weekly-exams/active');
            if (res.data && res.data.id === parseInt(id)) {
                setExam(res.data);
                if (res.data.savedAnswers) {
                    setAnswers(res.data.savedAnswers);
                }
            } else {
                setExam(res.data);
                if (res.data && res.data.savedAnswers) {
                    setAnswers(res.data.savedAnswers);
                }
            }
        } catch (error) {
            console.error("Failed to fetch exam", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, choiceId) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            let newAnswersForQuestion;

            if (currentAnswers.includes(choiceId)) {
                newAnswersForQuestion = currentAnswers.filter(id => id !== choiceId);
            } else {
                newAnswersForQuestion = [...currentAnswers, choiceId];
            }

            const newAnswers = {
                ...prev,
                [questionId]: newAnswersForQuestion.length > 0 ? newAnswersForQuestion : undefined
            };

            // Debounced save
            saveProgress(newAnswers);

            return newAnswers;
        });
    };

    // Simple debounce for saving progress
    const saveProgress = async (currentAnswers) => {
        if (!exam) return;
        try {
            // Clean up undefined answers before sending
            const cleanAnswers = {};
            Object.keys(currentAnswers).forEach(key => {
                if (currentAnswers[key]) cleanAnswers[key] = currentAnswers[key];
            });

            await axios.post('/weekly-exams/progress', {
                examId: exam.id,
                answers: cleanAnswers
            });
        } catch (error) {
            console.error("Failed to save progress", error);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < exam.questions.length - 1) {
            setDirection(1);
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setDirection(-1);
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleJumpTo = (index) => {
        setDirection(index > currentQuestionIndex ? 1 : -1);
        setCurrentQuestionIndex(index);
        setIsSidebarOpen(false);
    };

    const handleSubmit = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir soumettre vos réponses ? Vous ne pourrez plus les modifier.")) {
            return;
        }

        setSubmitting(true);
        try {
            const cleanAnswers = {};
            Object.keys(answers).forEach(key => {
                if (answers[key]) cleanAnswers[key] = answers[key];
            });

            await axios.post('/weekly-exams/submit', {
                examId: exam.id,
                answers: cleanAnswers
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to submit exam", error);
            alert("Erreur lors de la soumission. Veuillez réessayer.");
            setSubmitting(false);
        }
    };

    const formatTime = (ms) => {
        if (ms === null) return "--:--:--";
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days}j ${hours}h ${minutes}m`;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!exam) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun examen trouvé</h2>
                <Button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
            </div>
        </div>
    );

    if (exam.isSubmitted) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Examen déjà complété</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Vous avez déjà soumis vos réponses pour cet examen.</p>
                <Button className="w-full" onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
            </div>
        </div>
    );

    const currentQuestion = exam.questions[currentQuestionIndex];
    const totalQuestions = exam.questions.length;
    const answeredCount = Object.keys(answers).filter(k => answers[k] && answers[k].length > 0).length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
                            <Menu size={20} />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                                {exam.title}
                            </h1>
                            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                                Question {currentQuestionIndex + 1} sur {totalQuestions}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-medium text-sm ${timeLeft < 300000 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            <Clock size={16} />
                            {formatTime(timeLeft)}
                        </div>
                        <Button
                            onClick={handleSubmit}
                            className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={submitting}
                        >
                            {submitting ? 'Envoi...' : 'Terminer'}
                        </Button>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 bg-gray-200 dark:bg-gray-700 w-full">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
                <AnimatePresence mode='wait' custom={direction}>
                    <motion.div
                        key={currentQuestion.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full"
                    >
                        <Card className="p-4 md:p-8 shadow-xl border-0 bg-white dark:bg-gray-800/80 backdrop-blur-sm ring-1 ring-gray-100 dark:ring-gray-700/50">
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide uppercase mb-2">
                                    Question {currentQuestionIndex + 1}
                                </span>
                                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                                    {currentQuestion.text}
                                </h2>

                            </div>

                            <div className="space-y-3">
                                {currentQuestion.choices.map((choice) => {
                                    const isSelected = answers[currentQuestion.id]?.includes(choice.id);
                                    return (
                                        <motion.div
                                            key={choice.id}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => handleOptionSelect(currentQuestion.id, choice.id)}
                                            className={`relative p-3 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${isSelected
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10'
                                                : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                                    ? 'border-blue-500 bg-blue-500 text-white'
                                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                                                    }`}>
                                                    {isSelected && <CheckCircle size={16} />}
                                                </div>
                                                <span className={`text-base md:text-lg ${isSelected ? 'text-blue-900 dark:text-blue-100 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {choice.text}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`px-6 py-6 text-base rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 ${currentQuestionIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ChevronLeft className="mr-2" size={20} /> Précédent
                    </Button>

                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-6 text-base rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                        >
                            {submitting ? 'Envoi...' : 'Terminer l\'examen'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            className="px-8 py-6 text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                        >
                            Suivant <ChevronRight className="ml-2" size={20} />
                        </Button>
                    )}
                </div>
            </main>

            {/* Question Navigator Sidebar (Mobile/Desktop Drawer) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 z-50 shadow-2xl p-6 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Navigation</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                                    <X size={20} />
                                </Button>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {exam.questions.map((q, idx) => {
                                    const isAnswered = answers[q.id] && answers[q.id].length > 0;
                                    const isCurrent = currentQuestionIndex === idx;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleJumpTo(idx)}
                                            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${isCurrent
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-900'
                                                : isAnswered
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <div className="w-3 h-3 rounded bg-blue-600"></div> Actuelle
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-200"></div> Répondue
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700"></div> Non répondue
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
