import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, Smartphone, Facebook, MessageCircle, Copy, CheckCircle, Upload, FileText, AlertCircle, Check, Crown, Zap, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PaymentPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState('1_YEAR'); // Default to best value
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');

    const plans = [
        {
            id: '1_MONTH',
            name: 'Sprint',
            duration: '1 Mois',
            price: '200 DH',
            icon: Zap,
            color: 'blue',
            features: ['Accès complet pendant 30 jours', 'Idéal pour les révisions de dernière minute']
        },
        {
            id: '3_MONTHS',
            name: 'Semestre',
            duration: '3 Mois',
            price: '500 DH',
            icon: Calendar,
            color: 'purple',
            features: ['Accès complet pendant 90 jours', 'Parfait pour un stage ou un module']
        },
        {
            id: '1_YEAR',
            name: 'Résidanat',
            duration: '1 An',
            price: '1500 DH',
            icon: Crown,
            color: 'orange',
            popular: true,
            features: ['Accès complet jusqu\'au concours', 'Tranquillité d\'esprit garantie', 'Support prioritaire']
        }
    ];

    const bankDetails = {
        bankName: "CIH BANK",
        rib: "230 330 3456789012345678 90",
        accountName: "M. Admin Name",
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Veuillez sélectionner un fichier.");
            return;
        }

        const formData = new FormData();
        formData.append('receipt', file);
        formData.append('planType', selectedPlan);

        setUploading(true);
        setError('');

        try {
            await axios.post('/payments/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadSuccess(true);
            setFile(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de l'envoi du reçu.");
        } finally {
            setUploading(false);
        }
    };

    const currentPlan = plans.find(p => p.id === selectedPlan);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 pb-20">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Choisissez votre formule
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Investissez dans votre réussite avec nos plans adaptés à votre rythme.
                    </p>
                </div>

                {/* Step 1: Select Plan */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isSelected = selectedPlan === plan.id;
                        return (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 border-2 ${isSelected
                                        ? `border-${plan.color}-500 bg-white dark:bg-gray-800 shadow-xl scale-105 z-10`
                                        : 'border-transparent bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                        Recommandé
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-2xl bg-${plan.color}-100 dark:bg-${plan.color}-900/30 text-${plan.color}-600 dark:text-${plan.color}-400 flex items-center justify-center mb-4`}>
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Check size={16} className={`text-${plan.color}-500 mt-0.5 shrink-0`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className={`w-full py-2 rounded-xl text-center font-bold transition-colors ${isSelected
                                        ? `bg-${plan.color}-500 text-white`
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {isSelected ? 'Sélectionné' : 'Choisir'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Step 2: Bank Details */}
                    <Card className="p-8 space-y-6 border-t-4 border-t-blue-600 h-fit">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">1</div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Effectuez le virement</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Banque</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-lg">{bankDetails.bankName}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 relative group">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">RIB</p>
                                <p className="font-mono font-bold text-xl text-gray-900 dark:text-white tracking-wider break-all">
                                    {bankDetails.rib}
                                </p>
                                <button
                                    onClick={() => handleCopy(bankDetails.rib)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white dark:bg-gray-700 rounded-lg shadow-sm opacity-0 group-hover:opacity-100"
                                    title="Copier le RIB"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nom du bénéficiaire</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-lg">{bankDetails.accountName}</p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                                <span className="text-blue-800 dark:text-blue-300 font-medium text-lg">Montant à régler</span>
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentPlan?.price}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Step 3: Upload Receipt */}
                    <Card className="p-8 space-y-6 border-t-4 border-t-green-500 h-fit">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xl">2</div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Envoyez le reçu</h2>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400">
                            Téléchargez une photo ou un PDF de votre virement pour le plan <strong>{currentPlan?.name}</strong>.
                        </p>

                        {uploadSuccess ? (
                            <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800 text-center space-y-4">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 animate-in zoom-in duration-300">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Reçu envoyé avec succès !</h3>
                                <p className="text-green-700 dark:text-green-400">
                                    Votre demande d'activation pour le plan <strong>{currentPlan?.name}</strong> est en cours de traitement. Vous recevrez une notification sous 24h.
                                </p>
                                <Button
                                    onClick={() => setUploadSuccess(false)}
                                    variant="outline"
                                    className="mt-2"
                                >
                                    Envoyer un autre reçu
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer relative bg-gray-50/50 dark:bg-gray-800/50">
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                                        {file ? (
                                            <>
                                                <FileText size={56} className="text-green-500" />
                                                <span className="font-bold text-gray-900 dark:text-white text-lg">{file.name}</span>
                                                <span className="text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={56} className="text-gray-400" />
                                                <span className="font-medium text-lg">Cliquez ou glissez votre fichier ici</span>
                                                <span className="text-sm">Images (JPG, PNG) ou PDF</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm font-medium">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    className="w-full py-4 text-lg font-bold shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {uploading ? 'Envoi en cours...' : 'Confirmer et Envoyer'}
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="text-center pt-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Des questions ? Notre équipe est là pour vous aider.
                    </p>
                    <a
                        href="https://wa.me/212600000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#20bd5a] font-bold text-lg transition-colors bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm hover:shadow-md"
                    >
                        <MessageCircle size={24} />
                        Contacter le Support WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
