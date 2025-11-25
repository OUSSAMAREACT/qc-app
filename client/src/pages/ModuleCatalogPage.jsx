import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, Star, ArrowRight, ArrowLeft, Filter } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ModuleCatalogPage() {
    const { type } = useParams(); // 'specialty' or 'common'
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const isSpecialty = type === 'specialty';

    useEffect(() => {
        fetchCategories();
    }, [type]);

    useEffect(() => {
        filterCategories();
    }, [searchQuery, categories]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/categories');
            const allCategories = res.data;

            // Filter based on type
            const relevantCategories = allCategories.filter(c =>
                isSpecialty ? c.specialty : !c.specialty
            );

            setCategories(relevantCategories);
            setFilteredCategories(relevantCategories);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    const filterCategories = () => {
        if (!searchQuery.trim()) {
            setFilteredCategories(categories);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = categories.filter(cat =>
            cat.name.toLowerCase().includes(query)
        );
        setFilteredCategories(filtered);
    };

    const getCategoryGradient = (index) => {
        const gradients = [
            'from-emerald-500 to-teal-600',
            'from-blue-500 to-indigo-600',
            'from-purple-500 to-pink-600',
            'from-orange-500 to-red-600',
            'from-cyan-500 to-blue-600',
            'from-rose-500 to-orange-600'
        ];
        return gradients[index % gradients.length];
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors mb-2 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Retour au tableau de bord</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {isSpecialty ? (
                            <>
                                <Star className="text-yellow-500" size={32} />
                                Modules de Spécialité
                            </>
                        ) : (
                            <>
                                <BookOpen className="text-primary-600 dark:text-primary-400" size={32} />
                                Tronc Commun
                            </>
                        )}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        {isSpecialty
                            ? `Explorez tous les modules dédiés à votre spécialité : ${user?.specialty?.name || 'Non définie'}`
                            : "Accédez à l'ensemble des modules du tronc commun."}
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Rechercher un module..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-lg"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        {filteredCategories.length} résultats
                    </span>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
                    ))}
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-dark-card rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Filter className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                        Aucun module ne correspond à votre recherche.
                    </p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-primary-600 font-bold hover:underline"
                    >
                        Effacer la recherche
                    </button>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredCategories.map((cat, index) => (
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -8 }}
                            key={cat.id}
                            className="group relative bg-white dark:bg-dark-card rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full"
                        >
                            {/* Gradient Header */}
                            <div className={`h-40 w-full bg-gradient-to-br ${isSpecialty ? 'from-yellow-500 to-orange-600' : getCategoryGradient(index)} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                <div className="absolute -bottom-6 -right-6 text-white/20 transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                    {isSpecialty ? <Star size={140} /> : <BookOpen size={140} />}
                                </div>
                                <div className="absolute top-6 left-6">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm">
                                        {isSpecialty ? 'Spécialité' : 'Module Commun'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col relative">
                                {/* Floating Icon */}
                                <div className="absolute -top-10 left-6 w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-dark-card group-hover:scale-110 transition-transform duration-300">
                                    <div className={isSpecialty ? "text-yellow-500" : `text-${getCategoryGradient(index).split('-')[1]}-500`}>
                                        {isSpecialty ? <Star size={32} className="text-gray-700 dark:text-white" /> : <BookOpen size={32} className="text-gray-700 dark:text-white" />}
                                    </div>
                                </div>

                                <div className="mt-8 mb-6">
                                    <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                        {cat.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span>{cat._count?.questions || 0} Questions</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                    <Link to={`/quiz?category=${encodeURIComponent(cat.name)}`}>
                                        <button className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-gray-700 text-gray-900 dark:text-white hover:text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-between px-5 group/btn">
                                            <span>Commencer le Quiz</span>
                                            <div className={`w-8 h-8 rounded-full bg-white dark:bg-gray-700 group-hover/btn:bg-${isSpecialty ? 'yellow' : 'primary'}-500 group-hover/btn:text-white flex items-center justify-center transition-colors shadow-sm`}>
                                                <ArrowRight size={16} />
                                            </div>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
