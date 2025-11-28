import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Save, Loader, Upload, Search, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ImportQuestionsPage from '../../pages/ImportQuestionsPage';
import SpellCheckView from './SpellCheckView';

export default function SettingsManager() {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'Général', icon: Settings },
        { id: 'import', label: 'Importation', icon: Upload },
        { id: 'spell-check', label: 'Vérification Ortho', icon: Search },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all
                                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                                }
                            `}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'general' && <GeneralSettings token={token} user={user} />}
                {activeTab === 'import' && <ImportQuestionsPage />}
                {activeTab === 'spell-check' && <SpellCheckView />}
            </div>
        </div>
    );
}

function GeneralSettings({ token, user }) {
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

                {user?.role === 'SUPER_ADMIN' ? (
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {saving ? <Loader className="animate-spin h-5 w-5" /> : <><Save className="h-5 w-5 mr-2" /> Enregistrer</>}
                    </Button>
                ) : (
                    <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm text-center">
                        Seul le Super Admin peut modifier ces paramètres.
                    </div>
                )}
            </div>
        </Card>
    );
}
