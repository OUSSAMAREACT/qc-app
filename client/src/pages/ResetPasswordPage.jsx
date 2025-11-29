import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { BookOpen, Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la réinitialisation");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <SEO
                    title="Réinitialisation du mot de passe"
                    description="Réinitialisez votre mot de passe QCMEchelle11."
                    url="/reset-password"
                    robots="noindex, nofollow"
                />
                <Card className="max-w-md w-full text-center p-8">
                    <div className="text-red-500 mb-4">Lien invalide ou manquant.</div>
                    <Link to="/login">
                        <Button>Retour à la connexion</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 dark:from-gray-900 dark:to-gray-800 p-4 font-sans transition-colors duration-300">
            <SEO
                title="Nouveau mot de passe"
                description="Définissez votre nouveau mot de passe pour accéder à votre compte QCMEchelle11."
                url="/reset-password"
                robots="noindex, nofollow"
            />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-white/10 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-xl border border-white/20 dark:border-white/10">
                        <BookOpen className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">QCM Echelle 11</h1>
                </div>

                <Card className="shadow-2xl border-0 ring-1 ring-white/50 dark:ring-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau mot de passe</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Définissez votre nouveau mot de passe</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Mot de passe modifié !</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Vous allez être redirigé vers la page de connexion...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Nouveau mot de passe"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                leftElement={<Lock size={18} className="text-gray-400" />}
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />

                            <Input
                                label="Confirmer le mot de passe"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                leftElement={<Lock size={18} className="text-gray-400" />}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-2.5 shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Réinitialiser"
                                )}
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}
