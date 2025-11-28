import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { BookOpen, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'envoi de l'email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 dark:from-gray-900 dark:to-gray-800 p-4 font-sans transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-white/10 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-xl border border-white/20 dark:border-white/10">
                        <BookOpen className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">QCM Echelle 11</h1>
                </div>

                <Card className="shadow-2xl border-0 ring-1 ring-white/50 dark:ring-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mot de passe oublié</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Entrez votre email pour recevoir un lien de réinitialisation</p>
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
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Email envoyé !</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.
                            </p>
                            <Link to="/login">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Retour à la connexion
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Adresse e-mail"
                                type="email"
                                placeholder="exemple@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                leftElement={<Mail size={18} className="text-gray-400" />}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-2.5 shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Envoyer le lien"
                                )}
                            </Button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                            <Link to="/login">
                                <Button variant="secondary" className="w-full py-2.5 flex items-center justify-center group border-blue-200 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800">
                                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Retour
                                </Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
