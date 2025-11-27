import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Trophy, Users, CheckCircle, Brain, Clock, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';

export default function AboutPage() {
    const { user } = useAuth();

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <SEO
                title="À propos de QCMEchelle11 - Notre Offre"
                description="Découvrez comment QCMEchelle11 vous prépare aux examens professionnels et concours de santé avec une méthode éprouvée."
                name="QCMEchelle11"
                type="website"
            />

            {/* Navbar Placeholder (Assuming Navbar is global or handled in Layout, but for public pages we might need to ensure consistency. 
                If this page is public, we might want to wrap it in a Layout or just add a back button) 
                For now, let's add a simple header or rely on the main App structure if it includes Navbar.
                Looking at App.jsx, LandingPage has its own Navbar. We should probably reuse a Navbar component or copy the style.
                Let's add a simple "Back to Home" or "Navbar" here for consistency.
            */}
            <nav className="fixed w-full z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                                <BookOpen className="text-white h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                QCMEchelle11
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link to="/dashboard">
                                    <Button>Tableau de Bord</Button>
                                </Link>
                            ) : (
                                <Link to="/login">
                                    <Button variant="ghost">Connexion</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                            Votre Réussite, <span className="text-blue-600 dark:text-blue-400">Notre Mission</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                            QCMEchelle11 est la plateforme de référence dédiée à la préparation des examens professionnels et concours du secteur de la santé au Maroc.
                        </p>
                    </motion.div>

                    {/* Value Proposition Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                        <FeatureBlock
                            icon={<Brain className="text-purple-500" size={32} />}
                            title="Apprentissage Actif"
                            description="Fini le par cœur. Notre méthode repose sur la pratique intensive via des QCMs interactifs et des mises en situation clinique."
                        />
                        <FeatureBlock
                            icon={<Target className="text-red-500" size={32} />}
                            title="Ciblage Précis"
                            description="Nos modules couvrent spécifiquement le programme de l'Echelle 11, du Master ISPITS, et de l'ENSP. Rien de superflu."
                        />
                        <FeatureBlock
                            icon={<Clock className="text-blue-500" size={32} />}
                            title="Flexibilité Totale"
                            description="Révisez où vous voulez, quand vous voulez. Notre plateforme est optimisée pour mobile, tablette et ordinateur."
                        />
                        <FeatureBlock
                            icon={<Shield className="text-green-500" size={32} />}
                            title="Contenu Validé"
                            description="Toutes nos questions sont élaborées et vérifiées par des professionnels de santé et des experts pédagogiques."
                        />
                    </div>

                    {/* Detailed Offerings */}
                    <motion.div variants={itemVariants} className="space-y-12">
                        <Section
                            title="1. Banque de Questions Exhaustive"
                            content="Accédez à des milliers de QCMs classés par modules (Santé Publique, Management, Soins Infirmiers, Législation). Chaque question est accompagnée d'une correction détaillée pour comprendre vos erreurs."
                        />
                        <Section
                            title="2. Examens Blancs Hebdomadaires"
                            content="Mettez-vous en condition réelle chaque semaine. Nos examens blancs sont chronométrés et simulent la pression du jour J. Comparez votre classement avec les autres candidats au niveau national."
                        />
                        <Section
                            title="3. Suivi de Performance"
                            content="Notre tableau de bord intelligent analyse vos résultats. Identifiez vos points forts et vos lacunes grâce à des graphiques détaillés. Nous vous suggérons les modules à réviser en priorité."
                        />
                        <Section
                            title="4. Accessibilité & Inclusion"
                            content="Nous croyons que la réussite doit être accessible à tous. Notre fonctionnalité de lecture audio (Text-to-Speech) permet d'écouter les questions, idéal pour les révisions en déplacement ou pour les personnes malvoyantes."
                        />
                    </motion.div>

                    {/* CTA */}
                    <motion.div variants={itemVariants} className="mt-20 text-center">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl">
                            <h2 className="text-3xl font-bold mb-4">Prêt à exceller ?</h2>
                            <p className="text-blue-100 mb-8 text-lg">
                                Rejoignez dès aujourd'hui la communauté des majors de promotion.
                            </p>
                            <Link to="/register">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-none text-lg px-8 py-4 h-auto rounded-xl shadow-lg">
                                    Commencer Gratuitement
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 dark:bg-gray-800 py-12 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} QCMEchelle11. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureBlock({ icon, title, description }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-start hover:shadow-md transition-shadow">
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function Section({ title, content }) {
    return (
        <div className="bg-white/50 dark:bg-gray-800/30 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
                <CheckCircle className="text-blue-500 flex-shrink-0" size={24} />
                {title}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed pl-9">
                {content}
            </p>
        </div>
    );
}
