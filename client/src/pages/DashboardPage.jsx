import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Flame, Star, BookOpen, ChevronRight, Lock, Crown,
    Play, Trophy, Clock, Target, ArrowRight, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import GamificationWidget from '../components/GamificationWidget';
import WeeklyExamCard from '../components/WeeklyExamCard';
import axios from 'axios';
import SEO from '../components/SEO';
import AdvancedAnalytics from '../components/AdvancedAnalytics';

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

    const INITIAL_DISPLAY_COUNT = 4;

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bonjour');
        else if (hour < 18) setGreeting('Bon après-midi');
        else setGreeting('Bonsoir');

        fetchStats();
        fetchCategories();
        fetchActiveExam();
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
            if (res.data) {
                setActiveExam(res.data);
            } else {
                setActiveExam(null);
            }
        } catch (error) {
            console.log("Error fetching active exam", error);
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

    const specialtyCategories = categories.filter(c => c.specialtyId && c.specialtyId === user?.specialty?.id);
    const commonCategories = categories.filter(c => !c.specialtyId);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-12"
        >
            <SEO
                title="Tableau de bord"
                description="Suivez votre progression, accédez à vos modules et examens, et consultez vos statistiques sur QCMEchelle11."
                url="/dashboard"
            />

            {/* Hero Section - Premium Glassmorphism */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-8 md:p-12 shadow-2xl shadow-gray-900/20"
            >
                {/* Animated Mesh Gradient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-gray-900 opacity-80" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-2 tracking-tight">
                            <span className="font-light opacity-80">{greeting},</span> <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                                {user?.name?.split(' ')[0]}
                            </span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl max-w-xl font-light leading-relaxed mt-4">
                            "Le succès est la somme de petits efforts, répétés jour après jour."
                        </p>

                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link to="/quiz?mode=rapide">
                                <button className="group bg-white text-gray-900 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 active:scale-95">
                                    <div className="bg-gray-900 text-white p-1.5 rounded-full group-hover:scale-110 transition-transform">
                                        <Play size={14} fill="currentColor" />
                                    </div>
                                    Quiz Rapide
                                </button>
                            </Link>
                            <Link to="/profile">
                                <button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all backdrop-blur-md">
                                    <Target size={20} /> Mes Objectifs
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Premium Badge */}
                    {user?.role === 'PREMIUM' && (
                        <motion.div
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="hidden md:flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-[0_0_40px_rgba(234,179,8,0.4)] border-4 border-white/20 backdrop-blur-sm"
                        >
                            <Crown size={40} className="text-white drop-shadow-md" fill="currentColor" />
                            <span className="text-white font-bold text-xs mt-1 uppercase tracking-wider">Premium</span>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Stats Row */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 w-fit rounded-xl text-blue-600 dark:text-blue-400">
                                <Target size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Score Moyen</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 w-fit rounded-xl text-purple-600 dark:text-purple-400">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuizzes}</div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Quiz Terminés</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 w-fit rounded-xl text-green-600 dark:text-green-400">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions}</div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Questions Répondues</div>
                            </div>
                        </div>

                        {/* Boîte à Erreurs Card */}
                        <Link to="/quiz?mode=mistakes">
                            <div className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 flex flex-col justify-between h-32 hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 w-fit rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                    <RefreshCw size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">Boîte à Erreurs</div>
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Réviser mes fautes</div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Weekly Exam Section */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Challenge Hebdomadaire</h2>
                        </div>
                        {activeExam ? (
                            <WeeklyExamCard exam={activeExam} />
                        ) : (
                            <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                                <p className="text-gray-500 dark:text-gray-400">Aucun examen hebdomadaire actif pour le moment.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Common Modules Grid */}
                    <motion.div variants={itemVariants} id="common-modules">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Modules Communs</h2>
                            </div>
                            <Link to="/modules/common" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                Voir tout <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {commonCategories.slice(0, INITIAL_DISPLAY_COUNT).map((cat, index) => (
                                <Link
                                    to={user?.role === 'STUDENT' && !cat.isFree ? '/payment' : `/quiz?category=${encodeURIComponent(cat.name)}`}
                                    key={cat.id}
                                >
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group relative h-full bg-white dark:bg-dark-card rounded-[2rem] p-1 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
                                    >
                                        <div className="relative h-full bg-gray-50 dark:bg-gray-800/50 rounded-[1.8rem] overflow-hidden p-6 flex flex-col">
                                            {/* Background Gradient Blob */}
                                            <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${getCategoryGradient(index)} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`}></div>

                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCategoryGradient(index)} flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                                    <BookOpen size={24} />
                                                </div>
                                                {cat.isFree ? (
                                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1.5 rounded-full">
                                                        Gratuit
                                                    </span>
                                                ) : (
                                                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                                        <Crown size={12} /> Premium
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {cat.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
                                                {cat._count?.questions || 0} Questions disponibles
                                            </p>

                                            <div className="mt-auto flex items-center text-sm font-bold text-gray-900 dark:text-white group-hover:translate-x-2 transition-transform duration-300">
                                                {user?.role === 'STUDENT' && !cat.isFree ? (
                                                    <span className="flex items-center gap-2 text-gray-500"><Lock size={16} /> Débloquer</span>
                                                ) : (
                                                    <span className="flex items-center gap-2">Commencer <ArrowRight size={16} /></span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Advanced Analytics Section */}
                    <motion.div variants={itemVariants}>
                        <AdvancedAnalytics />
                    </motion.div>



                    {/* Specialty Modules Grid */}
                    {user?.specialty && (
                        <motion.div variants={itemVariants}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                                    <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Spécialité : {user.specialty.name}</h2>
                                </div>
                                <Link to="/modules/specialty" className="text-sm font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1">
                                    Voir tout <ChevronRight size={16} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {specialtyCategories.slice(0, INITIAL_DISPLAY_COUNT).map((cat, index) => (
                                    <Link
                                        to={user?.role === 'STUDENT' && !cat.isFree ? '/payment' : `/quiz?category=${encodeURIComponent(cat.name)}`}
                                        key={cat.id}
                                    >
                                        <motion.div
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group relative h-full bg-white dark:bg-dark-card rounded-[2rem] p-1 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
                                        >
                                            <div className="relative h-full bg-gray-50 dark:bg-gray-800/50 rounded-[1.8rem] overflow-hidden p-6 flex flex-col">
                                                {/* Background Gradient Blob */}
                                                <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`}></div>

                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                                        <Star size={24} />
                                                    </div>
                                                    {cat.isFree ? (
                                                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1.5 rounded-full">
                                                            Gratuit
                                                        </span>
                                                    ) : (
                                                        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                                            <Crown size={12} /> Premium
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    {cat.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
                                                    {cat._count?.questions || 0} Questions disponibles
                                                </p>

                                                <div className="mt-auto flex items-center text-sm font-bold text-gray-900 dark:text-white group-hover:translate-x-2 transition-transform duration-300">
                                                    {user?.role === 'STUDENT' && !cat.isFree ? (
                                                        <span className="flex items-center gap-2 text-gray-500"><Lock size={16} /> Débloquer</span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">Commencer <ArrowRight size={16} /></span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column (Sidebar) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-24 space-y-8">
                        {/* Gamification Widget */}
                        <motion.div variants={itemVariants}>
                            <GamificationWidget />
                        </motion.div>

                        {/* Premium Upgrade Banner (Sidebar) */}
                        {user?.role === 'STUDENT' && (
                            <motion.div
                                variants={itemVariants}
                                className="relative overflow-hidden rounded-3xl bg-gray-900 text-white p-6 shadow-xl"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/30">
                                        <Crown size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Passez au niveau supérieur</h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        Débloquez l'accès illimité à tous les modules, examens et fonctionnalités exclusives.
                                    </p>
                                    <Link to="/payment">
                                        <button className="w-full bg-white text-gray-900 hover:bg-gray-100 py-3 rounded-xl font-bold transition-colors shadow-lg">
                                            Devenir Premium
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div >
    );
}
