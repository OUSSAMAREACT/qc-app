import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { BookOpen, Trophy, Target, Users, ArrowRight, LayoutDashboard, LogIn, Sun, Moon, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CountdownTimer from '../components/CountdownTimer';

export default function LandingPage() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [questionCount, setQuestionCount] = useState("1000+");

    useEffect(() => {
        const fetchCount = async () => {
            try {
                // Use relative path if proxy is set up, or full URL if env var is available
                // Assuming Vite proxy or same origin in production
                let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                if (window.location.protocol === 'https:' && apiUrl.startsWith('http:')) {
                    apiUrl = apiUrl.replace('http:', 'https:');
                }
                const response = await fetch(`${apiUrl}/questions/count`);
                if (response.ok) {
                    const data = await response.json();
                    setQuestionCount(data.count + "+");
                }
            } catch (error) {
                console.error("Failed to fetch question count", error);
            }
        };
        fetchCount();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 selection:bg-blue-500 selection:text-white">
            <SEO
                title="QCMEchelle11 - Préparez votre examen Echelle 11"
                description="La plateforme ultime pour préparer votre examen professionnel Echelle 11. QCMs, examens blancs, suivi de progression et gamification."
                name="QCMEchelle11"
                type="website"
            />

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                                <BookOpen className="text-white h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                QCMEchelle11
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all active:scale-95"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            {user ? (
                                <Link to="/dashboard">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-xl px-3 sm:px-6">
                                        <LayoutDashboard className="h-5 w-5 sm:mr-2 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">Tableau de Bord</span>
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="hidden sm:block">
                                        <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                                            Connexion
                                        </Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-xl px-6">
                                            S'inscrire
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    {/* Background Blobs - Animated */}
                    {/* Background Blobs - Animated - Light Mode (Multiply) */}
                    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-300 ease-in-out">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-400/20 rounded-full blur-3xl animate-pulse mix-blend-multiply" />
                        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
                        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
                    </div>

                    {/* Background Blobs - Animated - Dark Mode (Screen) */}
                    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300 ease-in-out">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-900/20 rounded-full blur-3xl animate-pulse mix-blend-screen" />
                        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-3xl mix-blend-screen animate-blob" />
                        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000" />
                    </div>

                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <div className="animate-fade-in-up">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center py-1.5 px-4 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-bold mb-8 border border-blue-100 dark:border-blue-800/50 shadow-sm backdrop-blur-sm"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                                La référence pour l'examen Echelle 11
                            </motion.span>

                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                                Réussissez votre <br className="hidden md:block" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient-x">
                                    Concours & Carrière
                                </span>
                            </h1>

                            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                                La plateforme de référence pour l'Echelle 11, Master ISPITS, ISSS et ENSP. Cours, résumés et QCMs pour exceller.
                            </p>

                            <CountdownTimer />

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                {user ? (
                                    <Link to="/dashboard" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 rounded-2xl transition-transform hover:scale-105 active:scale-95">
                                            Accéder à mon Espace <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/register" className="w-full sm:w-auto">
                                            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 rounded-2xl transition-transform hover:scale-105 active:scale-95">
                                                Commencer Gratuitement <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Link to="/login" className="w-full sm:w-auto">
                                            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-transform hover:scale-105 active:scale-95">
                                                <LogIn className="mr-2 h-5 w-5" /> Se connecter
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats Preview - Glassmorphism */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                        >
                            <StatCard number={questionCount} label="Questions QCM" color="text-blue-600 dark:text-blue-400" />
                            <StatCard number="Hebdo" label="Examens Blancs" color="text-indigo-600 dark:text-indigo-400" />
                            <StatCard number="100%" label="Suivi de Progression" color="text-purple-600 dark:text-purple-400" />
                        </motion.div>
                    </div>
                </section>

                {/* Modules Section */}
                <section className="py-24 bg-white dark:bg-gray-800/50 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Un Programme Complet</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                                Préparez-vous pour l'Echelle 11, le Master ISPITS, ISSS et l'ENSP avec nos modules spécialisés.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Target className="h-8 w-8 text-red-500" />}
                                title="Santé Publique"
                                description="Comprenez le système de santé (Loi cadre 06-22), l'épidémiologie et les programmes sanitaires nationaux."
                            />
                            <FeatureCard
                                icon={<Users className="h-8 w-8 text-green-500" />}
                                title="Soins Infirmiers"
                                description="Approfondissez le raisonnement clinique, la démarche de soins, l'éthique et la gestion des médicaments."
                            />
                            <FeatureCard
                                icon={<Trophy className="h-8 w-8 text-yellow-500" />}
                                title="Législation & Droit"
                                description="Tout sur la protection sociale, la responsabilité médicale et les décrets régissant la profession."
                            />
                        </div>
                    </div>
                </section>

                {/* New Features Section */}
                <section className="py-24 bg-blue-50 dark:bg-gray-900/50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-20">
                            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm">Innovation</span>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Une Technologie au Service de votre Réussite</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                                Profitez d'outils exclusifs pour optimiser votre apprentissage et gagner du temps.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <Card className="p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                                        <Zap size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Tuteur IA Personnel</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Ne restez jamais bloqué. Notre IA analyse vos réponses et vous fournit des explications détaillées et personnalisées pour chaque question.
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                        <div className="relative">
                                            <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                            <Users size={32} className="hidden" /> {/* Placeholder to keep import if needed, but using a different icon here would be better if imported. I'll use LayoutDashboard as a fallback or just text if icon missing. Wait, I can use the existing imports. */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><path d="M16 9a5 5 0 0 1 0 6" /><path d="M19.364 18.364a9 9 0 0 0 0-12.728" /></svg>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Révision Audio (TTS)</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Apprenez partout. Écoutez les questions et les choix de réponses en haute qualité audio, idéal pour réviser dans les transports ou en faisant du sport.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-24 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Pourquoi choisir QCMEchelle11 ?</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Contenu Actualisé {new Date().getFullYear()}</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Nos cours et QCM sont mis à jour régulièrement pour refléter les dernières réformes (GST, Loi 06-22).</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                            <BookOpen size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Ressources Exclusives</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Accédez à des résumés synthétiques : Santé en chiffres, Comptes nationaux, et Guides de bonnes pratiques.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Méthode Éprouvée</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Combinez apprentissage théorique et pratique intensive avec nos examens blancs hebdomadaires.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl transform rotate-3 opacity-20 blur-lg"></div>
                                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <span className="font-medium">Taux de réussite</span>
                                            <span className="text-green-500 font-bold">+85%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <span className="font-medium">Utilisateurs Actifs</span>
                                            <span className="text-blue-500 font-bold">5,000+</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <span className="font-medium">Questions Disponibles</span>
                                            <span className="text-purple-500 font-bold">2,500+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4">
                    <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-black/20 transition-colors duration-500" />

                        <h2 className="text-3xl md:text-5xl font-bold mb-8 relative z-10 leading-tight">Prêt à réussir votre examen ?</h2>
                        <p className="text-blue-100 mb-12 max-w-2xl mx-auto text-xl relative z-10 font-light">
                            Rejoignez dès maintenant la plateforme de référence et donnez un nouvel élan à votre carrière.
                        </p>

                        <div className="relative z-10">
                            {user ? (
                                <Link to="/dashboard">
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-none text-lg px-10 py-5 h-auto rounded-2xl shadow-xl transition-transform hover:scale-105">
                                        Retourner au Tableau de Bord
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/register">
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-none text-lg px-10 py-5 h-auto rounded-2xl shadow-xl transition-transform hover:scale-105">
                                        Créer mon compte gratuitement
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">QCMEchelle11</span>
                    </div>
                    <p className="mb-6 text-sm">
                        La plateforme n°1 pour la préparation aux examens professionnels.
                    </p>
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <Link to="/about" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            À propos de l'offre
                        </Link>
                    </div>
                    <p className="text-sm opacity-70">© {new Date().getFullYear()} QCMEchelle11. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}

function StatCard({ number, label, color }) {
    return (
        <div className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:-translate-y-1">
            <div className={`text-5xl font-extrabold ${color} mb-3`}>{number}</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium text-lg">{label}</div>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 rounded-3xl group hover:-translate-y-1">
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {description}
            </p>
        </Card>
    );
}
