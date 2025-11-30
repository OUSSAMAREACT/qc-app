import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, Target, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GamificationWidget() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/gamification/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch gamification stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl"></div>;
    if (!stats) return null;

    const { streak, weeklyProgress } = stats;
    const { questionsAnswered, daysStudied, goalQuestions, goalDays } = weeklyProgress;

    const questionsProgress = Math.min(100, Math.round((questionsAnswered / goalQuestions) * 100));
    const daysProgress = Math.min(100, Math.round((daysStudied / goalDays) * 100));

    return (
        <div className="space-y-6">
            {/* Streak Card - Premium Glassmorphism */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-xl shadow-orange-500/20"
            >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1 opacity-90">
                            <Flame size={20} className={streak > 0 ? "animate-pulse text-yellow-300" : ""} />
                            <span className="font-medium tracking-wide text-sm uppercase">Série en cours</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold font-heading">{streak}</span>
                            <span className="text-xl font-medium opacity-80">Jours</span>
                        </div>
                        <p className="mt-2 text-sm opacity-90 font-medium">
                            {streak > 0
                                ? "Le feu est allumé ! 🔥"
                                : "Allumez la flamme aujourd'hui !"}
                        </p>
                    </div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                        <Trophy size={40} className="text-yellow-300 drop-shadow-md" />
                    </div>
                </div>
            </motion.div>

            {/* Goals Card - Clean & Minimal */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <Target size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Objectifs Hebdo</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Restez constant pour progresser</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Questions Goal */}
                    <div className="group">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
                                <TrendingUp size={14} className="text-blue-500" /> Questions
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">{questionsAnswered} <span className="text-gray-400 font-normal">/ {goalQuestions}</span></span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${questionsProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                        </div>
                    </div>

                    {/* Days Goal */}
                    <div className="group">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
                                <Calendar size={14} className="text-green-500" /> Jours d'étude
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">{daysStudied} <span className="text-gray-400 font-normal">/ {goalDays}</span></span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${daysProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
