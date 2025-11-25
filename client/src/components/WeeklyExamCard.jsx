import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Trophy, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function WeeklyExamCard({ exam }) {
    if (!exam) return null;

    const isSubmitted = exam.isSubmitted;
    const now = new Date();
    const endDate = new Date(exam.endDate);
    const timeLeft = Math.max(0, endDate - now);
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Trophy className="text-yellow-300" size={24} />
                    </div>
                    <div className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <Clock size={12} />
                        {daysLeft}j {hoursLeft}h restants
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-1">Examen de la semaine (Partie Commune)</h3>
                <p className="text-indigo-100 text-sm mb-4">{exam.title}</p>

                {isSubmitted ? (
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="text-green-400" size={20} />
                            <span className="font-bold">Déjà participé</span>
                        </div>
                        <p className="text-sm opacity-80">
                            Votre score: <span className="font-bold text-white">{exam.userScore} / {exam.questions.length}</span>
                        </p>
                        <Link to={`/weekly-exam/${exam.id}/leaderboard`}>
                            <Button variant="ghost" size="sm" className="mt-2 w-full text-white hover:bg-white/20 justify-center">
                                Voir le classement
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link to={`/weekly-exam/${exam.id}`} className="flex-1">
                            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-0">
                                Participer maintenant
                            </Button>
                        </Link>
                        <Link to={`/weekly-exam/${exam.id}/leaderboard`}>
                            <Button className="bg-white/20 text-white hover:bg-white/30 border-0 px-3">
                                <Trophy size={20} />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-purple-500/30 rounded-full blur-xl"></div>
        </div>
    );
}
