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
            // First, get total count (approximate or just keep going until empty)
            // For now, we'll just loop until we get no results.
            // A better way would be to have a count endpoint, but let's keep it simple.

            let skip = 0;
            const take = 5; // Small batch size to avoid timeout
            let hasMore = true;
            let allResults = [];

            while (hasMore) {
                const res = await axios.get(`/spell-check/scan?skip=${skip}&take=${take}`);
                const batchResults = res.data;

                if (batchResults.length === 0 && skip > 0) {
                    // If we get 0 results after the first batch, we might be done.
                    // However, scanQuestions only returns questions WITH errors.
                    // So an empty array doesn't mean we ran out of questions, it means no errors in this batch.
                    // This logic is tricky without knowing the total question count.

                    // FIX: We need to know if we've processed all questions.
                    // The backend `scanQuestions` filters internally.
                    // We should probably change the backend to return { results: [], processedCount: n, totalQuestions: N }
                    // BUT, to avoid changing the backend return structure too much right now:
                    // Let's just assume a max reasonable number of questions for now (e.g. 2000) 
                    // OR better: Add a `count` endpoint.
                }

                {
                    results.length === 0 && !scanning && (
                        <div className="text-center py-12 text-gray-500">
                            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                            <p>Aucune faute détectée par l'IA !</p>
                        </div>
                    )
                }

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

                                {/* AI Explanation */}
                                {item.suggestion && (
                                    <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
                                        <span className="font-bold">Note IA:</span> {item.suggestion}
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
                    </div >
                )
}
            </div >
        </div >
    );
}
