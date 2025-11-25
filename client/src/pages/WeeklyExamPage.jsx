import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function WeeklyExamPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // { questionId: choiceId }
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchExam();
    }, [id]);

    const fetchExam = async () => {
        try {
            const res = await axios.get('/weekly-exams/active');
            // Verify if the fetched exam matches the ID in URL, or just use the active one
            if (res.data && res.data.id === parseInt(id)) {
                setExam(res.data);
            } else {
                // Handle case where URL ID doesn't match active exam
                // For now, just set it if it exists
                setExam(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch exam", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, choiceId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: choiceId
        }));
    };

    const handleSubmit = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir soumettre vos réponses ? Vous ne pourrez plus les modifier.")) {
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/weekly-exams/submit', {
                examId: exam.id,
                answers
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to submit exam", error);
            alert("Erreur lors de la soumission. Veuillez réessayer.");
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (!exam) return <div className="p-8 text-center">Aucun examen trouvé.</div>;
    if (exam.isSubmitted) return <div className="p-8 text-center">Vous avez déjà participé à cet examen.</div>;

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = exam.questions.length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{exam.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full flex items-center gap-2">
                            <Clock size={14} /> Fin: {new Date(exam.endDate).toLocaleString()}
                        </span>
                        <span className="text-gray-500">
                            {answeredCount} / {totalQuestions} répondues
                        </span>
                    </div>
                </div>

                <div className="space-y-8">
                    {exam.questions.map((q, index) => (
                        <Card key={q.id} className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                <span className="text-gray-400 mr-2">{index + 1}.</span>
                                {q.text}
                            </h3>
                            <div className="space-y-3">
                                {q.choices.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => handleOptionSelect(q.id, c.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${answers[q.id] === c.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[q.id] === c.id
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {answers[q.id] === c.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300">{c.text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg shadow-blue-500/20"
                    >
                        {submitting ? 'Envoi...' : 'Soumettre mes réponses'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
