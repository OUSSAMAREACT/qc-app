import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Download, Info } from 'lucide-react';

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const result = location.state?.result;

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">Aucun résultat disponible.</p>
                <Button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
            </div>
        );
    }

    const { score, totalQuestions, percentage, details } = result;
    const category = location.state?.category;

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

    return (
        <div className="min-h-screen bg-purple-50 dark:bg-gray-900 p-6 font-sans transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Card */}
                <Card className="border-t-8 border-t-blue-600 shadow-md text-center py-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Résultats du Quiz</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Voyez comment vous avez performé</p>

                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                            {score} <span className="text-2xl text-gray-400 dark:text-gray-500 font-normal">/ {totalQuestions}</span>
                        </div>
                        <div className={`text-lg font-medium px-4 py-1 rounded-full ${percentage >= 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {percentage}% de réussite
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/dashboard">
                            <Button variant="secondary" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Tableau de bord</Button>
                        </Link>

                        <Button
                            onClick={generatePDF}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2"
                        >
                            <Download size={18} /> Télécharger PDF
                        </Button>

                        <Link to={category ? `/quiz?category=${encodeURIComponent(category)}` : '/quiz'}>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center">
                                <RefreshCw size={18} className="mr-2" /> Refaire ce Quiz
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Detailed Review */}
                <div className="space-y-4">
                    {details && details.map((detail, index) => {
                        const isCorrect = detail.isCorrect;
                        return (
                            <Card key={detail.questionId} className={`p-6 border-l-4 shadow-sm ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                {/* Question Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex-1">
                                        {index + 1}. {detail.questionText || "Question sans texte"}
                                    </h3>
                                    <div className="ml-4 flex-shrink-0">
                                        {isCorrect ? (
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                                <CheckCircle size={16} /> 1/1
                                            </span>
                                        ) : (
                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                                <XCircle size={16} /> 0/1
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Choices */}
                                <div className="space-y-3">
                                    {detail.choices && detail.choices.map((choice) => {
                                        const isSelected = detail.userSelectedIds?.includes(choice.id);
                                        const isChoiceCorrect = choice.isCorrect;

                                        // Visual styles for the choice row
                                        let rowClass = "flex items-center gap-3 p-3 rounded-md border transition-colors";
                                        if (isSelected) {
                                            rowClass += " bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
                                        } else {
                                            rowClass += " border-transparent hover:bg-gray-50 dark:hover:bg-gray-700";
                                        }

                                        return (
                                            <div key={choice.id} className={rowClass}>
                                                {/* Fake Radio/Checkbox */}
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-blue-600 dark:border-blue-400' : 'border-gray-400 dark:border-gray-500'}`}>
                                                    {isSelected && <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full" />}
                                                </div>

                                                <span className={`text-gray-800 dark:text-gray-200 flex-1 ${isSelected ? 'font-medium' : ''}`}>
                                                    {choice.text}
                                                </span>

                                                {/* Icons for specific choices */}
                                                {isChoiceCorrect && isSelected && <CheckCircle size={20} className="text-green-600 dark:text-green-400" />}
                                                {!isChoiceCorrect && isSelected && <XCircle size={20} className="text-red-600 dark:text-red-400" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Feedback Section for Incorrect Answers */}
                                {!isCorrect && (
                                    <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-100 dark:border-green-900/30">
                                        <h4 className="text-sm font-bold text-green-800 dark:text-green-400 mb-2">Bonne réponse :</h4>
                                        <div className="text-green-700 dark:text-green-300 text-sm font-medium">
                                            {detail.choices?.filter(c => c.isCorrect).map(c => c.text).join(', ') || "Réponse non disponible"}
                                        </div>
                                    </div>
                                )}

                                {/* Explanation Section */}
                                {detail.explanation && (
                                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-900/30">
                                        <div className="flex items-start gap-2">
                                            <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-1">Explication :</h4>
                                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                                    {detail.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
