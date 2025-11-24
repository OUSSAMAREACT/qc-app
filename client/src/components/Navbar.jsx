import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';
import { BookOpen, Moon, Sun, Shield, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                        <BookOpen size={20} />
                    </div>
                    <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">QCM Echelle 11</span>
                </Link>
                <div className="flex items-center gap-2 md:gap-3">
                    <Button variant="ghost" onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </Button>

                    {user?.role === 'ADMIN' && (
                        <Link to="/admin">
                            <Button variant="secondary" className="flex items-center gap-2 text-sm px-3 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <Shield size={16} /> <span className="hidden md:inline">Admin</span>
                            </Button>
                        </Link>
                    )}
                    <Link to="/profile">
                        <Button variant="ghost" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm px-2 md:px-4">
                            <User size={18} /> <span className="hidden md:inline">Profil</span>
                        </Button>
                    </Link>
                    <Button variant="ghost" onClick={logout} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm px-2 md:px-4">
                        <LogOut size={18} /> <span className="hidden md:inline">Déconnexion</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
