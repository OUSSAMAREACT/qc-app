import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, Target, Calendar, Trophy } from 'lucide-react';
import { Card } from './ui/Card';

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

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>;
    if (!stats) return null;

    const { streak, weeklyProgress } = stats;
    const { questionsAnswered, daysStudied, goalQuestions, goalDays } = weeklyProgress;

    const questionsProgress = Math.min(100, Math.round((questionsAnswered / goalQuestions) * 100));
    const daysProgress = Math.min(100, Math.round((daysStudied / goalDays) * 100));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Daily Streak Card */}
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${streak > 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                        <Flame size={28} className={streak > 0 ? "animate-pulse" : ""} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Série en cours</h3>
                        <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
                            {streak} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">jours</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {streak > 0 ? "Continuez comme ça !" : "Commencez une série aujourd'hui !"}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Weekly Goals Card */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Target size={18} className="text-blue-500" /> Objectifs de la semaine
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        Semaine {weeklyProgress.weekNumber}
                    </span>
                </div>

                <div className="space-y-4">
                    {/* Questions Goal */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-300">Questions répondues</span>
                            <span className="font-medium text-gray-900 dark:text-white">{questionsAnswered} / {goalQuestions}</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${questionsProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Days Goal */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-300">Jours d'étude</span>
                            <span className="font-medium text-gray-900 dark:text-white">{daysStudied} / {goalDays}</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${daysProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
