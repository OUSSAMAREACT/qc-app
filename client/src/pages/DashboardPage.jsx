import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Play, Trophy, Clock, Target, ArrowRight,
    Flame, Star, BookOpen, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import GamificationWidget from '../components/GamificationWidget';
import WeeklyExamCard from '../components/WeeklyExamCard';
import axios from 'axios';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        averageScore: 0,
        totalQuestions: 0
    });
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bonjour');
        else if (hour < 18) setGreeting('Bon après-midi');
        else setGreeting('Bonsoir');

        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/quiz/history');
            const history = res.data;
            const totalQuizzes = history.length;
            const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
            const totalQuestions = history.reduce((acc, curr) => acc + curr.totalQuestions, 0);
            const averageScore = totalQuizzes > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

            setStats({ totalQuizzes, averageScore, totalQuestions });
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 md:p-12 shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                        {greeting}, {user?.name?.split(' ')[0]} !
                    </h1>
                    <p className="text-primary-100 text-lg md:text-xl max-w-2xl mb-8">
                        Prêt à relever de nouveaux défis aujourd'hui ? Continuez sur votre lancée et atteignez vos objectifs.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/quiz">
                            <button className="bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <Play size={20} fill="currentColor" /> Quiz Rapide
                            </button>
                        </Link>
                        <Link to="/profile">
                            <button className="bg-primary-700/50 hover:bg-primary-700/70 text-white border border-primary-500/50 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all backdrop-blur-sm">
                                <Target size={20} /> Voir mes objectifs
                            </button>
                        </Link>
                    </div>
                </div>
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary-400/20 rounded-full blur-2xl"></div>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Gamification */}
                <div className="space-y-8 lg:col-span-2">
                    {/* Stats Cards */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:border-primary-200 dark:hover:border-primary-800 transition-colors group">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Flame size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user?.currentStreak || 0}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Jours de suite</div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:border-primary-200 dark:hover:border-primary-800 transition-colors group">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Target size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.averageScore}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Score Moyen</div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:border-primary-200 dark:hover:border-primary-800 transition-colors group">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalQuizzes}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Quiz Terminés</div>
                        </div>
                    </motion.div>

                    {/* Weekly Exam Card */}
                    <motion.div variants={itemVariants}>
                        <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-500" size={24} /> Challenge Hebdomadaire
                        </h2>
                        <WeeklyExamCard />
                    </motion.div>
                </div>

                {/* Right Column: Gamification Widget & Quick Actions */}
                <div className="space-y-8">
                    <motion.div variants={itemVariants}>
                        <GamificationWidget />
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Accès Rapide</h3>
                        <div className="space-y-3">
                            <Link to="/history" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                        <Clock size={18} />
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Historique</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                            </Link>
                            <Link to="/profile" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                                        <Star size={18} />
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Mes Badges</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
