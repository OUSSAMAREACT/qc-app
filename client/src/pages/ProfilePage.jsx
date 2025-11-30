import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import axios from 'axios';
import {
    User, Mail, Lock, Save, Award,
    TrendingUp, Calendar, BookOpen, Target,
    MapPin, Building2, Phone, Map, Crown,
    Sparkles, Shield, Edit3, Camera, CreditCard, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import PremiumBadge from '../components/ui/PremiumBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { moroccoRegions } from '../data/moroccoData';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const editSectionRef = useRef(null);

    // Find initial region based on user city if possible
    const findRegionByCity = (city) => {
        if (!city) return '';
        const region = moroccoRegions.find(r => r.cities.includes(city));
        return region ? region.name : '';
    };

    const [selectedRegion, setSelectedRegion] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        currentPassword: '',
        newPassword: '',
        city: '',
        hospital: '',
        gender: '',
        phoneNumber: '',
        specialtyId: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [specialties, setSpecialties] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                currentPassword: '',
                newPassword: '',
                city: user.city || '',
                hospital: user.hospital || '',
                gender: user.gender || '',
                phoneNumber: user.phoneNumber || '',
                specialtyId: user.specialtyId || ''
            });
            setSelectedRegion(findRegionByCity(user.city));
        }
    }, [user]);

    useEffect(() => {
        fetchStats();
        fetchSpecialties();
    }, []);

    const fetchSpecialties = async () => {
        try {
            const res = await axios.get('/specialties');
            setSpecialties(res.data);
        } catch (error) {
            console.error("Failed to fetch specialties", error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/gamification/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch gamification stats", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value);
        setFormData({ ...formData, city: '' });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        // Small delay to ensure state update and render before scrolling
        setTimeout(() => {
            editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const updateData = { ...formData };
            // Only include specialtyId if it's selected and user doesn't have one
            if (!user.specialty && formData.specialtyId) {
                updateData.specialtyId = formData.specialtyId;
            }
            // Remove password fields if empty
            if (!updateData.newPassword) {
                delete updateData.currentPassword;
                delete updateData.newPassword;
            }

            const res = await axios.put('/auth/profile', updateData);
            setMessage(res.data.message);
            login(res.data.token, res.data.user); // Update context
            setIsEditing(false);
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (err) {
            setError(err.response?.data?.message || "Une erreur est survenue.");
        }
    };

    const availableCities = selectedRegion
        ? moroccoRegions.find(r => r.name === selectedRegion)?.cities || []
        : [];

    const getDaysRemaining = () => {
        if (!user?.premiumExpiresAt) return 0;
        const today = new Date();
        const expiry = new Date(user.premiumExpiresAt);
        const diffTime = expiry - today;
        if (diffTime < 0) return 0;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
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
            className="max-w-7xl mx-auto space-y-8 pb-12"
        >
            <SEO
                title="Mon Profil"
                description="Gérez votre profil, vos informations personnelles et vos statistiques sur QCMEchelle11."
                url="/profile"
            />

            {/* Hero Section - Premium Mesh Gradient */}
            <motion.div variants={itemVariants} className="relative mb-20">
                <div className="h-64 md:h-80 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-indigo-900/20">
                    {/* Animated Mesh Gradient */}
                    <div className="absolute inset-0 bg-gray-900">
                        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500 opacity-60 mix-blend-overlay"></div>
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/30 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/30 rounded-full blur-[120px] animate-pulse delay-700"></div>
                    </div>

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                </div>

                {/* Profile Info Overlay */}
                <div className="absolute -bottom-16 left-0 right-0 px-6 md:px-12 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                    {/* Avatar with Glass Ring */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative group"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-white dark:bg-gray-800 p-1.5 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl z-10 relative overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[1.7rem] flex items-center justify-center text-white text-5xl md:text-6xl font-bold shadow-inner">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </div>
                        {user?.role === 'PREMIUM' && (
                            <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800 z-20">
                                <Crown size={20} fill="currentColor" />
                            </div>
                        )}
                    </motion.div>

                    {/* User Details */}
                    <div className="flex-1 mb-2 w-full md:w-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 text-center md:text-left">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-heading font-bold text-white drop-shadow-md">
                                    {user?.name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                                    {/* Role Badge */}
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border ${user?.role === 'PREMIUM'
                                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200'
                                        : 'bg-white/90 text-gray-700 border-white/50 backdrop-blur-sm'
                                        }`}>
                                        {user?.role === 'PREMIUM' ? <Crown size={14} fill="currentColor" /> : <User size={14} />}
                                        <span>{user?.role === 'PREMIUM' ? 'Membre Premium' : 'Compte Gratuit'}</span>
                                    </div>

                                    {/* Specialty Badge */}
                                    {user?.specialty ? (
                                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border border-white/50 text-gray-700">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            {user.specialty.name}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-medium border border-red-100 shadow-sm">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            Spécialité non définie
                                        </div>
                                    )}

                                    {/* Location Badge */}
                                    {user?.city && (
                                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium shadow-sm border border-white/50 text-gray-700">
                                            <MapPin size={14} /> {user.city}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isEditing && (
                                <Button
                                    onClick={handleEditClick}
                                    className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl px-6 py-3 font-bold shadow-xl shadow-black/10 flex items-center gap-2 transition-all hover:-translate-y-1"
                                >
                                    <Edit3 size={18} /> Modifier le profil
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-0 pt-12">
                {/* Left Column: Stats & Badges */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Stats Grid - Glassmorphism */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: TrendingUp, label: "Série Actuelle", value: stats?.streak || 0, color: "orange" },
                            { icon: Target, label: "Record Série", value: stats?.longestStreak || 0, color: "blue" },
                            { icon: BookOpen, label: "Quiz Total", value: stats?.totalQuizzes || 0, color: "purple" },
                            { icon: Calendar, label: "Questions (Sem)", value: stats?.weeklyProgress?.questionsAnswered || 0, color: "green" }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center hover:shadow-md transition-all group relative overflow-hidden">
                                <div className={`absolute inset-0 bg-${stat.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-heading">{stat.value}</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Subscription Status Card */}
                    <motion.div variants={itemVariants}>
                        <div className="bg-white dark:bg-dark-card rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${user?.role === 'PREMIUM' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                                        <CreditCard size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">Abonnement</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Gérez votre plan et vos accès</p>
                                    </div>
                                </div>
                                {user?.role === 'PREMIUM' ? (
                                    <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-2">
                                        <CheckCircle size={14} /> Actif
                                    </span>
                                ) : (
                                    <Link to="/payment">
                                        <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40">
                                            Passer Premium
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex-1 w-full">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plan Actuel</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {user?.role === 'PREMIUM' ? 'Membre Premium' : 'Compte Gratuit'}
                                                {user?.role === 'PREMIUM' && <Crown size={20} className="text-yellow-500" fill="currentColor" />}
                                            </p>
                                        </div>
                                    </div>

                                    {user?.role === 'PREMIUM' && user?.premiumExpiresAt && (
                                        <div className="flex items-center gap-6 w-full md:w-auto bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                            <div className="text-center px-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expire le</p>
                                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                                    {new Date(user.premiumExpiresAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="text-center px-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jours Restants</p>
                                                <p className={`text-xl font-bold ${getDaysRemaining() < 7 ? 'text-red-500' : 'text-indigo-600'}`}>
                                                    {getDaysRemaining()} Jours
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {user?.role !== 'PREMIUM' && (
                                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <Sparkles size={16} className="text-yellow-500" />
                                        Passez à la vitesse supérieure pour accéder à tous les modules et fonctionnalités exclusives.
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Badges Section */}
                    <motion.div variants={itemVariants}>
                        <div className="bg-white dark:bg-dark-card rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-2xl">
                                    <Award size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Collection de Badges</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Vos trophées et accomplissements</p>
                                </div>
                            </div>

                            {user?.badges && user.badges.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {user.badges.map((badge) => (
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            key={badge.id}
                                            className="flex flex-col items-center group p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:shadow-lg transition-all"
                                        >
                                            <div className="transform transition-transform duration-300 group-hover:scale-110 drop-shadow-xl">
                                                <PremiumBadge type={badge.type} size="lg" />
                                            </div>
                                            <span className="mt-4 text-sm font-bold text-gray-900 dark:text-white text-center leading-tight">
                                                {badge.name}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 font-medium">
                                                {new Date(badge.awardedAt).toLocaleDateString()}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-300 dark:text-gray-600">
                                        <Award size={40} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun badge pour le moment</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                        Participez aux examens hebdomadaires et complétez des séries pour débloquer des trophées exclusifs !
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Edit Profile */}
                <motion.div variants={itemVariants} className="lg:col-span-4" ref={editSectionRef}>
                    <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700/50 sticky top-24 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-between">
                            <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Shield size={20} className="text-indigo-600" /> Détails du Compte
                            </h2>
                            {isEditing && (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {message && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-2xl text-sm border border-green-100 dark:border-green-800 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                                    {message}
                                </motion.div>
                            )}
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-2xl text-sm border border-red-100 dark:border-red-800 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Read-Only / Basic Info */}
                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Nom complet</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Extended Profile Info */}
                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-5">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Sparkles size={16} className="text-yellow-500" /> Informations Personnelles
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5">
                                        {/* Region & City */}
                                        {isEditing ? (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Région</label>
                                                    <div className="relative">
                                                        <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                        <select
                                                            value={selectedRegion}
                                                            onChange={handleRegionChange}
                                                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all"
                                                        >
                                                            <option value="">Sélectionner une région</option>
                                                            {moroccoRegions.map((region) => (
                                                                <option key={region.name} value={region.name}>{region.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Ville</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                        <select
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleChange}
                                                            disabled={!selectedRegion}
                                                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none disabled:opacity-50 transition-all"
                                                        >
                                                            <option value="">Sélectionner une ville</option>
                                                            {availableCities.map((city) => (
                                                                <option key={city} value={city}>{city}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Ville / Région</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={formData.city || 'Non renseigné'}
                                                        disabled
                                                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Hospital */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Hôpital / Lieu de travail</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="hospital"
                                                    value={formData.hospital}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    placeholder="Ex: CHU Ibn Rochd"
                                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Téléphone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    placeholder="+212 6..."
                                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Specialty Selection - Only if not set */}
                                {!user?.specialty && (
                                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                            Spécialité <span className="text-xs text-yellow-600 dark:text-yellow-400 normal-case font-normal bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-md ml-2">Choix unique</span>
                                        </label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                name="specialtyId"
                                                value={formData.specialtyId || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                                            >
                                                <option value="">Sélectionner une spécialité</option>
                                                {specialties.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {isEditing && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-5 pt-6 border-t border-gray-100 dark:border-gray-700"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Lock size={16} className="text-red-500" /> Sécurité
                                            </h3>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Mot de passe actuel</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="password"
                                                        name="currentPassword"
                                                        value={formData.currentPassword}
                                                        onChange={handleChange}
                                                        placeholder="Requis pour changer de mot de passe"
                                                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Nouveau mot de passe</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleChange}
                                                        placeholder="Laisser vide pour ne pas changer"
                                                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all mt-4">
                                                <Save size={20} /> Enregistrer les modifications
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
