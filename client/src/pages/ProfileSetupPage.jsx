import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { User, Building2, MapPin, Phone, CheckCircle } from 'lucide-react';

export default function ProfileSetupPage() {
    const { user, login } = useAuth(); // We might need to refresh user data
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        city: '',
        hospital: '',
        gender: '',
        phoneNumber: '+212 '
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Update profile via API
            const res = await axios.put('/auth/profile', formData);

            // Ideally, we should update the local user context here
            // For now, we assume the backend update was successful and redirect
            // You might want to implement a 'refreshUser' method in AuthContext

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la mise à jour du profil.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-lg shadow-xl border-0 ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finaliser votre profil</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Quelques dernières informations pour mieux vous connaître.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Ville"
                            name="city"
                            placeholder="Casablanca"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            leftIcon={<MapPin size={18} />}
                        />
                        <Input
                            label="Hôpital / Lieu de travail"
                            name="hospital"
                            placeholder="CHU Ibn Rochd"
                            value={formData.hospital}
                            onChange={handleChange}
                            required
                            leftIcon={<Building2 size={18} />}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexe</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.gender === 'MALE' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="MALE"
                                    checked={formData.gender === 'MALE'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <span>Homme</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.gender === 'FEMALE' ? 'bg-pink-50 border-pink-500 text-pink-700 ring-1 ring-pink-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="FEMALE"
                                    checked={formData.gender === 'FEMALE'}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <span>Femme</span>
                            </label>
                        </div>
                    </div>

                    <Input
                        label="Numéro de téléphone"
                        name="phoneNumber"
                        placeholder="+212 6..."
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        leftIcon={<Phone size={18} />}
                    />

                    <Button
                        type="submit"
                        className="w-full py-3 text-lg font-semibold shadow-lg shadow-blue-500/20"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enregistrement...' : 'Terminer et Accéder au Dashboard'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
