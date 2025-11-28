import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import axios from 'axios';
import {
    User, Mail, Lock, Save, Award,
    TrendingUp, Calendar, BookOpen, Target,
    MapPin, Building2, Phone, Map
} from 'lucide-react';
import PremiumBadge from '../components/ui/PremiumBadge';
import { motion } from 'framer-motion';
import { moroccoRegions } from '../data/moroccoData';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

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
            className="max-w-6xl mx-auto space-y-8 pb-12"
        >
            {/* Header Section with Cover */}
            <motion.div variants={itemVariants} className="relative mb-12">
                <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Avatar - Overlapping */}
                <div className="absolute -bottom-16 left-8 md:left-12 flex items-end">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white dark:bg-gray-800 p-2 shadow-2xl ring-4 ring-white/50 dark:ring-gray-700/50 backdrop-blur-sm z-10">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-5xl md:text-6xl font-bold shadow-inner">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* User Info - Below Cover */}
            <motion.div variants={itemVariants} className="px-4 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-20 md:mt-4">
                <div className="md:pl-44 w-full"> {/* Offset for avatar width + gap */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white">
                                {user?.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-300 font-medium mt-2">
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                                    <Award size={16} className="text-yellow-500" />
                                    <span>{user?.role === 'ADMIN' ? 'Administrateur' : 'Étudiant'}</span>
                                </div>
                                {user?.specialty ? (
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span>{user.specialty.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full shadow-sm border border-yellow-100 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 text-sm">
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                        <span>Spécialité non définie</span>
                                    </div>
                                )}
                                {user?.city && (
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                                        <MapPin size={16} className="text-red-500" />
                                        <span>{user.city}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="shadow-lg shadow-blue-500/20"
                            >
                                Modifier le profil
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* Left Column: Stats & Badges */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.currentStreak || 0}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Série Actuelle</div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                <Target size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.longestStreak || 0}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Record Série</div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.totalQuizzes || 0}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Quiz Total</div>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                <Calendar size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.weeklyProgress?.questionsAnswered || 0}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Questions (Sem)</div>
                        </div>
                    </motion.div>

                    {/* Badges Section */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-white dark:bg-dark-card border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 mb-6 p-2">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl">
                                    <Award size={24} />
                                </div>
                                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">Mes Badges</h2>
                            </div>

                            {user?.badges && user.badges.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {user.badges.map((badge) => (
                                        <div key={badge.id} className="flex flex-col items-center group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div className="transform transition-transform duration-300 group-hover:scale-110 drop-shadow-lg">
                                                <PremiumBadge type={badge.type} size="lg" />
                                            </div>
                                            <span className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200 text-center">
                                                {badge.name}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                {new Date(badge.awardedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Award size={32} />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun badge obtenu pour le moment.</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Participez aux examens hebdomadaires pour en gagner !</p>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column: Edit Profile */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <Card className="bg-white dark:bg-dark-card border-gray-100 dark:border-gray-700 shadow-lg sticky top-24">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={20} className="text-blue-600" /> Détails du Profil
                            </h2>
                            {isEditing && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsEditing(false)}
                                    className="text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                                >
                                    Annuler
                                </Button>
                            )}
                        </div>

                        {message && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl text-sm border border-green-100 dark:border-green-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-100 dark:border-red-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Read-Only / Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Nom complet</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Extended Profile Info */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Informations Personnelles</h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Region & City */}
                                    {isEditing ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Région</label>
                                                <div className="relative">
                                                    <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <select
                                                        value={selectedRegion}
                                                        onChange={handleRegionChange}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                                    >
                                                        <option value="">Sélectionner une région</option>
                                                        {moroccoRegions.map((region) => (
                                                            <option key={region.name} value={region.name}>{region.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ville</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <select
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        disabled={!selectedRegion}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none disabled:opacity-50"
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
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ville / Région</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.city || 'Non renseigné'}
                                                    disabled
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Hospital */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hôpital / Lieu de travail</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="hospital"
                                                value={formData.hospital}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="Ex: CHU Ibn Rochd"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="+212 6..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specialty Selection - Only if not set */}
                            {!user?.specialty && (
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                        Spécialité <span className="text-xs text-yellow-600 dark:text-yellow-400 normal-case">(Choix unique)</span>
                                    </label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            name="specialtyId"
                                            value={formData.specialtyId || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                                        >
                                            <option value="">Sélectionner une spécialité</option>
                                            {specialties.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                                >
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sécurité</h3>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Mot de passe actuel</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                placeholder="Requis pour changer de mot de passe"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nouveau mot de passe</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="Laisser vide pour ne pas changer"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all">
                                        <Save size={18} /> Enregistrer les modifications
                                    </Button>
                                </motion.div>
                            )}
                        </form>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
