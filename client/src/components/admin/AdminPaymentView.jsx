import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, FileText, ExternalLink, Clock, User, AlertCircle } from 'lucide-react';

export default function AdminPaymentView() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await axios.get('/payments?status=PENDING');
            setPayments(res.data);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement des paiements.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir approuver ce paiement ? L'utilisateur passera en PREMIUM.")) return;

        setActionLoading(id);
        try {
            await axios.put(`/payments/${id}/approve`);
            setPayments(payments.filter(p => p.id !== id));
            // Optional: Show success toast
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'approbation.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir rejeter ce paiement ?")) return;

        setActionLoading(id);
        try {
            await axios.put(`/payments/${id}/reject`);
            setPayments(payments.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            alert("Erreur lors du rejet.");
        } finally {
            setActionLoading(null);
        }
    };

    const getPlanLabel = (planType) => {
        switch (planType) {
            case '1_MONTH': return 'Sprint (1 Mois)';
            case '3_MONTHS': return 'Semestre (3 Mois)';
            case '1_YEAR': return 'Annuel (1 An)';
            default: return 'Inconnu';
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vérification des Paiements</h2>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {payments.length} en attente
                </span>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {payments.length === 0 ? (
                <Card className="p-12 text-center text-gray-500 dark:text-gray-400">
                    <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">Aucun paiement en attente.</p>
                    <p>Tout est à jour !</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {payments.map((payment) => (
                        <Card key={payment.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-l-4 border-l-yellow-500">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
                                    <User size={20} className="text-gray-500" />
                                    {payment.user.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {payment.user.email} • {payment.user.role}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded w-fit">
                                    <Clock size={14} />
                                    Plan : {getPlanLabel(payment.planType)}
                                </div>
                                <div className="text-xs text-gray-400">
                                    Reçu le {new Date(payment.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <a
                                    href={`${import.meta.env.VITE_API_URL}${payment.receiptUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto justify-center"
                                >
                                    <FileText size={18} />
                                    Voir le Reçu
                                    <ExternalLink size={14} />
                                </a>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        onClick={() => handleReject(payment.id)}
                                        disabled={actionLoading === payment.id}
                                        className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex-1 sm:flex-none"
                                    >
                                        <XCircle size={18} className="mr-2" />
                                        Rejeter
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(payment.id)}
                                        disabled={actionLoading === payment.id}
                                        className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                                    >
                                        <CheckCircle size={18} className="mr-2" />
                                        Approuver
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
