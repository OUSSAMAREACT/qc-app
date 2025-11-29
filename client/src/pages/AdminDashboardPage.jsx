import React, { useState } from 'react';
// Trigger rebuild
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LayoutDashboard, BookOpen, Award, Users, ArrowLeft, LogOut, ArrowRight, Sun, Moon, Settings, Trophy, Upload, Search, CreditCard, Send, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Views
import CommonModulesView from '../components/admin/CommonModulesView';
import SpecialtyView from '../components/admin/SpecialtyView';
import CategoryDetailView from '../components/admin/CategoryDetailView';
import WeeklyExamManager from '../components/admin/WeeklyExamManager';
import UserManager from '../components/admin/UserManager';
import SettingsManager from '../components/admin/SettingsManager';
import ImportQuestionsPage from './ImportQuestionsPage';
import SpellCheckView from '../components/admin/SpellCheckView';
import AdminPaymentView from '../components/admin/AdminPaymentView';
import AdminAnnouncementView from '../components/admin/AdminAnnouncementView';
import AdminDataIntegrityView from '../components/admin/AdminDataIntegrityView';
import KnowledgeBaseView from '../components/admin/KnowledgeBaseView';

export default function AdminDashboardPage() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [currentView, setCurrentView] = useState('overview');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                return <Overview onNavigate={setCurrentView} user={user} />;
            case 'common':
                return <CommonModulesView onSelectCategory={handleCategorySelect} />;
            case 'specialties':
                return <SpecialtyView onSelectCategory={handleCategorySelect} />;
            case 'weekly-exams':
                return <WeeklyExamManager />;
            case 'users':
                return <UserManager />;
            case 'settings':
                return <SettingsManager />;
            case 'import':
                return <ImportQuestionsPage />;
            case 'spell-check':
                return <SpellCheckView />;
            case 'payments':
                return <AdminPaymentView />;
            case 'broadcast':
                return <AdminAnnouncementView />;
            case 'integrity':
                return <AdminDataIntegrityView />;
            case 'knowledge-base':
                return <KnowledgeBaseView />;
            default:
                return <Overview onNavigate={setCurrentView} user={user} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans transition-colors duration-300 relative">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-30">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="text-blue-600" />
                    <span className="font-bold text-gray-900 dark:text-white">Admin Panel</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <ArrowLeft /> : <LayoutDashboard />}
                    </Button>
                </div>
            </div>

            {/* Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                flex flex-col transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 hidden lg:block">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="text-blue-600" /> Admin Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 lg:mt-0">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Vue d'ensemble"
                        isActive={currentView === 'overview' && !selectedCategory}
                        onClick={() => { setCurrentView('overview'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<BookOpen size={20} />}
                        label="Modules Communs"
                        isActive={currentView === 'common' || (selectedCategory && !selectedCategory.specialtyId)}
                        onClick={() => { setCurrentView('common'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<Award size={20} />}
                        label="Spécialités"
                        isActive={currentView === 'specialties' || (selectedCategory && selectedCategory.specialtyId)}
                        onClick={() => { setCurrentView('specialties'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<Trophy size={20} />}
                        label="Examens Hebdomadaires"
                        isActive={currentView === 'weekly-exams'}
                        onClick={() => { setCurrentView('weekly-exams'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                    />
                    {user?.role === 'SUPER_ADMIN' && (
                        <>
                            <SidebarItem
                                icon={<Users size={20} />}
                                label="Utilisateurs"
                                isActive={currentView === 'users'}
                                onClick={() => { setCurrentView('users'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={<Settings size={20} />}
                                label="Paramètres"
                                isActive={currentView === 'settings'}
                                onClick={() => { setCurrentView('settings'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={<CreditCard size={20} />}
                                label="Paiements"
                                isActive={currentView === 'payments'}
                                onClick={() => { setCurrentView('payments'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={<Send size={20} />}
                                label="Broadcast"
                                isActive={currentView === 'broadcast'}
                                onClick={() => { setCurrentView('broadcast'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={<AlertTriangle size={20} />}
                                label="Maintenance"
                                isActive={currentView === 'integrity'}
                                onClick={() => { setCurrentView('integrity'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                            />
                        </>
                    )}
                    <SidebarItem
                        icon={<BookOpen size={20} />}
                        label="Base Documentaire"
                        isActive={currentView === 'knowledge-base'}
                        onClick={() => { setCurrentView('knowledge-base'); setSelectedCategory(null); setIsSidebarOpen(false); }}
                    />
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        {theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
                    </button>
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
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen pt-20 lg:pt-8">
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function Overview({ onNavigate, user }) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Bienvenue sur l'administration</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Gérez le contenu et les utilisateurs de votre plateforme.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => onNavigate('common')}
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                >
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Modules Communs</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Gérez les questions transversales et les catégories générales.</p>
                        <div className="flex items-center text-blue-600 font-medium">
                            Gérer <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => onNavigate('specialties')}
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                >
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                            <Award size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Spécialités</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Organisez les parcours spécifiques et les modules dédiés.</p>
                        <div className="flex items-center text-purple-600 font-medium">
                            Gérer <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                {user?.role === 'SUPER_ADMIN' && (
                    <>
                        <div
                            onClick={() => onNavigate('users')}
                            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Utilisateurs</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Suivez la progression des étudiants et gérez les accès.</p>
                                <div className="flex items-center text-emerald-600 font-medium">
                                    Gérer <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => onNavigate('settings')}
                            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gray-500/10 rounded-full blur-2xl group-hover:bg-gray-500/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/30 text-gray-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Settings size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Paramètres</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Configurez la date de l'examen et autres options.</p>
                                <div className="flex items-center text-gray-600 font-medium">
                                    Gérer <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => onNavigate('broadcast')}
                            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Send size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Broadcast</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Envoyez des annonces à tous les utilisateurs.</p>
                                <div className="flex items-center text-pink-600 font-medium">
                                    Gérer <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div
                    onClick={() => onNavigate('knowledge-base')}
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                >
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Base Documentaire</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Gérez les documents officiels pour l'IA Tutor.</p>
                        <div className="flex items-center text-cyan-600 font-medium">
                            Gérer <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
