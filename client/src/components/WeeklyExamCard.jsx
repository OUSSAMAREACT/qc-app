import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Trophy, Calendar, Clock, CheckCircle, ArrowRight, Sparkles, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeeklyExamCard({ exam }) {
    if (!exam) return null;

    const isSubmitted = exam.isSubmitted;
    const now = new Date();
    const endDate = new Date(exam.endDate);
    const timeLeft = Math.max(0, endDate - now);
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 text-white shadow-2xl shadow-indigo-500/30 group"
        >
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/15 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10 group-hover:bg-purple-500/30 transition-colors duration-500"></div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

            <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/10">
                            <Trophy className="text-yellow-300 drop-shadow-md" size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider bg-yellow-400/20 text-yellow-200 px-2 py-0.5 rounded-full border border-yellow-400/30 flex items-center gap-1">
                                    <Sparkles size={10} /> Challenge Hebdo
                                </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-heading font-bold leading-tight">
                                {exam.title}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                        <Clock className="text-blue-200" size={18} />
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-blue-200 font-medium uppercase tracking-wide">Temps Restant</span>
                            <span className="font-mono font-bold text-lg leading-none">
                                {daysLeft}j <span className="text-blue-300">:</span> {hoursLeft}h
                            </span>
                        </div>
                    </div>
                </div>

                {isSubmitted ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-400/30">
                                <CheckCircle className="text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-lg">Défi relevé !</p>
                                <p className="text-indigo-100 text-sm">Vous avez déjà participé à cet examen.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-black/20 px-6 py-3 rounded-xl border border-white/5">
                            <div className="text-right">
                                <p className="text-xs text-indigo-200 uppercase font-bold">Votre Score</p>
                                <p className="text-2xl font-bold text-white">{exam.userScore} <span className="text-sm text-indigo-300">/ {exam.questions.length}</span></p>
                            </div>
                        </div>
                        <Link to={`/weekly-exam/${exam.id}/leaderboard`}>
                            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-bold shadow-lg shadow-black/10">
                                Voir le classement <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Link to={`/weekly-exam/${exam.id}`} className="flex-1">
                            <Button className="w-full h-14 bg-white text-indigo-600 hover:bg-indigo-50 border-0 text-lg font-bold shadow-xl shadow-indigo-900/20 group-hover:shadow-indigo-900/30 transition-all transform group-hover:-translate-y-0.5 flex items-center justify-center gap-2 rounded-xl">
                                <Play size={20} fill="currentColor" /> Participer Maintenant
                            </Button>
                        </Link>
                        <Link to={`/weekly-exam/${exam.id}/leaderboard`}>
                            <Button className="h-14 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm font-semibold rounded-xl transition-all flex items-center gap-2">
                                <Trophy size={20} /> Classement
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
