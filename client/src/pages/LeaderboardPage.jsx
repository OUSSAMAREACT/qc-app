import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';

export default function LeaderboardPage() {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [id]);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`/weekly-exams/${id}/leaderboard`);
            setLeaderboard(res.data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    const getMedalColor = (index) => {
        switch (index) {
            case 0: return 'text-yellow-400';
            case 1: return 'text-gray-400';
            case 2: return 'text-amber-600';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Link to="/dashboard">
                    <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <ArrowLeft size={20} className="mr-2" /> Retour au tableau de bord
                    </Button>
                </Link>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                        <Trophy className="text-yellow-500" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Classement</h1>
                    <p className="text-gray-500 dark:text-gray-400">Top participants pour cet examen</p>
                </div>

                <Card className="overflow-hidden border-0 shadow-lg">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Chargement...</div>
                    ) : leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Aucun participant pour le moment.</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {leaderboard.map((entry, index) => (
                                <div key={entry.id} className={`p-4 flex items-center gap-4 ${index < 3 ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}>
                                    <div className={`font-bold text-lg w-8 text-center ${index < 3 ? getMedalColor(index) : 'text-gray-400'}`}>
                                        {index < 3 ? <Medal size={24} className="mx-auto" /> : `#${index + 1}`}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {entry.user.name || entry.user.email}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {entry.user.specialty || 'Général'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                            {entry.score} pts
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(entry.submittedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
