import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Edit2, Trash2, X, Check, User, Shield, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';

export default function UserManager() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({ name: '', password: '' });

    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, ACTIVE

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, password: '' });
    };

    const handleDeleteClick = (user) => {
        setDeleteConfirm(user);
    };

    const handleActivate = async (user) => {
        try {
            await axios.put(`/users/${user.id}`, { status: 'ACTIVE' });
            setUsers(users.map(u => u.id === user.id ? { ...u, status: 'ACTIVE' } : u));
        } catch (error) {
            console.error("Failed to activate user", error);
            alert("Erreur lors de l'activation");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = { name: formData.name };
            if (formData.password) updateData.password = formData.password;

            await axios.put(`/users/${editingUser.id}`, updateData);

            setUsers(users.map(u => u.id === editingUser.id ? { ...u, name: formData.name } : u));
            setEditingUser(null);
            setFormData({ name: '', password: '' });
        } catch (error) {
            console.error("Failed to update user", error);
            alert("Erreur lors de la mise à jour");
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/users/${deleteConfirm.id}`);
            setUsers(users.filter(u => u.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Erreur lors de la suppression");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const pendingCount = users.filter(u => u.status === 'PENDING').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h2>
                    <p className="text-gray-500 dark:text-gray-400">Gérez les comptes étudiants et administrateurs</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'ALL'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Tous
                </button>
                <button
                    onClick={() => setFilterStatus('PENDING')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === 'PENDING'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    En attente
                    {pendingCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setFilterStatus('ACTIVE')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'ACTIVE'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Actifs
                </button>
            </div>

            <Card className="overflow-hidden border-0 shadow-sm bg-transparent dark:bg-transparent md:bg-white md:dark:bg-gray-800">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Utilisateur</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Rôle</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">Chargement...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">Aucun utilisateur trouvé.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                : user.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {user.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {currentUser?.role === 'SUPER_ADMIN' && (
                                                    <>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm(`Voulez-vous vraiment changer le rôle de ${user.name} ?`)) {
                                                                    try {
                                                                        const newRole = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
                                                                        await axios.put(`/users/${user.id}`, { role: newRole });
                                                                        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                                                                    } catch (e) {
                                                                        alert("Erreur lors du changement de rôle");
                                                                    }
                                                                }
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors ${user.role === 'ADMIN'
                                                                ? 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                                                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                                }`}
                                                            title={user.role === 'ADMIN' ? "Rétrograder en Étudiant" : "Promouvoir Admin"}
                                                        >
                                                            <Shield size={18} />
                                                        </button>
                                                        {user.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => handleActivate(user)}
                                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                                title="Activer"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                            title="Modifier"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Chargement...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Aucun utilisateur trouvé.</div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold shrink-0">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                : user.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {user.status || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {user.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleActivate(user)}
                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="p-2 text-gray-500 hover:text-primary-600 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(user)}
                                        className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Modifier l'utilisateur</h3>
                                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe (optionnel)</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Laisser vide pour ne pas changer"
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>Annuler</Button>
                                    <Button type="submit">Enregistrer</Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Supprimer l'utilisateur ?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Êtes-vous sûr de vouloir supprimer <strong>{deleteConfirm.name}</strong> ? Cette action est irréversible.
                            </p>
                            <div className="flex justify-center gap-3">
                                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                                <Button className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={handleDelete}>Supprimer</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
