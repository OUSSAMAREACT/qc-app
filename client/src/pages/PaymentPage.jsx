import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, Smartphone, Facebook, MessageCircle, Copy, CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PaymentPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');

    const bankDetails = {
        bankName: "CIH BANK",
        rib: "230 330 3456789012345678 90",
        accountName: "M. Admin Name",
        amount: "200 DH"
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        Passez au Premium
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Débloquez l'accès illimité à tous les modules, examens et fonctionnalités exclusives.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Bank Transfer Details */}
                    <Card className="p-6 space-y-6 border-t-4 border-t-blue-600 h-fit">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                <CreditCard size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Effectuez le virement</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Banque</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{bankDetails.bankName}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">RIB</p>
                                <p className="font-mono font-bold text-lg text-gray-900 dark:text-white tracking-wider break-all">
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

                    {/* Upload Receipt */}
                    <div className="space-y-6">
                        <Card className="p-6 space-y-6 border-t-4 border-t-green-500 h-fit">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                    <Upload size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Envoyez le reçu</h2>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400">
                                Une fois le virement effectué, téléchargez une photo ou un PDF du reçu ici. Votre compte sera activé après vérification (généralement sous 24h).
                            </p>

                            {uploadSuccess ? (
                                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center space-y-3">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-green-800 dark:text-green-300">Reçu envoyé !</h3>
                                    <p className="text-green-700 dark:text-green-400">
                                        Merci ! Nous avons bien reçu votre preuve de paiement. Vous recevrez une notification dès que votre compte sera activé.
                                    </p>
                                    <Button
                                        onClick={() => setUploadSuccess(false)}
                                        variant="outline"
                                        className="mt-4"
                                    >
                                        Envoyer un autre reçu
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                                            {file ? (
                                                <>
                                                    <FileText size={48} className="text-blue-500" />
                                                    <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                                                    <span className="text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={48} />
                                                    <span className="font-medium">Cliquez ou glissez votre fichier ici</span>
                                                    <span className="text-sm">Images (JPG, PNG) ou PDF</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        className="w-full py-3 text-lg font-semibold shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {uploading ? 'Envoi en cours...' : 'Envoyer la preuve'}
                                    </Button>
                                </div>
                            )}
                        </Card>

                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Besoin d'aide ? Contactez-nous sur WhatsApp
                            </p>
                            <a
                                href="https://wa.me/212600000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#25D366] hover:underline font-medium"
                            >
                                <MessageCircle size={20} />
                                Support WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
