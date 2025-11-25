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

    const [categories, setCategories] = useState([]);
    const [activeExam, setActiveExam] = useState(null);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bonjour');
        else if (hour < 18) setGreeting('Bon après-midi');
        else setGreeting('Bonsoir');

        fetchStats();
        fetchCategories();
        fetchActiveExam();
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

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const fetchActiveExam = async () => {
        try {
            const res = await axios.get('/weekly-exams/active');
            setActiveExam(res.data);
        } catch (error) {
            console.log("No active exam or error fetching", error);
        }
    };

    // Helper to assign gradients based on index
    const getCategoryGradient = (index) => {
        const gradients = [
            'from-emerald-500 to-teal-600',
            'from-blue-500 to-indigo-600',
            'from-purple-500 to-pink-600',
            'from-orange-500 to-red-600',
            'from-cyan-500 to-blue-600',
            'from-rose-500 to-orange-600'
        ];
        return gradients[index % gradients.length];
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
                        {activeExam ? (
                            <WeeklyExamCard exam={activeExam} />
                        ) : (
                            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                                <p className="text-gray-500 dark:text-gray-400">Aucun examen hebdomadaire actif pour le moment.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Common Modules */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="text-primary-600 dark:text-primary-400" size={24} /> Tronc Commun
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-card px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                {categories.filter(c => !c.specialty).length} disponibles
                            </span>
                        </div>

                        {categories.filter(c => !c.specialty).length === 0 ? (
                            <div className="text-center py-8 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">Aucun module commun disponible.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-5">
                                {categories.filter(c => !c.specialty).map((cat, index) => (
                                    <div key={cat.id} className="group relative bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                                        <div className={`h-2 w-full bg-gradient-to-r ${getCategoryGradient(index)}`} />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {cat.name}
                                                </h3>
                                                <span className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                                                    {cat._count?.questions || 0} Q
                                                </span>
                                            </div>

                                            <div className="mt-auto pt-4">
                                                <Link to={`/quiz?category=${encodeURIComponent(cat.name)}`}>
                                                    <button className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-primary-600 dark:hover:bg-primary-500 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-500/20 cursor-pointer">
                                                        <Play size={16} fill="currentColor" /> Commencer
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
