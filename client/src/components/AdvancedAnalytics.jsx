import React, { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Activity, Award, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdvancedAnalytics = () => {
    const [data, setData] = useState({ radarData: [], progressData: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/stats/advanced', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="h-64 flex items-center justify-center text-gray-400">Chargement des analyses...</div>;

    if (data.radarData.length === 0 && data.progressData.length === 0) {
        return (
            <div className="text-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Pas assez de données pour générer des analyses. Complétez quelques quiz !</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Radar Chart - Strengths & Weaknesses */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Points Forts & Faibles</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Performance par catégorie</p>
                    </div>
                </div>

                <div className="h-[300px] min-h-[300px] w-full relative z-10 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-4">
                        {data.radarData.map((item, index) => {
                            const score = item.A;
                            let level = 'Débutant';
                            let color = 'bg-blue-500';
                            let textColor = 'text-blue-600 dark:text-blue-400';
                            let bgColor = 'bg-blue-100 dark:bg-blue-900/30';

                            if (score >= 80) {
                                level = 'Expert';
                                color = 'bg-purple-500';
                                textColor = 'text-purple-600 dark:text-purple-400';
                                bgColor = 'bg-purple-100 dark:bg-purple-900/30';
                            } else if (score >= 50) {
                                level = 'Intermédiaire';
                                color = 'bg-indigo-500';
                                textColor = 'text-indigo-600 dark:text-indigo-400';
                                bgColor = 'bg-indigo-100 dark:bg-indigo-900/30';
                            }

                            return (
                                <motion.div
                                    key={item.subject}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group"
                                >
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{item.subject}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgColor} ${textColor}`}>
                                                {level}
                                            </span>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{score}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (index * 0.1) }}
                                            className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.2)] relative`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Line Chart - Progress Over Time */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Progression Hebdomadaire</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Moyenne de vos scores par semaine</p>
                    </div>
                </div>
                <Link to="/history" className="absolute top-6 right-6 text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1 transition-colors z-20">
                    Historique <ArrowRight size={14} />
                </Link>

                <div className="h-[250px] min-h-[250px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%" debounce={200}>
                        <AreaChart data={data.progressData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                formatter={(value) => [`${value}%`, 'Score Moyen']}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default AdvancedAnalytics;
