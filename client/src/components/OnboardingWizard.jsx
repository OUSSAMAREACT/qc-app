import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, ArrowRight, BookOpen, Target } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function OnboardingWizard() {
    const { user, login } = useAuth(); // We might need to refresh user state
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        examDate: '',
        studyMinutesPerDay: 30
    });
    const [plan, setPlan] = useState(null);

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/onboarding/complete', formData);
            setPlan(res.data.goals);
            setStep(3); // Move to Plan Reveal

            // Ideally we should update the local user context here to set onboardingCompleted: true
            // For now, we rely on the fact that the backend is updated.
            // A page refresh or context reload would be needed to persist the state in the app if we check it globally.
            // We can force a reload or update the user object if AuthContext exposes a setter (it doesn't currently, but we can trigger a fetch).
            window.location.reload(); // Simple way to refresh auth state and redirect
        } catch (error) {
            console.error("Onboarding failed", error);
            alert("Une erreur est survenue.");
            setLoading(false);
        }
    };

    const variants = {
        enter: { x: 100, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative min-h-[500px] flex flex-col">
                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 dark:bg-gray-700 w-full">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="p-8 flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.4 }}
                                className="flex-1 flex flex-col items-center text-center justify-center"
                            >
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                    <Target size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Bienvenue, {user?.name} !</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-8">
                                    Configurons votre plan d'étude personnalisé pour maximiser vos chances de réussite.
                                </p>
                                <button
                                    onClick={handleNext}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    Commencer <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.4 }}
                                className="flex-1 flex flex-col"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Calendar className="text-blue-500" /> Quand passez-vous l'examen ?
                                </h2>

                                <div className="flex-1 flex flex-col justify-center space-y-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date estimée</label>
                                    <input
                                        type="date"
                                        className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-blue-500 outline-none transition-colors text-lg"
                                        value={formData.examDate}
                                        onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500">Cela nous aidera à structurer votre progression.</p>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-full py-3 bg-gray-900 dark:bg-gray-700 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors mt-auto"
                                >
                                    Suivant
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.4 }}
                                className="flex-1 flex flex-col"
                            >
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Clock className="text-purple-500" /> Temps d'étude par jour
                                </h2>

                                <div className="flex-1 flex flex-col justify-center space-y-8">
                                    <div className="text-center">
                                        <span className="text-4xl font-bold text-blue-600">{formData.studyMinutesPerDay}</span>
                                        <span className="text-gray-500 ml-2">minutes</span>
                                    </div>

                                    <input
                                        type="range"
                                        min="15"
                                        max="120"
                                        step="15"
                                        value={formData.studyMinutesPerDay}
                                        onChange={(e) => setFormData({ ...formData, studyMinutesPerDay: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />

                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>15 min</span>
                                        <span>1h</span>
                                        <span>2h</span>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                                            💡 Avec {formData.studyMinutesPerDay} min/jour, vous pourrez traiter environ {Math.round(formData.studyMinutesPerDay / 1.5)} questions.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors mt-auto flex items-center justify-center gap-2"
                                >
                                    {loading ? "Création du plan..." : "Générer mon plan"}
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && plan && (
                            <motion.div
                                key="step3"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.4 }}
                                className="flex-1 flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tout est prêt !</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-8">
                                    Voici votre objectif hebdomadaire :
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="text-2xl font-bold text-blue-600">{plan.weeklyQuestionGoal}</div>
                                        <div className="text-xs text-gray-500">Questions / semaine</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="text-2xl font-bold text-green-600">{plan.weeklyDayGoal}</div>
                                        <div className="text-xs text-gray-500">Jours / semaine</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors mt-auto"
                                >
                                    Accéder au Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
