import React, { useState } from 'react';
import axios from '../../utils/axios';
import { Button } from '../ui/Button';
import { Search, Check, X, AlertTriangle, Edit2, EyeOff } from 'lucide-react';
import QuestionForm from '../QuestionForm';

export default function SpellCheckView() {
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [ignoredWords, setIgnoredWords] = useState(new Set());

    const handleScan = async () => {
        setScanning(true);
        try {
            const res = await axios.get('/spell-check/scan');
            setResults(res.data);
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

    const handleEditSuccess = () => {
        setEditingQuestion(null);
        handleScan(); // Refresh results
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Vérification Orthographique</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Analysez la base de questions pour détecter les fautes de frappe.</p>
                    </div>
                    <Button onClick={handleScan} isLoading={scanning} icon={Search}>
                        Lancer l'analyse
                    </Button>
                </div>

                {results && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <AlertTriangle size={16} className="text-yellow-500" />
                            <span>{results.length} questions avec des fautes potentielles trouvées.</span>
                        </div>

                        {results.length === 0 && !scanning && (
                            <div className="text-center py-12 text-gray-500">
                                <Check size={48} className="mx-auto mb-4 text-green-500" />
                                <p>Aucune faute détectée !</p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {results.map(item => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="text-gray-900 dark:text-white font-medium mb-3">
                                                {item.text.split(/(\s+)/).map((part, i) => {
                                                    const cleanPart = part.trim().replace(/[.,;:!?()]/g, '');
                                                    const isTypo = item.typos.includes(cleanPart) && !ignoredWords.has(cleanPart.toLowerCase());
                                                    return isTypo ? (
                                                        <span key={i} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1 rounded border-b-2 border-red-500">
                                                            {part}
                                                        </span>
                                                    ) : part;
                                                })}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.typos.filter(w => !ignoredWords.has(w.toLowerCase())).map(word => (
                                                    <div key={word} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-md text-sm border border-red-100 dark:border-red-900/30">
                                                        <span>{word}</span>
                                                        <button
                                                            onClick={() => handleIgnore(word)}
                                                            className="hover:bg-red-100 dark:hover:bg-red-900/40 p-0.5 rounded transition-colors"
                                                            title="Ignorer ce mot"
                                                        >
                                                            <EyeOff size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            icon={Edit2}
                                            onClick={() => setEditingQuestion(item)}
                                        >
                                            Modifier
                                        </Button>
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
