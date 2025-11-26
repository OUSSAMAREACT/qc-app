import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, Smartphone, Facebook, MessageCircle, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PaymentPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const bankDetails = {
        bankName: "CIH BANK",
        rib: "230 330 3456789012345678 90",
        accountName: "M. Admin Name",
        amount: "200 DH"
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        Finalisez votre inscription
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Votre compte est actuellement <span className="font-semibold text-yellow-600 dark:text-yellow-500">en attente</span>.
                        Pour activer votre accès complet, veuillez effectuer le paiement.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Bank Transfer Details */}
                    <Card className="p-6 space-y-6 border-t-4 border-t-blue-600">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                <CreditCard size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Virement Bancaire</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Banque</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{bankDetails.bankName}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">RIB</p>
                                <p className="font-mono font-bold text-lg text-gray-900 dark:text-white tracking-wider">
                                    {bankDetails.rib}
                                </p>
                                <button
                                    onClick={() => handleCopy(bankDetails.rib)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Copier le RIB"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nom du bénéficiaire</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{bankDetails.accountName}</p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                                <span className="text-blue-800 dark:text-blue-300 font-medium">Montant à régler</span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bankDetails.amount}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Contact & Proof */}
                    <div className="space-y-8">
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                    <CheckCircle size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Envoyer la preuve</h2>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400">
                                Une fois le virement effectué, veuillez nous envoyer une photo du reçu via l'un des canaux suivants pour une activation rapide.
                            </p>

                            <div className="space-y-3">
                                <a
                                    href="https://wa.me/212600000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors border border-[#25D366]/20"
                                >
                                    <MessageCircle size={24} />
                                    <span className="font-semibold">WhatsApp</span>
                                </a>

                                <a
                                    href="https://facebook.com/page"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] transition-colors border border-[#1877F2]/20"
                                >
                                    <Facebook size={24} />
                                    <span className="font-semibold">Facebook Messenger</span>
                                </a>

                                <a
                                    href="tel:+212600000000"
                                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors border border-gray-200 dark:border-gray-700"
                                >
                                    <Smartphone size={24} />
                                    <span className="font-semibold">06 00 00 00 00</span>
                                </a>
                            </div>
                        </Card>

                        <div className="text-center">
                            <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                Se déconnecter
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
