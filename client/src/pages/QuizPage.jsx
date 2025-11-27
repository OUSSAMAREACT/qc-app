import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { AlertTriangle, Clock, Volume2 } from 'lucide-react';

// Simple beep sound (base64)
const BEEP_SOUND = "data:audio/wav;base64,UklGRl9vT1BXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Placeholder, will use a real one or AudioContext

export default function QuizPage() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: [choiceId, choiceId] }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [totalTime, setTotalTime] = useState(0);
    const timerRef = useRef(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    useEffect(() => {
        fetchQuiz();
        return () => clearInterval(timerRef.current);
    }, [categoryParam]);

    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmit(true); // Auto submit
                        return 0;
                    }
                    // Play sound in last 10 seconds (every second)
                    if (prev <= 11 && prev > 1) {
                        playTickSound();
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft]);

    const playTickSound = () => {
        // Simple oscillator beep using Web Audio API to avoid external files
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 800;
                gain.gain.value = 0.1;
                osc.start();
                setTimeout(() => osc.stop(), 100);
            }
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const url = categoryParam
                ? `/quiz/start?limit=1000&category=${encodeURIComponent(categoryParam)}`
                : '/quiz/start?limit=1000';

            const res = await axios.get(url);
            setQuestions(res.data);

            // Calculate time: 2 mins per question, rounded up to nearest 5 mins
            if (res.data.length > 0) {
                const rawMinutes = res.data.length * 2;
                const totalMinutes = Math.ceil(rawMinutes / 5) * 5;
                const seconds = totalMinutes * 60;
                setTotalTime(seconds);
                setTimeLeft(seconds);
            }
        } catch (error) {
            console.error("Failed to start quiz", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleChoice = (questionId, choiceId) => {
        setAnswers(prev => {
            const currentSelected = prev[questionId] || [];
            if (currentSelected.includes(choiceId)) {
                return { ...prev, [questionId]: currentSelected.filter(id => id !== choiceId) };
            } else {
                return { ...prev, [questionId]: [...currentSelected, choiceId] };
            }
        });
    };

    const handleSpeak = (question) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech

            const textToRead = `${question.text}. Options: ${question.choices.map(c => c.text).join('. ')}`;
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'fr-FR'; // French
            utterance.rate = 1.0; // Normal speed

            window.speechSynthesis.speak(utterance);
        } else {
            alert("Votre navigateur ne supporte pas la lecture audio.");
        }
    };

    const handleFinishClick = () => {
        setConfirmModalOpen(true);
    };

    const handleSubmit = async (auto = false) => {
        if (!auto) setConfirmModalOpen(false);
        setSubmitting(true);
        clearInterval(timerRef.current); // Stop timer

        try {
            // Format answers for API
            const formattedAnswers = Object.entries(answers).map(([qId, choiceIds]) => ({
                questionId: parseInt(qId),
                selectedChoiceIds: choiceIds
            }));

            // Add unanswered questions as empty
            questions.forEach(q => {
                if (!answers[q.id]) {
                    formattedAnswers.push({ questionId: q.id, selectedChoiceIds: [] });
                }
            });

            const res = await axios.post('/quiz/submit', {
                answers: formattedAnswers,
                categoryName: categoryParam || (questions[0]?.category?.name || "Général")
            });
            navigate('/result', { state: { result: res.data, category: categoryParam } });
        } catch (error) {
            console.error("Failed to submit quiz", error);
            if (!auto) alert("Erreur lors de la soumission.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement du quiz...</div>;
    if (questions.length === 0) return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center gap-4">
            <p className="text-gray-500">Aucune question disponible pour cette catégorie.</p>
            <Button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
        </div>
    );

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isLowTime = timeLeft < 60; // Red color if less than 1 minute

    // Circular progress calculation for timer
    const timePercentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex flex-col items-center pb-32 md:pb-20 font-sans transition-colors duration-300">
            {/* Dark Premium Floating Timer (Bottom Right on Desktop, Bottom Center on Mobile) */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-40 transition-all duration-500 transform hover:scale-105 ${isLowTime ? 'animate-pulse' : ''
                }`}>
                <div className={`backdrop-blur-xl bg-white/90 dark:bg-black/90 border border-gray-200 dark:border-gray-700/50 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-4 ${isLowTime ? 'ring-2 ring-red-500/50 shadow-red-900/20' : 'ring-1 ring-gray-200 dark:ring-white/10'
                    }`}>
                    {/* Circular Timer Progress */}
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background Circle */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 16}
                                strokeDashoffset={0}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ease-linear ${isLowTime ? "text-red-500" : "text-blue-600 dark:text-emerald-400"
                                    }`}
                                style={{
                                    strokeDasharray: '100',
                                    strokeDashoffset: 100 - timePercentage
                                }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Clock size={14} className={` ${isLowTime ? "text-red-500" : "text-blue-600 dark:text-emerald-400"}`} />
                        </div>
                    </div>

                    {/* Time Display */}
                    <div className="flex flex-col items-start min-w-[70px]">
                        <span className={`text-xl font-bold font-mono tracking-wider ${isLowTime ? "text-red-500 dark:text-red-400" : "text-gray-900 dark:text-white"
                            }`}>
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 dark:text-gray-400">
                            Restant
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl space-y-6 md:space-y-8 mt-8 md:mt-12 z-10">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-2 gap-4 md:gap-0">
                    <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Question</span>
                        <span className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
                            {currentIndex + 1}<span className="text-xl md:text-2xl text-gray-400 dark:text-gray-600 font-medium">/{questions.length}</span>
                        </span>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-white/60 dark:border-gray-700 shadow-sm self-start md:self-auto">
                        <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                            {categoryParam || (questions[currentIndex]?.category?.name || 'Général')}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
                    <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full"
                    >
                        <Card className="min-h-[400px] md:min-h-[450px] flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden relative transition-colors duration-300">
                            {/* Decorative background blob */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                            <div className="p-6 md:p-10 flex flex-col flex-1 relative z-10">
                                <h2 className="text-xl md:text-3xl font-heading font-bold mb-8 md:mb-10 text-gray-800 dark:text-gray-100 leading-tight">
                                    {currentQuestion.text}
                                    <button
                                        onClick={() => handleSpeak(currentQuestion)}
                                        className="ml-3 inline-flex items-center justify-center p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                        title="Écouter la question"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </h2>

                                <div className="grid grid-cols-1 gap-3 md:gap-4 flex-1 content-start">
                                    {currentQuestion.choices.map((choice) => {
                                        const isSelected = (answers[currentQuestion.id] || []).includes(choice.id);
                                        return (
                                            <motion.div
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                key={choice.id}
                                                onClick={() => handleToggleChoice(currentQuestion.id, choice.id)}
                                                className={`group relative p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 md:gap-5 ${isSelected
                                                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/30 shadow-lg shadow-primary-100 dark:shadow-primary-900/20'
                                                    : 'border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-primary-200 dark:hover:border-primary-700 hover:bg-white dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${isSelected
                                                    ? 'bg-primary-600 border-primary-600 shadow-md transform scale-110'
                                                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 group-hover:border-primary-300 dark:group-hover:border-primary-500'
                                                    }`}>
                                                    {isSelected && (
                                                        <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className={`text-base md:text-lg font-medium transition-colors duration-300 ${isSelected ? 'text-primary-900 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                                                    }`}>
                                                    {choice.text}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 md:mt-10 flex flex-col-reverse md:flex-row justify-between items-center gap-4 md:gap-0 pt-6 border-t border-gray-100/50 dark:border-gray-700/50">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentIndex === 0}
                                        className={`w-full md:w-auto text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 px-6 py-3 rounded-xl transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none hidden md:block' : 'opacity-100'
                                            }`}
                                    >
                                        ← Précédent
                                    </Button>

                                    {currentIndex === questions.length - 1 ? (
                                        <Button
                                            variant="primary"
                                            onClick={handleFinishClick}
                                            disabled={submitting}
                                            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 px-8 py-3 rounded-xl font-bold text-lg transform hover:-translate-y-0.5 transition-all justify-center"
                                        >
                                            {submitting ? 'Envoi...' : 'Terminer le quiz'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                            className="w-full md:w-auto bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                        >
                                            Suivant →
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>

            <Modal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                title="Terminer le quiz ?"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle size={24} />
                    </div>

                    <p className="text-gray-600 dark:text-gray-300">
                        Vous avez répondu à <strong>{Object.keys(answers).length}</strong> question(s) sur <strong>{questions.length}</strong>.
                        <br />
                        Voulez-vous vraiment soumettre vos réponses ?
                    </p>

                    <div className="flex gap-3 w-full mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmModalOpen(false)}
                            className="flex-1 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => handleSubmit(false)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            Confirmer
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
