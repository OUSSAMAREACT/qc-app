import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LayoutDashboard, BookOpen, Award, Users, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Views
import CommonModulesView from '../components/admin/CommonModulesView';
import SpecialtyView from '../components/admin/SpecialtyView';
import CategoryDetailView from '../components/admin/CategoryDetailView';
import WeeklyExamManager from '../components/admin/WeeklyExamManager';
import UserManager from '../components/admin/UserManager';

export default function AdminDashboardPage() {
    const { logout } = useAuth();
    const [currentView, setCurrentView] = useState('overview');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleBackToDashboard = () => {
        setSelectedCategory(null);
    };

    const renderContent = () => {
        if (selectedCategory) {
            return (
                <CategoryDetailView
                    categoryId={selectedCategory.id}
                    onBack={handleBackToDashboard}
                />
            );
        }

        switch (currentView) {
            case 'overview':
                return <Overview />;
            case 'common':
                return <CommonModulesView onSelectCategory={handleCategorySelect} />;
            case 'specialties':
                return <SpecialtyView onSelectCategory={handleCategorySelect} />;
            case 'weekly-exams':
                return <WeeklyExamManager />;
            case 'users':
                return <UserManager />;
            default:
                return <Overview />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-20 transition-colors duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="text-blue-600" /> Admin Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Vue d'ensemble"
                        isActive={currentView === 'overview' && !selectedCategory}
                        onClick={() => { setCurrentView('overview'); setSelectedCategory(null); }}
                    />
                    <SidebarItem
                        icon={<BookOpen size={20} />}
                        label="Modules Communs"
                        isActive={currentView === 'common' || (selectedCategory && !selectedCategory.specialtyId)}
                        onClick={() => { setCurrentView('common'); setSelectedCategory(null); }}
                    />
                    <SidebarItem
                        icon={<Award size={20} />}
                        label="Spécialités"
                        isActive={currentView === 'specialties' || (selectedCategory && selectedCategory.specialtyId)}
                        onClick={() => { setCurrentView('specialties'); setSelectedCategory(null); }}
                    />
                    <SidebarItem
                        icon={<Award size={20} />} // Reusing Award icon for now, or maybe Trophy
                        label="Partie Commune"
                        isActive={currentView === 'weekly-exams'}
                        onClick={() => { setCurrentView('weekly-exams'); setSelectedCategory(null); }}
                    />
                    <SidebarItem
                        icon={<Users size={20} />}
                        label="Utilisateurs"
                        isActive={currentView === 'users'}
                        onClick={() => { setCurrentView('users'); setSelectedCategory(null); }}
                    />
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <Link to="/dashboard" className="block">
                        <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <ArrowLeft size={18} className="mr-2" /> Retour au site
                        </Button>
                    </Link>
                    <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700">
                        <LogOut size={18} className="mr-2" /> Déconnexion
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function Overview() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Bienvenue sur l'administration</h2>
            <p className="text-gray-500 dark:text-gray-400">Sélectionnez une section dans le menu pour commencer à gérer le contenu.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <h3 className="text-lg font-medium opacity-90">Modules Communs</h3>
                    <p className="text-3xl font-bold mt-2">Gérez</p>
                    <p className="text-sm opacity-75 mt-1">les questions transversales</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
                    <h3 className="text-lg font-medium opacity-90">Spécialités</h3>
                    <p className="text-3xl font-bold mt-2">Organisez</p>
                    <p className="text-sm opacity-75 mt-1">les parcours spécifiques</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                    <h3 className="text-lg font-medium opacity-90">Utilisateurs</h3>
                    <p className="text-3xl font-bold mt-2">Suivez</p>
                    <p className="text-sm opacity-75 mt-1">la progression des étudiants</p>
                </div>
            </div>
        </div>
    );
}
