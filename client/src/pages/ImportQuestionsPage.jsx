import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Check, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const ImportQuestionsPage = () => {
    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setAnalysis(null);
        setError(null);
        setSuccess(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Call API without commit=true to get preview
            const res = await axios.post('/import/csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAnalysis(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'analyse du fichier");
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Call API with commit=true to save
            const res = await axios.post('/import/csv?commit=true', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(`Succès ! ${res.data.count} questions importées.`);
            setAnalysis(null);
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'importation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <SEO
                title="Importer des Questions"
                description="Outil d'importation de questions pour les administrateurs."
                url="/import"
                robots="noindex, nofollow"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Importer des Questions (CSV / JSON)</h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 transition-colors hover:border-primary-500 dark:hover:border-primary-400 bg-gray-50 dark:bg-gray-800/50">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">Glissez votre fichier CSV ou JSON ici</p>
                    <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
                    />
                </div>

                {file && !analysis && !success && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
                        >
                            {loading ? <Loader className="animate-spin" /> : <FileText size={20} />}
                            Analyser le fichier
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
                        <AlertCircle size={24} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-3">
                        <Check size={24} />
                        {success}
                    </div>
                )}
            </div>

            {analysis && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aperçu de l'importation</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Source: <span className="font-semibold text-primary-600">{analysis.source || 'CSV'}</span>
                                {analysis.referenceStudent && (
                                    <span> | Référence: <span className="font-semibold">{analysis.referenceStudent}</span> (Score: {analysis.score})</span>
                                )}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                                Questions détectées: <span className="font-semibold">{analysis.questionsFound}</span>
                            </p>
                        </div>
                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
                        >
                            {loading ? <Loader className="animate-spin" /> : <Check size={20} />}
                            Confirmer l'importation
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Question</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Réponse Correcte (Référence)</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Choix Détectés</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {analysis.preview.slice(0, 10).map((q, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200 max-w-md truncate" title={q.text}>{q.text}</td>
                                        <td className="py-3 px-4 text-green-600 dark:text-green-400 font-medium">
                                            {q.choices.find(c => c.isCorrect)?.text || "Non trouvé"}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                                            {q.choices.map(c => c.text).join(', ')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {analysis.preview.length > 10 && (
                            <p className="text-center text-gray-500 mt-4 italic">...et {analysis.preview.length - 10} autres questions</p>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ImportQuestionsPage;
