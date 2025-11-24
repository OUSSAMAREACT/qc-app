import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { BookOpen, LogIn, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        alert("La réinitialisation du mot de passe sera bientôt disponible. Veuillez contacter l'administrateur.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 dark:from-gray-900 dark:to-gray-800 p-4 font-sans transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-white/10 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-xl border border-white/20 dark:border-white/10">
                        <BookOpen className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">QCM Echelle 11</h1>
                    <p className="text-blue-100 dark:text-gray-300 mt-2">Préparez votre examen en toute confiance</p>
                </div>

                <Card className="shadow-2xl border-0 ring-1 ring-white/50 dark:ring-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connexion</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Entrez vos identifiants pour accéder à votre espace</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Adresse e-mail"
                            type="email"
                            placeholder="exemple@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <div className="space-y-1">
                            <Input
                                label="Mot de passe"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
                            <div className="text-right">
                                <button type="button" onClick={handleForgotPassword} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline bg-transparent border-none cursor-pointer p-0">
                                    Mot de passe oublié ?
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-2.5 shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={18} /> Se connecter
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Pas encore de compte ?</p>
                        <Link to="/register">
                            <Button variant="secondary" className="w-full py-2.5 flex items-center justify-center group border-blue-200 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800">
                                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> S'inscrire
                            </Button>
                        </Link>
                    </div>
                </Card>

                <p className="text-center text-blue-200/60 dark:text-gray-500 text-xs mt-8">
                    © 2024 QCM Echelle 11. Tous droits réservés.
                </p>
            </div>
        </div>
    );
}
