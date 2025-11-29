import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Upload, FileText, Trash2, BookOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function KnowledgeBaseView() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [uploadTitle, setUploadTitle] = useState("");

    const [editingDoc, setEditingDoc] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", category: "" });

    useEffect(() => {
        fetchDocuments();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchDocuments = async () => {
        try {
            const res = await axios.get('/knowledge-base');
            setDocuments(res.data);
        } catch (err) {
            console.error("Failed to fetch documents", err);
            setError("Impossible de charger les documents.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (selectedCategory) {
            formData.append('category', selectedCategory);
        }
        if (uploadTitle) {
            formData.append('title', uploadTitle);
        }

        try {
            await axios.post('/knowledge-base/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            setSelectedCategory(""); // Reset category
            setUploadTitle(""); // Reset title
            fetchDocuments(); // Refresh list
        } catch (err) {
            console.error("Upload failed", err);
            setError("Échec de l'upload. Vérifiez que le fichier est un PDF ou TXT valide.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce document ?")) return;
        try {
            await axios.delete(`/knowledge-base/${id}`);
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert("Erreur lors de la suppression");
        }
    };

    const startEdit = (doc) => {
        setEditingDoc(doc);
        setEditForm({ title: doc.title, category: doc.category || "" });
    };

    const handleUpdate = async () => {
        if (!editingDoc) return;

        try {
            const res = await axios.put(`/knowledge-base/${editingDoc.id}`, editForm);
            setDocuments(prev => prev.map(d => d.id === editingDoc.id ? res.data : d));
            setEditingDoc(null);
        } catch (err) {
            console.error("Update failed", err);
            alert("Erreur lors de la mise à jour");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Base Documentaire (RAG)</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            Importez vos documents officiels (Lois, Guides, Protocoles).
                            L'IA utilisera <strong>uniquement</strong> ces documents pour expliquer les réponses aux étudiants, garantissant ainsi des informations fiables et sourcées.
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <Card className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Upload size={20} /> Ajouter un document
                </h4>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1 w-full space-y-4">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Cliquez pour upload</span> ou glissez-déposez
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX ou TXT (Max 10MB)</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.docx" />
                        </label>

                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Titre du document (Optionnel)
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Loi 07-22 relative à..."
                                value={uploadTitle}
                                onChange={(e) => setUploadTitle(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Si vide, le nom du fichier sera utilisé.
                            </p>
                        </div>

                        {/* Category Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Catégorie (Optionnel)
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Toutes les catégories (Général)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Si sélectionné, ce document ne sera utilisé que pour les questions de cette catégorie.
                            </p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col gap-2">
                        {file && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                                <FileText size={16} />
                                <span className="truncate max-w-[200px]">{file.name}</span>
                            </div>
                        )}
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            isLoading={uploading}
                            className="w-full"
                        >
                            {uploading ? 'Traitement...' : 'Importer'}
                        </Button>
                    </div>
                </div>
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </Card>

            {/* Documents List */}
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Documents disponibles ({documents.length})
                </h4>

                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Aucun document dans la base.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${doc.type === 'PDF' ? 'bg-red-100 text-red-600' : doc.type === 'DOCX' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-white">{doc.title}</h5>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span>Ajouté le {new Date(doc.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{doc.type}</span>
                                            {doc.category && (
                                                <>
                                                    <span>•</span>
                                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                                        {doc.category}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startEdit(doc)}
                                    >
                                        Modifier
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Modifier le document</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Titre (Utilisé pour les citations)
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Catégorie
                                </label>
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Toutes les catégories (Général)</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="ghost" onClick={() => setEditingDoc(null)}>Annuler</Button>
                                <Button onClick={handleUpdate}>Enregistrer</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
