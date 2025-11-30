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
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto pointer-events-none">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse mix-blend-multiply dark:mix-blend-screen" />
                            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000 mix-blend-multiply dark:mix-blend-screen" />
                        </div>
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.05]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-bold mb-8 border border-blue-100 dark:border-blue-800/50 shadow-sm backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                                La référence pour l'examen Echelle 11
                            </span>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                                Réussissez votre <br className="hidden md:block" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient-x">
                                    Concours & Carrière
                                </span>
                            </h1>

                            <p className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
                                La plateforme tout-en-un pour l'Echelle 11, Master ISPITS, ISSS et ENSP.
                                <span className="block mt-2 text-gray-500 dark:text-gray-400">
                                    QCMs intelligents, Tuteur IA, et Suivi de progression détaillé.
                                </span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                                {user ? (
                                    <Link to="/dashboard" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 rounded-2xl transition-all hover:scale-105 active:scale-95 font-bold">
                                            Accéder à mon Espace <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/register" className="w-full sm:w-auto">
                                            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 rounded-2xl transition-all hover:scale-105 active:scale-95 font-bold">
                                                Commencer Gratuitement <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Link to="/login" className="w-full sm:w-auto">
                                            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-all hover:scale-105 active:scale-95 font-bold">
                                                <LogIn className="mr-2 h-5 w-5" /> Se connecter
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Stats Preview - Glassmorphism */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto"
                        >
                            <StatCard number={questionCount} label="Questions QCM" color="text-blue-600 dark:text-blue-400" icon={<BookOpen size={24} />} />
                            <StatCard number="IA" label="Tuteur Personnel" color="text-purple-600 dark:text-purple-400" icon={<Zap size={24} />} />
                            <StatCard number="Audio" label="Révision TTS" color="text-indigo-600 dark:text-indigo-400" icon={<Users size={24} />} />
                            <StatCard number="100%" label="Suivi Progression" color="text-green-600 dark:text-green-400" icon={<Target size={24} />} />
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

                {/* Features Bento Grid */}
                <section className="py-24 bg-white dark:bg-gray-900 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Tout ce dont vous avez besoin</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                                Une suite d'outils complète conçue pour maximiser vos chances de réussite.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* AI Tutor - Large Card */}
                            <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border border-purple-100 dark:border-purple-800/30">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-purple-600 shadow-lg mb-8 group-hover:scale-110 transition-transform">
                                        <Zap size={32} fill="currentColor" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Tuteur IA Personnel</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md">
                                        Une explication détaillée pour chaque question. Notre IA analyse vos erreurs et vous aide à comprendre le "pourquoi" de la réponse.
                                    </p>
                                </div>
                                <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3" />
                            </div>

                            {/* TTS - Tall Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border border-blue-100 dark:border-blue-800/30">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg mb-8 group-hover:scale-110 transition-transform">
                                        <Users size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Révision Audio</h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Écoutez vos cours et QCMs partout. Idéal pour les transports.
                                    </p>
                                </div>
                            </div>

                            {/* Mistake Box */}
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border border-red-100 dark:border-red-800/30">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-red-600 shadow-lg mb-8 group-hover:scale-110 transition-transform">
                                        <Target size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Boîte à Erreurs</h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Ciblez vos faiblesses. Répétez uniquement les questions où vous avez échoué.
                                    </p>
                                </div>
                            </div>

                            {/* History - Large Card */}
                            <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border border-green-100 dark:border-green-800/30">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-green-600 shadow-lg mb-8 group-hover:scale-110 transition-transform">
                                        <Trophy size={32} />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Suivi de Progression Détaillé</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md">
                                        Visualisez votre évolution avec des graphiques précis. Consultez l'historique de chaque quiz et analysez vos performances par module.
                                    </p>
                                </div>
                                <div className="absolute right-0 bottom-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof / Why Choose Us */}
                <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Pourquoi choisir QCMEchelle11 ?</h2>
                                <div className="space-y-8">
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
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                            <span className="font-medium text-lg">Taux de réussite</span>
                                            <span className="text-green-500 font-bold text-2xl">+85%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                            <span className="font-medium text-lg">Utilisateurs Actifs</span>
                                            <span className="text-blue-500 font-bold text-2xl">5,000+</span>
                                        </div>
                                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                            <span className="font-medium text-lg">Questions Disponibles</span>
                                            <span className="text-purple-500 font-bold text-2xl">2,500+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 opacity-90"></div>
                    </div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8">Prêt à exceller ?</h2>
                        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                            Rejoignez des milliers de professionnels de santé qui préparent leur avenir avec QCMEchelle11.
                        </p>
                        {!user && (
                            <Link to="/register">
                                <Button size="lg" className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-blue-50 shadow-xl rounded-2xl font-bold transition-transform hover:scale-105 active:scale-95">
                                    Créer un compte gratuit <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        )}
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

function StatCard({ number, label, color, icon }) {
    return (
        <div className="p-6 md:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center">
            <div className={`mb-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 ${color}`}>
                {icon}
            </div>
            <div className={`text-3xl md:text-4xl font-extrabold ${color} mb-2`}>{number}</div>
            <div className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base">{label}</div>
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
