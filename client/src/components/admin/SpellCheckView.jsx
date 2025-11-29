import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Search, Check, X, AlertTriangle, Edit2, EyeOff, Wand2, CheckCircle } from 'lucide-react';
import QuestionForm from '../QuestionForm';

export default function SpellCheckView() {
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [ignoredWords, setIgnoredWords] = useState(new Set());
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const handleScan = async () => {
        setScanning(true);
        setResults([]); // Clear previous results
        setProgress({ current: 0, total: 0 });

        try {
            // 1. Get total count
            const countRes = await axios.get('/spell-check/count');
            const total = countRes.data.count;
            setProgress({ current: 0, total });

            if (total === 0) {
                setScanning(false);
                return;
            }

            // 2. Loop through batches
            const take = 5; // Small batch size to avoid timeout
            let allResults = [];

            for (let skip = 0; skip < total; skip += take) {
                // Check if user cancelled (optional, but good for UX if we add a cancel button)
                // For now, just proceed.

                const res = await axios.get(`/spell-check/scan?skip=${skip}&take=${take}`);
                const batchResults = res.data;

                if (batchResults.length > 0) {
                    allResults = [...allResults, ...batchResults];
                    // Update results in real-time
                    setResults(prev => [...(prev || []), ...batchResults]);
                }

                // Update progress
                setProgress(prev => ({ ...prev, current: Math.min(skip + take, total) }));
            }

        } catch (error) {
            console.error("Scan failed", error);
            alert("Erreur lors de l'analyse");
        } finally {
            setScanning(false);
        }
    };

    const handleIgnore = async (word) => {
        try {
            await axios.post('/spell-check/ignore', { word });
            setIgnoredWords(prev => new Set(prev).add(word));
        } catch (error) {
            console.error("Failed to ignore word", error);
        }
    };

    const handleApplyCorrection = async (questionId, original, correction) => {
        try {
            const question = results.find(q => q.id === questionId);
            if (!question) return;

            // Replace the word in the text (case insensitive but preserving original case if possible, 
            // but here we usually want the correction's case)
            // Replace the word in the text
            let newText;
            if (original === question.text) {
                // Full replacement (Academic Style)
                newText = correction;
            } else {
                // Word replacement
                newText = question.text.replace(new RegExp(original, 'gi'), correction);
            }

            await axios.put(`/questions/${questionId}`, {
                ...question,
                text: newText
            });

            // Update local state
            setResults(prev => prev.map(q => {
                if (q.id === questionId) {
                    // Remove the applied correction from the list
                    const newCorrections = q.corrections.filter(c => c.original !== original);
                    return {
                        ...q,
                        text: newText,
                        corrections: newCorrections
                    };
                }
                return q;
            }).filter(q => q.corrections && q.corrections.length > 0)); // Remove if no more corrections

        } catch (error) {
            console.error("Failed to apply correction", error);
            alert("Erreur lors de la correction");
        }
    };

    const handleEditSuccess = () => {
        setEditingQuestion(null);
        handleScan(); // Refresh results
    };

    // Render Progress Bar
    const renderProgressBar = () => {
        if (!scanning && progress.total === 0) return null;

        const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

        return (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${percentage}%` }}
                ></div>
                <div className="text-xs text-center mt-1 text-gray-500">
                    {progress.current} / {progress.total} questions analysées ({percentage}%)
                </div>
            </div>
        );
    };

    if (editingQuestion) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier la question</h2>
                    <Button variant="outline" onClick={() => setEditingQuestion(null)}>Annuler</Button>
                </div>
                <QuestionForm
                    initialData={editingQuestion}
                    onSubmit={handleEditSuccess}
                    onCancel={() => setEditingQuestion(null)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Correction Assistée par IA</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Analysez la base de questions avec Gemini 2.5 Pro pour détecter et corriger les fautes.</p>
                    </div>
                    <Button onClick={handleScan} isLoading={scanning} icon={Search} disabled={scanning}>
                        {scanning ? 'Analyse en cours...' : "Lancer l'analyse IA"}
                    </Button>
                </div>

                {scanning && renderProgressBar()}

                {results && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <Wand2 size={16} className="text-blue-500" />
                            <span>{results.length} questions avec des suggestions de correction.</span>
                        </div>

                        {results.length === 0 && !scanning && (
                            <div className="text-center py-12 text-gray-500">
                                <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                                <p>Aucune faute détectée par l'IA !</p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {results.map(item => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors shadow-sm">
                                    <div className="flex flex-col gap-4">
                                        {/* Original Text with Highlights */}
                                        <div className="text-gray-900 dark:text-white text-lg leading-relaxed">
                                            {item.text.split(/(\s+)/).map((part, i) => {
                                                const cleanPart = part.trim().replace(/[.,;:!?()]/g, '');
                                                const correction = item.corrections?.find(c => c.original.toLowerCase() === cleanPart.toLowerCase());

                                                return correction ? (
                                                    <span key={i} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1 rounded border-b-2 border-red-500 font-medium" title={`Suggestion: ${correction.correction}`}>
                                                        {part}
                                                    </span>
                                                ) : part;
                                            })}
                                        </div>

                                        {/* Suggestions Area */}
                                        {item.corrections && item.corrections.length > 0 && (
                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Wand2 size={14} /> Suggestions de correction
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {item.corrections.map((corr, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-red-500 line-through">{corr.original}</span>
                                                                <span className="text-sm font-bold text-green-600 dark:text-green-400">{corr.correction}</span>
                                                            </div>
                                                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                                                            <button
                                                                onClick={() => handleApplyCorrection(item.id, corr.original, corr.correction)}
                                                                className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
                                                                title="Appliquer la correction"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleIgnore(corr.original)}
                                                                className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
                                                                title="Ignorer"
                                                            >
                                                                <EyeOff size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Explanation / Critique */}
                                        {item.critique && (
                                            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg flex gap-2">
                                                <Wand2 size={16} className="shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold">Note IA:</span> {item.critique}
                                                </div>
                                            </div>
                                        )}

                                        {/* Academic Style Suggestion */}
                                        {item.improved_text && (
                                            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
                                                <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Wand2 size={14} /> Suggestion Académique
                                                </h4>
                                                <p className="text-gray-800 dark:text-gray-200 italic mb-3">
                                                    "{item.improved_text}"
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="w-full sm:w-auto bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300"
                                                    onClick={() => {
                                                        // Apply full text replacement
                                                        handleApplyCorrection(item.id, item.text, item.improved_text); // Hack: treat whole text as "original" to replace
                                                    }}
                                                >
                                                    Remplacer tout le texte
                                                </Button>
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                icon={Edit2}
                                                onClick={() => setEditingQuestion(item)}
                                            >
                                                Modifier manuellement
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
