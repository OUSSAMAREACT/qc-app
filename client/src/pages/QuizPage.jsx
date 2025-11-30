import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';

import { AlertTriangle, Clock, Volume2, Crown, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';

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
    const audioRef = useRef(null);
    const [audioCache, setAudioCache] = useState({});
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [playingQuestionId, setPlayingQuestionId] = useState(null);
    const activeQuestionIdRef = useRef(null); // Track active question for race conditions

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const { user } = useAuth();

    // --- Freemium Notice Logic ---
    const [showFreemiumNotice, setShowFreemiumNotice] = useState(false);

    useEffect(() => {
        const mode = searchParams.get('mode');
        console.log('QuizPage useEffect:', { mode, userRole: user?.role });

        if (mode === 'rapide' && user?.role === 'STUDENT') {
            setShowFreemiumNotice(true);
        }

        // --- Mistake Onboarding ---
        if (mode === 'mistakes') {
            const hasSeen = localStorage.getItem('hasSeenMistakeOnboarding_v2');
            console.log('Checking mistake onboarding:', { hasSeen });

            if (!hasSeen) {
                console.log('Scheduling onboarding modal...');
                setTimeout(() => {
                    console.log('Showing onboarding modal now');
                    setShowMistakeOnboarding(true);
                }, 500);
            }
        }
    }, [user, searchParams]);

    const [showMistakeOnboarding, setShowMistakeOnboarding] = useState(false);
    const handleCloseOnboarding = () => {
        setShowMistakeOnboarding(false);
        localStorage.setItem('hasSeenMistakeOnboarding_v2', 'true');
    };

    useEffect(() => {
        fetchQuiz();
        return () => {
            clearInterval(timerRef.current);
            window.speechSynthesis.cancel(); // Stop speech on unmount
        };
    }, [categoryParam]);

    // Stop speech when moving to next/prev question
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setPlayingQuestionId(null);
        activeQuestionIdRef.current = null; // Cancel any pending audio
        window.speechSynthesis.cancel();

        // Prefetch next 2 questions
        const nextQuestions = questions.slice(currentIndex + 1, currentIndex + 3);
        nextQuestions.forEach(q => {
            if (!audioCache[q.id]) {
                prefetchAudio(q);
            }
        });
    }, [currentIndex, questions]);

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
            const searchParams = new URLSearchParams(location.search);
            const mode = searchParams.get('mode');

            let url = '/quiz/start?limit=1000';

            if (mode === 'rapide') {
                url = '/quiz/start?mode=rapide';
            } else if (mode === 'mistakes') {
                url = '/quiz/start?mode=mistakes&limit=50';
            } else if (categoryParam) {
                url = `/quiz/start?limit=1000&category=${encodeURIComponent(categoryParam)}`;
            }

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

    const speakWithBrowser = (text) => {
        if (!('speechSynthesis' in window)) {
            alert("Votre navigateur ne supporte pas la lecture audio.");
            return;
        }

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR'; // Force French
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to find a French voice
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        utterance.onstart = () => {
            setIsAudioLoading(false);
        };

        utterance.onend = () => {
            setPlayingQuestionId(null);
            activeQuestionIdRef.current = null;
        };

        utterance.onerror = (e) => {
            console.error("Browser TTS Error:", e);
            setPlayingQuestionId(null);
            activeQuestionIdRef.current = null;
        };

        window.speechSynthesis.speak(utterance);
    };

    const prefetchAudio = async (question) => {
        if (!question || !question.id || audioCache[question.id]) return;

        try {
            // If audio file is already known from DB
            if (question.audioFile) {
                const url = `/uploads/audio/${question.audioFile}`;
                // Preload via Audio object
                const audio = new Audio();
                audio.src = url;
                audio.preload = 'auto';
                setAudioCache(prev => ({ ...prev, [question.id]: url }));
                console.log(`Prefetching static audio for Q${question.id}`);
                return;
            }

            console.log(`Prefetching audio for Q${question.id}...`);
            let textToRead = `Question. ${question.text}.\n`;
            question.choices.forEach((choice, index) => {
                textToRead += `Réponse ${index + 1}. ${choice.text}.\n`;
            });

            const res = await axios.post('/tts/speak', { text: textToRead, questionId: question.id }, { responseType: 'blob' });
            if (res.data.type !== 'application/json') {
                const audioUrl = URL.createObjectURL(res.data);
                setAudioCache(prev => ({ ...prev, [question.id]: audioUrl }));
                console.log(`Prefetch complete for Q${question.id}`);
            }
        } catch (error) {
            console.warn("Prefetch failed (likely rate limit), ignoring:", error);
        }
    };

    const handleSpeak = async (question) => {
        // Stop current audio if playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        if (playingQuestionId === question.id) {
            setPlayingQuestionId(null);
            return; // Toggle off
        }

        setIsAudioLoading(true);
        setPlayingQuestionId(question.id);
        activeQuestionIdRef.current = question.id; // Mark this as the active audio target

        if (!question.id) {
            console.error("Question ID missing:", question);
            alert("Erreur: ID de question manquant.");
            setIsAudioLoading(false);
            setPlayingQuestionId(null);
            return;
        }

        try {
            // Check cache
            if (audioCache[question.id]) {
                const audio = new Audio(audioCache[question.id]);
                audioRef.current = audio;
                audio.play();
                audio.onended = () => setPlayingQuestionId(null);
                setIsAudioLoading(false);
                return;
            }

            // Prepare text
            let textToRead = `Question. ${question.text}.\n`;
            question.choices.forEach((choice, index) => {
                textToRead += `Réponse ${index + 1}. ${choice.text}.\n`;
            });

            // Define the generation function
            const generateAndPlay = async () => {
                const res = await axios.post('/tts/speak', { text: textToRead, questionId: question.id }, { responseType: 'blob' });

                // Check if the response is actually audio
                if (res.data.type === 'application/json') {
                    console.warn("TTS Backend Error (JSON response), switching to fallback.");
                    throw new Error("Backend returned JSON instead of audio");
                }

                // Check if we are still on the same question before playing
                if (activeQuestionIdRef.current !== question.id) {
                    console.log("Audio load finished but user moved away. Aborting play.");
                    setIsAudioLoading(false);
                    return;
                }

                const audioUrl = URL.createObjectURL(res.data);
                setAudioCache(prev => ({ ...prev, [question.id]: audioUrl }));

                const audio = new Audio(audioUrl);
                audioRef.current = audio;

                audio.oncanplaythrough = () => {
                    if (activeQuestionIdRef.current !== question.id) return;
                    audio.play().catch(e => {
                        console.error("Audio play failed:", e);
                        // Fallback if play fails
                        speakWithBrowser(textToRead);
                    });
                };

                audio.onerror = (e) => {
                    console.error("Audio load error:", e);
                    speakWithBrowser(textToRead);
                };

                audio.onended = () => {
                    if (activeQuestionIdRef.current === question.id) {
                        setPlayingQuestionId(null);
                    }
                };
            };

            // Try Premium TTS first
            try {
                // Check if we have a static file from DB (even if not in cache yet)
                if (question.audioFile) {
                    const url = `/uploads/audio/${question.audioFile}`;
                    // Use this URL directly
                    const audio = new Audio(url);
                    audioRef.current = audio;

                    audio.oncanplaythrough = () => {
                        if (activeQuestionIdRef.current !== question.id) return;
                        audio.play().catch(e => console.error("Play failed", e));
                    };
                    audio.onended = () => setPlayingQuestionId(null);
                    audio.onerror = (e) => {
                        console.error("Static audio error, falling back to generation", e);
                        // If static file fails (deleted?), try generating
                        generateAndPlay();
                    };

                    // If it works, we are done
                    return;
                }

                await generateAndPlay();

            } catch (backendError) {
                console.warn("Premium TTS failed, using browser fallback:", backendError);
                speakWithBrowser(textToRead);
            }

        } catch (error) {
            console.error("TTS Critical Error:", error);
            setPlayingQuestionId(null);
        } finally {
            // Note: setIsAudioLoading(false) is handled in speakWithBrowser or audio callbacks
            // We set it to false here only if we didn't start a fallback or audio
            if (!activeQuestionIdRef.current) {
                setIsAudioLoading(false);
            }
        }
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
            <p className="text-gray-500">
                {searchParams.get('mode') === 'mistakes'
                    ? "Votre boîte à erreurs est vide ! Bravo !"
                    : "Aucune question disponible pour cette catégorie."}
            </p>
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
            <SEO
                title="Quiz en cours"
                description="Testez vos connaissances avec nos QCM interactifs pour l'examen Echelle 11."
                url="/quiz"
            />

            {/* Mistake Onboarding Modal */}
            <AnimatePresence>
                {showMistakeOnboarding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-700 relative"
                        >
                            <div className="relative h-32 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                                <RefreshCw size={48} className="text-white relative z-10 drop-shadow-lg" />
                            </div>

                            <div className="p-8 text-center">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mode Révision</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    Bienvenue dans votre Boîte à Erreurs !
                                    <br /><br />
                                    Ici, vous retrouvez toutes les questions où vous avez échoué. Répondez juste pour les faire disparaître !
                                </p>

                                <Button onClick={handleCloseOnboarding} className="w-full py-3 text-lg">
                                    C'est parti !
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Freemium Notice Modal */}
            <AnimatePresence>
                {showFreemiumNotice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-700"
                        >
                            <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                                <Crown size={48} className="text-white relative z-10 drop-shadow-lg" />
                            </div>

                            <div className="p-8 text-center">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mode Découverte</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    Vous utilisez le <strong>Quiz Rapide</strong> en version gratuite.
                                    <br /><br />
                                    <ul className="text-left space-y-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm">
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span> Accès aux modules gratuits uniquement
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span> 30 questions par session
                                        </li>
                                        <li className="flex items-center gap-2 opacity-50">
                                            <span className="text-gray-400">🔒</span> Accès illimité à tous les modules (Premium)
                                        </li>
                                    </ul>
                                </p>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => navigate('/payment')}
                                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-yellow-500/30 transform transition hover:scale-[1.02]"
                                    >
                                        Passer Premium 🚀
                                    </Button>
                                    <button
                                        onClick={() => setShowFreemiumNotice(false)}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium py-2"
                                    >
                                        Continuer en mode gratuit
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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


            <div className="w-full max-w-4xl space-y-4 md:space-y-8 mt-4 md:mt-12 z-10">
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
                        <Card className="min-h-[400px] md:min-h-[450px] flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden relative transition-colors duration-300 px-4 py-6 md:p-6">
                            {/* Decorative background blob */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                            <div className="py-4 px-0 md:p-10 flex flex-col flex-1 relative z-10">
                                <h2 className="text-lg md:text-3xl font-heading font-bold mb-4 md:mb-10 text-gray-800 dark:text-gray-100 leading-tight">
                                    {currentQuestion.text}
                                    <button
                                        onClick={() => handleSpeak(currentQuestion)}
                                        className={`ml-3 inline-flex items-center justify-center p-2 rounded-full transition-colors ${playingQuestionId === currentQuestion.id
                                            ? 'bg-blue-500 text-white animate-pulse'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                            }`}
                                        title="Écouter la question (IA)"
                                        disabled={isAudioLoading && playingQuestionId !== currentQuestion.id}
                                    >
                                        {isAudioLoading && playingQuestionId === currentQuestion.id ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs">Chargement...</span>
                                            </div>
                                        ) : (
                                            <Volume2 size={20} />
                                        )}
                                    </button>

                                </h2>

                                <div className="grid grid-cols-1 gap-2 md:gap-4 flex-1 content-start">
                                    {currentQuestion.choices.map((choice) => {
                                        const isSelected = (answers[currentQuestion.id] || []).includes(choice.id);
                                        return (
                                            <motion.div
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                key={choice.id}
                                                onClick={() => handleToggleChoice(currentQuestion.id, choice.id)}
                                                className={`group relative p-2.5 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-2.5 md:gap-5 ${isSelected
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
                                                <span className={`text-sm leading-snug md:text-lg md:leading-normal font-medium transition-colors duration-300 ${isSelected ? 'text-primary-900 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                                                    }`}>
                                                    {choice.text}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 md:mt-10 flex flex-col-reverse md:flex-row justify-between items-center gap-3 md:gap-0 pt-4 md:pt-6 border-t border-gray-100/50 dark:border-gray-700/50">
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
