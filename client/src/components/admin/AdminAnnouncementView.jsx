import React, { useState } from 'react';
import { Send, Mail, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function AdminAnnouncementView() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('BOTH'); // 'EMAIL', 'IN_APP', 'BOTH'
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !message) {
            setStatus({ type: 'error', message: 'Veuillez remplir tous les champs.' });
            return;
        }

        if (!confirm("Êtes-vous sûr de vouloir envoyer cette annonce à TOUS les utilisateurs actifs ?")) {
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await axios.post('/notifications/broadcast', {
                subject,
                message,
                type
            });
            setStatus({ type: 'success', message: res.data.message });
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error("Broadcast error:", error);
            setStatus({ type: 'error', message: "Erreur lors de l'envoi de l'annonce." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                        <Send size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Faire une Annonce</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Envoyer un message à tous les utilisateurs actifs</p>
                    </div>
                </div>

                {status.message && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${status.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Channel Selection */}
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('EMAIL')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'EMAIL'
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                }`}
                        >
                            <Mail size={24} />
                            <span className="font-medium">Email Uniquement</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('IN_APP')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'IN_APP'
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                }`}
                        >
                            <Bell size={24} />
                            <span className="font-medium">Notification App</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('BOTH')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'BOTH'
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                }`}
                        >
                            <div className="flex gap-1">
                                <Mail size={20} />
                                <Bell size={20} />
                            </div>
                            <span className="font-medium">Les Deux</span>
                        </button>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sujet / Titre
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="Ex: Nouveau concours blanc disponible !"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Message (HTML supporté pour les emails)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="Écrivez votre message ici..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Note : Pour les notifications In-App, seul le sujet est affiché comme message court. Le corps du message est envoyé par email.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={20} />
                                Envoyer l'annonce
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
