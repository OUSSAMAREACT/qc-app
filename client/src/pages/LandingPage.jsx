import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { BookOpen, Trophy, Target, Users, ArrowRight, CheckCircle, Star } from 'lucide-react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SEO
                title="QCMEchelle11 - Préparez votre examen Echelle 11"
                description="La plateforme ultime pour préparer votre examen professionnel Echelle 11. QCMs, examens blancs, suivi de progression et gamification."
                name="QCMEchelle11"
                type="website"
            />

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <BookOpen className="text-white h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                QCMEchelle11
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login">
                                <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                    Connexion
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                                    S'inscrire
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-400/20 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30" />
                </div>

                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 border border-blue-200 dark:border-blue-800">
                            🚀 Préparez votre réussite
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                            Maîtrisez votre examen <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                Professionnel Echelle 11
                            </span>
                        </h1>
                        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
                            Une plateforme complète avec des milliers de QCMs, des examens blancs hebdomadaires et un suivi détaillé de votre progression.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 rounded-xl">
                                    Commencer Gratuitement <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl">
                                    Déjà un compte ?
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                    >
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">1000+</div>
                            <div className="text-gray-600 dark:text-gray-400">Questions QCM</div>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Hebdo</div>
                            <div className="text-gray-600 dark:text-gray-400">Examens Blancs</div>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
                            <div className="text-gray-600 dark:text-gray-400">Suivi de Progression</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Une suite d'outils conçus pour maximiser vos chances de réussite.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Target className="h-8 w-8 text-blue-500" />}
                            title="Entraînement Ciblé"
                            description="Choisissez vos modules et spécialités. Entraînez-vous sur des séries de questions spécifiques."
                        />
                        <FeatureCard
                            icon={<Trophy className="h-8 w-8 text-yellow-500" />}
                            title="Compétition Saine"
                            description="Participez aux examens hebdomadaires, grimpez dans le classement et gagnez des badges."
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8 text-green-500" />}
                            title="Communauté"
                            description="Rejoignez une communauté de candidats motivés. Comparez vos résultats et progressez ensemble."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Prêt à réussir votre examen ?</h2>
                    <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg relative z-10">
                        Rejoignez dès maintenant la plateforme de référence pour la préparation à l'examen professionnel.
                    </p>
                    <Link to="/register" className="relative z-10">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-none text-lg px-8 py-4 h-auto rounded-xl shadow-lg">
                            Créer mon compte gratuitement
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">QCMEchelle11</span>
                    </div>
                    <p className="mb-4">© 2024 QCMEchelle11. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <Card className="p-8 hover:shadow-xl transition-all duration-300 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl w-fit">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </Card>
    );
}
