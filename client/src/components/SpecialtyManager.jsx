import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Trash2, Plus, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';

export default function SpecialtyManager() {
    const [specialties, setSpecialties] = useState([]);
    const [newSpecialty, setNewSpecialty] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [specialtyToDelete, setSpecialtyToDelete] = useState(null);

    useEffect(() => {
        fetchSpecialties();
    }, []);

    const fetchSpecialties = async () => {
        try {
            const res = await axios.get('/specialties');
            setSpecialties(res.data);
        } catch (error) {
            console.error("Failed to fetch specialties", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newSpecialty.trim()) return;

        setLoading(true);
        try {
            if (editingSpecialty) {
                await axios.put(`/specialties/${editingSpecialty.id}`, { name: newSpecialty });
            } else {
                await axios.post('/specialties', { name: newSpecialty });
            }
            setNewSpecialty('');
            setEditingSpecialty(null);
            fetchSpecialties();
        } catch (error) {
            console.error("Operation failed:", error);
            const message = error.response?.data?.message || "Erreur lors de l'opération";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (specialty) => {
        setEditingSpecialty(specialty);
        setNewSpecialty(specialty.name);
    };

    const cancelEdit = () => {
        setEditingSpecialty(null);
        setNewSpecialty('');
    };

    const confirmDelete = (specialty) => {
        setSpecialtyToDelete(specialty);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!specialtyToDelete) return;

        try {
            await axios.delete(`/specialties/${specialtyToDelete.id}`);
            setDeleteModalOpen(false);
            setSpecialtyToDelete(null);
            fetchSpecialties();
        } catch (error) {
            console.error("Delete error:", error);
            const message = error.response?.data?.message || "Erreur lors de la suppression.";
            alert(message);
        }
    };

    return (
        <>
            <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Gérer les Spécialités</h2>

                <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
                    <Input
                        placeholder="Nouvelle spécialité..."
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    {editingSpecialty ? (
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                                <Check size={20} />
                            </Button>
                            <Button type="button" onClick={cancelEdit} disabled={loading} variant="secondary">
                                <X size={20} />
                            </Button>
                        </div>
                    ) : (
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus size={20} />
                        </Button>
                    )}
                </form>

                <div className="space-y-2">
                    {specialties.map((spec) => (
                        <div key={spec.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 transition-colors">
                            <span className="font-medium text-gray-900 dark:text-white">{spec.name}</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => startEdit(spec)}
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                    title="Modifier"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => confirmDelete(spec)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {specialties.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-center text-sm">Aucune spécialité.</p>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Supprimer la spécialité"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertTriangle size={24} />
                    </div>

                    <div>
                        <p className="text-gray-600">
                            Vous êtes sur le point de supprimer la spécialité <span className="font-bold text-gray-900">"{specialtyToDelete?.name}"</span>.
                        </p>
                        <p className="text-sm text-red-500 mt-2">
                            Impossible si elle est utilisée par des utilisateurs ou des catégories.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteModalOpen(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            className="flex-1"
                        >
                            Supprimer
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
