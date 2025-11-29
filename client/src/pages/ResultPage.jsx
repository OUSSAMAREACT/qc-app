import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Download, Info, MessageCircle, Trophy, Target, Calendar, Lightbulb, BookOpen } from 'lucide-react';


import CommentsSheet from '../components/CommentsSheet';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Modal } from '../components/ui/Modal';
import SEO from '../components/SEO';
import FormattedText from '../components/FormattedText';

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const result = location.state?.result;
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    // AI Tutor State
    const [aiExplanation, setAiExplanation] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [selectedQuestionForAI, setSelectedQuestionForAI] = useState(null);

    const openComments = (questionId, questionText) => {
        setSelectedQuestion({ id: questionId, text: questionText });
        setCommentsOpen(true);
    };

    const handleExplainAI = async (questionDetail) => {
        // Construct a question object similar to what WeeklyExam expects
        // detail has: questionId, questionText, choices, userSelectedIds, isCorrect, explanation
        const questionObj = {
            id: questionDetail.questionId,
            text: questionDetail.questionText,
            choices: questionDetail.choices
        };

        setSelectedQuestionForAI(questionObj);
        setAiModalOpen(true);
        setAiLoading(true);
        setAiExplanation(null);

        try {
            const userChoiceIds = questionDetail.userSelectedIds || [];
            // Find text for user's answer
            const userChoiceText = questionDetail.choices
                .filter(c => userChoiceIds.includes(c.id))
                .map(c => c.text)
                .join(", ") || "Aucune réponse";

            const correctChoiceText = questionDetail.choices
                .filter(c => c.isCorrect)
                .map(c => c.text)
                .join(", ");

            const res = await axios.post('/ai-tutor/explain', {
                questionText: questionDetail.questionText,
                userAnswer: userChoiceText,
                correctAnswer: correctChoiceText,
                choices: questionDetail.choices,
                userName: user?.name || "Candidat",
                category: category || null // Pass category from location state
            });

            setAiExplanation(res.data.explanation);
        } catch (err) {
            console.error("AI Tutor Error:", err);
            setAiExplanation("Désolé, je n'ai pas pu générer d'explication pour le moment. Vérifiez que la Base Documentaire contient des documents pertinents.");
        } finally {
            setAiLoading(false);
        }
    };

    const [loadingQuestion, setLoadingQuestion] = useState(false);

    // Handle direct access via notification (URL query param)
    const queryParams = new URLSearchParams(location.search);
    const questionIdParam = queryParams.get('questionId');

    React.useEffect(() => {
        if (!result && questionIdParam) {
            fetchQuestion(questionIdParam);
        }
    }, [result, questionIdParam]);

    const fetchQuestion = async (id) => {
        setLoadingQuestion(true);
        try {
            const res = await axios.get(`/questions/${id}`);
            setSelectedQuestion(res.data);
            setCommentsOpen(true); // Auto open comments
        } catch (error) {
            console.error("Failed to fetch question", error);
        } finally {
            setLoadingQuestion(false);
        }
    };

    if (!result && !questionIdParam) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
                <SEO
                    title="Résultats du Quiz"
                    description="Consultez vos résultats de quiz sur QCMEchelle11."
                    url="/result"
                    robots="noindex, nofollow"
                />
                <p className="text-gray-500">Aucun résultat disponible.</p>
                <Button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
            </div>
        );
    }

    // If loading question
    if (loadingQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If showing single question (Discussion Mode)
    if (!result && selectedQuestion) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans">
                <SEO
                    title={`Discussion - Question ${selectedQuestion.id}`}
                    description="Participez à la discussion sur cette question."
                    url={`/result?questionId=${selectedQuestion.id}`}
                />
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <Button onClick={() => navigate('/dashboard')} variant="secondary">
                            <ArrowRight className="rotate-180 mr-2" size={16} /> Retour
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discussion</h1>
                    </div>

                    <Card className="p-8 shadow-xl border-0">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            {selectedQuestion.text}
                        </h3>
                        <div className="flex justify-center">
                            <Button
                                onClick={() => setCommentsOpen(true)}
                                className="bg-blue-600 text-white rounded-xl flex items-center gap-2"
                            >
                                <MessageCircle size={20} /> Voir la discussion
                            </Button>
                        </div>
                    </Card>
                </div>
                <CommentsSheet
                    isOpen={commentsOpen}
                    onClose={() => {
                        setCommentsOpen(false);
                        // Optional: navigate back if they close? No, let them stay.
                    }}
                    questionId={selectedQuestion.id}
                    questionText={selectedQuestion.text}
                />
            </div>
        );
    }

    // Fallback loading state if result is null (e.g. waiting for fetchQuestion)
    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { score, totalQuestions, percentage, details } = result;
    const category = location.state?.category;

    // Circular Progress Calculation
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const generatePDF = () => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(41, 128, 185); // Blue
            doc.text("QCM Echelle 11", 105, 20, { align: "center" });

            doc.setFontSize(16);
            doc.setTextColor(44, 62, 80); // Dark Gray
            doc.text(`Résultats du Quiz: ${category || "Général"}`, 105, 30, { align: "center" });

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Candidat: ${user?.name || "Anonyme"}`, 105, 40, { align: "center" });
            doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 105, 48, { align: "center" });

            // Score Circle
            doc.setDrawColor(200);
            doc.setFillColor(245, 247, 250);
            doc.circle(105, 65, 15, 'FD');
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text(`${score}/${totalQuestions}`, 105, 67, { align: "center" });

            doc.setFontSize(12);
            if (percentage >= 50) {
                doc.setTextColor(39, 174, 96); // Green
                doc.text("Réussite", 105, 85, { align: "center" });
            } else {
                doc.setTextColor(192, 57, 43); // Red
                doc.text("Échec", 105, 85, { align: "center" });
            }

            // Table
            const tableColumn = ["#", "Question", "Votre Réponse", "Correction"];
            const tableRows = [];

            if (details && Array.isArray(details)) {
                details.forEach((detail, index) => {
                    const questionText = detail.questionText || "Question";

                    // Format user answers
                    const userAnswers = detail.choices
                        .filter(c => detail.userSelectedIds?.includes(c.id))
                        .map(c => c.text)
                        .join(", ") || "Aucune réponse";

                    // Format correct answers
                    const correctAnswers = detail.choices
                        .filter(c => c.isCorrect)
                        .map(c => c.text)
                        .join(", ");

                    tableRows.push([
                        index + 1,
                        questionText,
                        userAnswers,
                        detail.isCorrect ? "" : correctAnswers
                    ]);
                });
            }

            autoTable(doc, {
                startY: 95,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 10, cellPadding: 3, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 80 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 50 }
                },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index === 2) {
                        const rowIndex = data.row.index;
                        if (details && details[rowIndex]) {
                            const isCorrect = details[rowIndex].isCorrect;
                            if (isCorrect) {
                                data.cell.styles.textColor = [39, 174, 96];
                            } else {
                                data.cell.styles.textColor = [192, 57, 43];
                            }
                        }
                    }
                }
            });

            doc.save(`resultat_quiz_${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert(`Erreur PDF: ${error.message}`);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300">
            <SEO
                title={`Résultats - ${category || "Quiz"}`}
                description={`Vous avez obtenu ${score}/${totalQuestions} au quiz ${category || ""}.`}
                url="/result"
                robots="noindex, nofollow"
            />
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section with Glassmorphism */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700 shadow-2xl p-6 md:p-12 text-center"
                >
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">

                        {/* Score Circle */}
                        <div className="relative w-48 h-48 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-gray-100 dark:text-gray-700"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`transition-all duration-1000 ease-out ${percentage >= 50 ? 'text-emerald-500' : 'text-red-500'}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${percentage >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {percentage}%
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Réussite</span>
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-left space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {percentage >= 50 ? "Félicitations ! 🎉" : "Courage ! 💪"}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 text-lg">
                                    Vous avez obtenu <span className="font-bold text-gray-900 dark:text-white">{score}</span> sur <span className="font-bold text-gray-900 dark:text-white">{totalQuestions}</span> questions correctes.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
                                    <Target size={16} />
                                    {category || "Général"}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium">
                                    <Calendar size={16} />
                                    {new Date().toLocaleDateString('fr-FR')}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-4">
                                <Link to="/dashboard">
                                    <Button variant="secondary" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-xl">
                                        Tableau de bord
                                    </Button>
                                </Link>
                                <Button
                                    onClick={generatePDF}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 rounded-xl flex items-center gap-2"
                                >
                                    <Download size={18} /> PDF
                                </Button>
                                <Link to={category ? `/quiz?category=${encodeURIComponent(category)}` : '/quiz'}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 rounded-xl flex items-center gap-2">
                                        <RefreshCw size={18} /> Refaire
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Detailed Review List */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white px-2">Détails des réponses</h2>

                    {details && details.map((detail, index) => {
                        const isCorrect = detail.isCorrect;
                        return (
                            <motion.div variants={itemVariants} key={detail.questionId}>
                                <Card className={`overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${isCorrect
                                    ? 'shadow-emerald-100 dark:shadow-emerald-900/10'
                                    : 'shadow-red-100 dark:shadow-red-900/10'
                                    }`}>
                                    {/* Status Bar */}
                                    <div className={`h-1.5 w-full ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />

                                    <div className="p-4 md:p-8">
                                        {/* Question Header */}
                                        <div className="flex justify-between items-start gap-4 mb-6">
                                            <div className="flex gap-4">
                                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug">
                                                    {detail.questionText || "Question sans texte"}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openComments(detail.questionId, detail.questionText)}
                                                    className="p-2.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                                                    title="Discussion & Commentaires"
                                                >
                                                    <MessageCircle size={20} />
                                                </button>
                                                {isCorrect ? (
                                                    <div className="hidden md:flex bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold items-center gap-1.5">
                                                        <CheckCircle size={16} /> Correct
                                                    </div>
                                                ) : (
                                                    <div className="hidden md:flex bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold items-center gap-1.5">
                                                        <XCircle size={16} /> Incorrect
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Choices */}
                                        <div className="space-y-3 pl-0 md:pl-12">
                                            {detail.choices && detail.choices.map((choice) => {
                                                const isSelected = detail.userSelectedIds?.includes(choice.id);
                                                const isChoiceCorrect = choice.isCorrect;

                                                // Visual styles for the choice row
                                                let rowClass = "relative flex items-center gap-4 p-3 rounded-xl border-2 transition-all duration-200";

                                                if (isChoiceCorrect) {
                                                    rowClass += " border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10";
                                                } else if (isSelected && !isChoiceCorrect) {
                                                    rowClass += " border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10";
                                                } else {
                                                    rowClass += " border-transparent bg-gray-50 dark:bg-gray-800/50";
                                                }

                                                return (
                                                    <div key={choice.id} className={rowClass}>
                                                        {/* Icon Indicator */}
                                                        <div className="flex-shrink-0">
                                                            {isChoiceCorrect ? (
                                                                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                                                            ) : isSelected && !isChoiceCorrect ? (
                                                                <XCircle size={20} className="text-red-600 dark:text-red-400" />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                                            )}
                                                        </div>

                                                        <span className={`flex-1 text-sm md:text-base ${isChoiceCorrect ? 'font-medium text-emerald-900 dark:text-emerald-200' :
                                                            isSelected ? 'font-medium text-red-900 dark:text-red-200' :
                                                                'text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                            {choice.text}
                                                        </span>

                                                        {isSelected && (
                                                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/50 dark:bg-black/20 text-gray-500">
                                                                Votre choix
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Explanation Section */}
                                        <div className="flex flex-col sm:flex-row gap-4 mt-6 ml-0 md:ml-12">
                                            {detail.explanation && (
                                                <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                                                    <Info size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                        <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm uppercase tracking-wide sticky top-0 bg-blue-50 dark:bg-blue-900/10 pb-1 z-10">Explication</h4>
                                                        <FormattedText text={detail.explanation} />
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                variant="outline"
                                                onClick={() => handleExplainAI(detail)}
                                                className="self-start bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:shadow-md transition-all"
                                            >
                                                <Lightbulb size={18} className="mr-2 text-purple-500" />
                                                Explication
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            <CommentsSheet
                isOpen={commentsOpen}
                onClose={() => setCommentsOpen(false)}
                questionId={selectedQuestion?.id}
                questionText={selectedQuestion?.text}
            />

            <Modal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <BookOpen size={24} />
                        <span>Explication (Basé sur les documents officiels)</span>
                    </div>
                }
            >
                <div className="space-y-4">
                    {aiLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 animate-pulse">Analyse des documents officiels en cours...</p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 mb-4">
                                <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                                    <Lightbulb size={16} /> Explication Personnalisée
                                </h4>
                                <div className="text-gray-700 dark:text-gray-300">
                                    <FormattedText text={aiExplanation} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={() => setAiModalOpen(false)}>Fermer</Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
