import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export const SuccessModal = ({ isOpen, onClose, title, message, buttonText = "Continuer" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-white/20 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {message}
                    </p>

                    <Button
                        onClick={onClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                    >
                        {buttonText} <ArrowRight size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
