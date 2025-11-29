import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminDataIntegrityView() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchBrokenQuestions = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/debug/questions/no-choices');
            setQuestions(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching broken questions:", err);
            setError("Impossible de charger les questions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrokenQuestions();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette question ?")) return;
        try {
            await axios.delete(`/debug/questions/no-choices/${id}`);
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (err) {
            alert("Erreur lors de la suppression.");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Supprimer TOUTES les ${questions.length} questions sans réponses ? Cette action est irréversible.`)) return;
        setDeleting(true);
        try {
            const res = await axios.delete('/debug/questions/no-choices');
            alert(res.data.message);
            fetchBrokenQuestions();
        } catch (err) {
            alert("Erreur lors de la suppression de masse.");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Analyse de la base de données...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="text-orange-500" /> Intégrité des Données
                    </h2>
                    <p className="text-sm text-gray-500">Détecte les questions importées sans choix de réponse.</p>
                </div>
                <Button onClick={fetchBrokenQuestions} variant="outline" size="sm">
                    <RefreshCw size={16} className="mr-2" /> Actualiser
                </Button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            {questions.length === 0 ? (
                <div className="p-12 text-center bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-bold text-green-700 dark:text-green-300">Tout est propre !</h3>
                    <p className="text-green-600 dark:text-green-400">Aucune question sans réponse détectée.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-orange-50 dark:bg-orange-900/10">
                        <span className="font-bold text-orange-700 dark:text-orange-300">
                            {questions.length} questions problématiques trouvées
                        </span>
                        <Button
                            onClick={handleBulkDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 size={16} className="mr-2" /> Tout Supprimer
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Question</th>
                                    <th className="px-6 py-3">Catégorie</th>
                                    <th className="px-6 py-3">Spécialité</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {questions.map(q => (
                                    <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{q.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-md truncate" title={q.text}>
                                            {q.text}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{q.category?.name || '-'}</td>
                                        <td className="px-6 py-4 text-gray-500">{q.specialty?.name || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
