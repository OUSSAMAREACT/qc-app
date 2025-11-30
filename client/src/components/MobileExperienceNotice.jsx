import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Smartphone } from 'lucide-react';

export default function MobileExperienceNotice() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if mobile and if notice hasn't been dismissed recently
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768; // md breakpoint
            const hasSeenNotice = sessionStorage.getItem('mobile_notice_dismissed');

            if (isMobile && !hasSeenNotice) {
                // Small delay to not overwhelm user immediately
                const timer = setTimeout(() => setIsVisible(true), 2000);
                return () => clearTimeout(timer);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('mobile_notice_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
                >
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex gap-4">
                            <div className="shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <Monitor size={24} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                    Expérience Optimale sur PC
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Certaines fonctionnalités avancées (Statistiques détaillées, Historique complet) sont optimisées pour ordinateur.
                                </p>
                                <button
                                    onClick={handleDismiss}
                                    className="mt-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    Compris, continuer sur mobile
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
