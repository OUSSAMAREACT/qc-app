import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Save, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsManager() {
    const { token } = useAuth();
    const [examDate, setExamDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            if (window.location.protocol === 'https:' && apiUrl.startsWith('http:')) {
                apiUrl = apiUrl.replace('http:', 'https:');
            }
            const response = await fetch(`${apiUrl}/settings`);
            if (response.ok) {
                const data = await response.json();
                if (data.examDate) {
                    // Format for input type="datetime-local"
                    const date = new Date(data.examDate);
                    const formatted = date.toISOString().slice(0, 16);
                    setExamDate(formatted);
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            if (window.location.protocol === 'https:' && apiUrl.startsWith('http:')) {
                apiUrl = apiUrl.replace('http:', 'https:');
            }

            const response = await fetch(`${apiUrl}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    key: 'examDate',
                    value: new Date(examDate).toISOString()
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Date de l\'examen mise à jour !' });
            } else {
                setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur de connexion.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Chargement...</div>;

    return (
        <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuration de l'Examen</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de l'examen national
                    </label>
                    <input
                        type="datetime-local"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {saving ? <Loader className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5 mr-2" /> Enregistrer</>}
                </Button>
            </div>
        </Card>
    );
}
