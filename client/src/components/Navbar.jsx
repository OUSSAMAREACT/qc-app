import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LogOut, User, Moon, Sun, Menu, X,
    LayoutDashboard, BookOpen, Trophy, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/quiz', label: 'Quiz', icon: BookOpen },
        { path: '/history', label: 'Historique', icon: History },
    ];

    if (user?.role === 'ADMIN') {
        navLinks.push({ path: '/admin', label: 'Admin', icon: Trophy });
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105">
                            Q
                        </div>
                        <span className="font-heading font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                            QCMEchelle<span className="text-primary-600">11</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive
                                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full mx-4"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors bg-white dark:bg-dark-card"
                            >
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 pl-2">
                                    {user?.name?.split(' ')[0]}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {user?.name?.charAt(0)}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 overflow-hidden"
                                    >
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <User size={16} /> Mon Profil
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <LogOut size={16} /> Déconnexion
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden fixed inset-0 z-40 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl pt-20 px-6"
                    >
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link, index) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.path;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={link.path}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-medium transition-all ${isActive
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-xl ${isActive ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                <Icon size={24} />
                                            </div>
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                );
                            })}

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800"
                            >
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl text-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                                        <User size={24} />
                                    </div>
                                    Mon Profil
                                </Link>
                                <button
                                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-2"
                                >
                                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
                                        <LogOut size={24} />
                                    </div>
                                    Déconnexion
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
