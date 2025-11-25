import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Save, ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
    const { user, login } = useAuth(); // We might need to update the user in context after save
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Les nouveaux mots de passe ne correspondent pas." });
            setLoading(false);
            return;
        }

        const nameRegex = /^[a-zA-Z\u00C0-\u00FF\s'-]+$/;
        if (!nameRegex.test(name)) {
            setMessage({ type: 'error', text: "Le nom ne doit contenir que des lettres, des espaces et des tirets." });
            setLoading(false);
            return;
        }

        try {
            const res = await axios.put('/auth/profile', {
                name,
                currentPassword: currentPassword || undefined,
                newPassword: newPassword || undefined
            });

            setMessage({ type: 'success', text: "Profil mis à jour avec succès !" });

            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Ideally we should update the user in context here, but for now a page refresh or re-login works.
            // If the AuthContext had a 'setUser' exposed, we could use it.
            // For now, let's just rely on the fact that the backend is updated.

        } catch (error) {
            console.error("Profile update error", error);
            setMessage({ type: 'error', text: error.response?.data?.message || "Erreur lors de la mise à jour." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12 transition-colors duration-300">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm transition-colors duration-300">
                <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-blue-600 dark:text-blue-400" size={24} /> Mon Profil
                    </h1>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
                <Card className="p-5 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-8 text-center md:text-left">
                        <div className="w-20 h-20 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl md:text-2xl font-bold shadow-inner">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mt-2">
                                <Shield size={12} /> {user?.role === 'ADMIN' ? 'Administrateur' : 'Étudiant'}
                            </span>
                            {user?.specialty && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mt-2 ml-2">
                                    {user.specialty}
                                </span>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30'
                            }`}>
                            {message.type === 'success' ? <CheckCircle size={20} className="flex-shrink-0" /> : <AlertCircle size={20} className="flex-shrink-0" />}
                            <span className="text-sm">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Informations personnelles</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 md:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                            </div>

                            {user?.specialty && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spécialité</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Shield size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={user.specialty}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 md:py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">La spécialité ne peut pas être modifiée.</p>
                                </div>
                            )}
                        </div>

                        {/* Password Section */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Sécurité</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remplissez ces champs uniquement si vous souhaitez changer de mot de passe.</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 md:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 md:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 md:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex flex-col-reverse md:flex-row justify-end gap-3">
                            <Link to="/dashboard" className="w-full md:w-auto">
                                <Button type="button" variant="ghost" className="w-full md:w-auto justify-center dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 w-full md:w-auto py-3 md:py-2 shadow-lg shadow-blue-500/20"
                            >
                                {loading ? 'Enregistrement...' : <><Save size={18} /> Enregistrer</>}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
