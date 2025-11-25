import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Trophy, ArrowLeft, Medal, Crown, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [examTitle, setExamTitle] = useState('');

    useEffect(() => {
        fetchLeaderboard();
    }, [id]);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`/weekly-exams/${id}/leaderboard`);
            setLeaderboard(res.data);
            // Assuming the API returns the exam title in the first entry or we fetch it separately
            // For now, we'll use a generic title or extract if available
            if (res.data.length > 0 && res.data[0].examTitle) {
                setExamTitle(res.data[0].examTitle);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

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

    const PodiumStep = ({ entry, place }) => {
        if (!entry) return null;

        const isFirst = place === 1;
        const isSecond = place === 2;
        const isThird = place === 3;

        let heightClass = "h-32";
        let colorClass = "bg-gray-100";
        let iconColor = "text-gray-400";
        let borderColor = "border-gray-200";
        let shadowColor = "shadow-gray-200";

        if (isFirst) {
            heightClass = "h-48 md:h-64";
            colorClass = "bg-gradient-to-b from-yellow-300 to-yellow-500";
            iconColor = "text-yellow-600";
            borderColor = "border-yellow-400";
            shadowColor = "shadow-yellow-500/50";
        } else if (isSecond) {
            heightClass = "h-40 md:h-52";
            colorClass = "bg-gradient-to-b from-gray-300 to-gray-400";
            iconColor = "text-gray-600";
            borderColor = "border-gray-400";
            shadowColor = "shadow-gray-400/50";
        } else if (isThird) {
            heightClass = "h-36 md:h-44";
            colorClass = "bg-gradient-to-b from-amber-600 to-amber-700";
            iconColor = "text-amber-800";
            borderColor = "border-amber-600";
            shadowColor = "shadow-amber-600/50";
        }

        return (
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: place * 0.2, type: "spring", stiffness: 100 }}
                className={`flex flex-col items-center justify-end ${isFirst ? 'order-2 -mt-12 z-20' : isSecond ? 'order-1 z-10' : 'order-3 z-10'}`}
            >
                <div className="flex flex-col items-center mb-4 relative">
                    {isFirst && (
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-16 text-yellow-400 drop-shadow-lg"
                        >
                            <Crown size={48} fill="currentColor" />
                        </motion.div>
                    )}
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${borderColor} bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg overflow-hidden mb-2`}>
                        <span className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300">
                            {entry.user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="text-center">
                        <p className={`font-bold text-gray-900 dark:text-white ${isFirst ? 'text-lg md:text-xl' : 'text-base md:text-lg'}`}>
                            {entry.user.name}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm mt-1">
                            {entry.score} pts
                        </p>
                    </div>
                </div>
                <div className={`w-full ${heightClass} ${colorClass} rounded-t-2xl shadow-xl ${shadowColor} flex items-end justify-center pb-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10"></div>
                    <span className={`text-4xl md:text-6xl font-black text-white/30 drop-shadow-sm`}>
                        {place}
                    </span>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/80 dark:bg-gray-800/80">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Trophy className="text-yellow-500" size={24} /> Classement
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Examen Hebdomadaire</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-500">Chargement du classement...</p>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Trophy size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aucun participant</h3>
                        <p className="text-gray-500 dark:text-gray-400">Soyez le premier à participer !</p>
                        <Link to="/dashboard" className="mt-6 inline-block">
                            <Button variant="primary">Retour au tableau de bord</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Podium Section */}
                        <div className="flex justify-center items-end gap-4 md:gap-8 px-4 pt-10 pb-4 min-h-[300px]">
                            {leaderboard.length >= 2 && <PodiumStep entry={leaderboard[1]} place={2} />}
                            {leaderboard.length >= 1 && <PodiumStep entry={leaderboard[0]} place={1} />}
                            {leaderboard.length >= 3 && <PodiumStep entry={leaderboard[2]} place={3} />}
                        </div>

                        {/* List Section */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="text-primary-500" size={20} /> Tous les participants
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {leaderboard.map((entry, index) => (
                                    <motion.div
                                        variants={itemVariants}
                                        key={entry.id}
                                        className={`p-4 md:p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${index < 3 ? 'bg-yellow-50/10 dark:bg-yellow-900/5' : ''}`}
                                    >
                                        <div className="w-10 text-center font-bold text-gray-400 dark:text-gray-500 text-lg">
                                            {index < 3 ? (
                                                <Medal size={24} className={`mx-auto ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                                            ) : (
                                                `#${index + 1}`
                                            )}
                                        </div>

                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm md:text-base border border-gray-200 dark:border-gray-600">
                                            {entry.user.name?.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 dark:text-white truncate text-base md:text-lg">
                                                {entry.user.name}
                                            </div>
                                            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <User size={12} />
                                                {entry.user.specialty?.name || 'Étudiant'}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-bold text-primary-600 dark:text-primary-400 text-lg md:text-xl">
                                                {entry.score} <span className="text-sm text-gray-400 font-normal">pts</span>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(entry.submittedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
