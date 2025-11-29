import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Flame, Star, BookOpen, ChevronRight, Lock, Crown,
    Play, Trophy, Clock, Target, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import GamificationWidget from '../components/GamificationWidget';
import WeeklyExamCard from '../components/WeeklyExamCard';
import axios from 'axios';
import SEO from '../components/SEO';

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
            className="space-y-8"
        >
            <SEO
                title="Tableau de bord"
                description="Suivez votre progression, accédez à vos modules et examens, et consultez vos statistiques sur QCMEchelle11."
                url="/dashboard"
            />
            {/* Hero Section */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white p-6 md:p-12 shadow-2xl shadow-primary-900/20"
            >
                {/* Abstract Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

                <div className="relative z-10">
                    <h1 className="text-2xl md:text-5xl font-heading font-bold mb-4 tracking-tight flex items-center gap-3">
                        {greeting}, <span className="text-primary-100">{user?.name?.split(' ')[0]}</span> !
                        {user?.role === 'PREMIUM' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-lg"
                                title="Membre Premium"
                            >
                                <Crown size={24} fill="currentColor" />
                            </motion.div>
                        )}
                    </h1>
                    <p className="text-primary-100/90 text-lg md:text-xl max-w-2xl mb-8 font-medium leading-relaxed">
                        Prêt à relever de nouveaux défis aujourd'hui ? Continuez sur votre lancée et atteignez vos objectifs.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/quiz">
                            <button className="bg-white text-primary-700 hover:bg-primary-50 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95">
                                <Play size={20} fill="currentColor" /> Quiz Rapide
                            </button>
                        </Link>
                        <Link to="/profile">
                            <button className="bg-primary-800/40 hover:bg-primary-800/60 text-white border border-white/20 px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 transition-all backdrop-blur-md hover:border-white/40">
                                <Target size={20} /> Voir mes objectifs
                            </button>
                        </Link>
                    </div>
                </div>
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-primary-400/20 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Premium Upgrade Banner */}
            {user?.role === 'STUDENT' && (
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white shadow-lg"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                <Crown size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Passez au Premium</h3>
                                <p className="text-white/90">Débloquez tous les modules, examens et fonctionnalités exclusives.</p>
                            </div>
                        </div>
                        <Link to="/payment">
                            <button className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold shadow-md transition-colors whitespace-nowrap">
                                Devenir Premium
                            </button>
                        </Link>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </motion.div>
            )}

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
                                <BookOpen className="text-primary-600 dark:text-primary-400" size={24} /> Commun
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-card px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                {commonCategories.length} disponibles
                            </span>
                        </div>

                        {commonCategories.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <BookOpen className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun module commun disponible pour le moment.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {commonCategories.slice(0, INITIAL_DISPLAY_COUNT).map((cat, index) => (
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            key={cat.id}
                                            className="group relative bg-white dark:bg-dark-card rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full"
                                        >
                                            {/* Gradient Header */}
                                            <div className={`h-32 w-full bg-gradient-to-br ${getCategoryGradient(index)} relative overflow-hidden`}>
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                                <div className="absolute -bottom-6 -right-6 text-white/20 transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                                    <BookOpen size={120} />
                                                </div>
                                                <div className="absolute top-6 left-6 flex gap-2">
                                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm">
                                                        Module Commun
                                                    </span>
                                                    {cat.isFree ? (
                                                        <span className="bg-green-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                                                            Gratuit (Freemium)
                                                        </span>
                                                    ) : (
                                                        <span className="bg-yellow-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                                                            <Crown size={12} /> Premium
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col relative">
                                                {/* Floating Icon */}
                                                <div className="absolute -top-10 left-6 w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-dark-card group-hover:scale-110 transition-transform duration-300">
                                                    <div className={`text-${getCategoryGradient(index).split('-')[1]}-500`}>
                                                        <BookOpen size={32} className="text-gray-700 dark:text-white" />
                                                    </div>
                                                </div>

                                                <div className="mt-8 mb-4">
                                                    <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                                        {cat.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                            <span>{cat._count?.questions || 0} Questions</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                                    {user?.role === 'STUDENT' && !cat.isFree ? (
                                                        <Link to="/payment">
                                                            <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-3 rounded-xl font-bold transition-all flex items-center justify-between px-4 group/btn hover:bg-gray-200 dark:hover:bg-gray-700">
                                                                <span className="flex items-center gap-2"><Lock size={16} /> Premium</span>
                                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center transition-colors shadow-sm">
                                                                    <Lock size={14} />
                                                                </div>
                                                            </button>
                                                        </Link>
                                                    ) : (
                                                        <Link to={`/quiz?category=${encodeURIComponent(cat.name)}`}>
                                                            <button className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-gray-700 text-gray-900 dark:text-white hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-between px-4 group/btn">
                                                                <span>Commencer</span>
                                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 group-hover/btn:bg-primary-500 group-hover/btn:text-white flex items-center justify-center transition-colors shadow-sm">
                                                                    <ArrowRight size={16} />
                                                                </div>
                                                            </button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                {commonCategories.length > INITIAL_DISPLAY_COUNT && (
                                    <div className="flex justify-center mt-8">
                                        <Link to="/modules/common">
                                            <button className="group relative px-8 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <span className="relative flex items-center gap-2">
                                                    Voir tous les modules
                                                    <div className="bg-primary-100 dark:bg-primary-900/50 p-1 rounded-full group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </span>
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>

                    {/* Specialty Modules */}
                    {user?.specialty && (
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Star className="text-yellow-500" size={24} /> Ma Spécialité : {user.specialty.name}
                                </h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-card px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                    {specialtyCategories.length} disponibles
                                </span>
                            </div>

                            {specialtyCategories.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-dark-card rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <Star className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun module de spécialité disponible pour le moment.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {specialtyCategories.slice(0, INITIAL_DISPLAY_COUNT).map((cat, index) => (
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                key={cat.id}
                                                className="group relative bg-white dark:bg-dark-card rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full"
                                            >
                                                {/* Gradient Header */}
                                                <div className={`h-32 w-full bg-gradient-to-br from-yellow-500 to-orange-600 relative overflow-hidden`}>
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                                    <div className="absolute -bottom-6 -right-6 text-white/20 transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                                        <Star size={120} />
                                                    </div>
                                                    <div className="absolute top-6 left-6 flex gap-2">
                                                        <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm">
                                                            Spécialité
                                                        </span>
                                                        {cat.isFree ? (
                                                            <span className="bg-green-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                                                                Gratuit (Freemium)
                                                            </span>
                                                        ) : (
                                                            <span className="bg-yellow-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                                                                <Crown size={12} /> Premium
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-6 flex-1 flex flex-col relative">
                                                    {/* Floating Icon */}
                                                    <div className="absolute -top-10 left-6 w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-dark-card group-hover:scale-110 transition-transform duration-300">
                                                        <div className="text-yellow-500">
                                                            <Star size={32} className="text-gray-700 dark:text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 mb-4">
                                                        <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
                                                            {cat.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                                <span>{cat._count?.questions || 0} Questions</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                                        {user?.role === 'STUDENT' && !cat.isFree ? (
                                                            <Link to="/payment">
                                                                <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-3 rounded-xl font-bold transition-all flex items-center justify-between px-4 group/btn hover:bg-gray-200 dark:hover:bg-gray-700">
                                                                    <span className="flex items-center gap-2"><Lock size={16} /> Premium</span>
                                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center transition-colors shadow-sm">
                                                                        <Lock size={14} />
                                                                    </div>
                                                                </button>
                                                            </Link>
                                                        ) : (
                                                            <Link to={`/quiz?category=${encodeURIComponent(cat.name)}`}>
                                                                <button className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-gray-700 text-gray-900 dark:text-white hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-between px-4 group/btn">
                                                                    <span>Commencer</span>
                                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 group-hover/btn:bg-yellow-500 group-hover/btn:text-white flex items-center justify-center transition-colors shadow-sm">
                                                                        <ArrowRight size={16} />
                                                                    </div>
                                                                </button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {specialtyCategories.length > INITIAL_DISPLAY_COUNT && (
                                        <div className="flex justify-center mt-8">
                                            <Link to="/modules/specialty">
                                                <button className="group relative px-8 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <span className="relative flex items-center gap-2">
                                                        Voir tous les modules
                                                        <div className="bg-primary-100 dark:bg-primary-900/50 p-1 rounded-full group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                                            <ChevronRight size={16} />
                                                        </div>
                                                    </span>
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
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
