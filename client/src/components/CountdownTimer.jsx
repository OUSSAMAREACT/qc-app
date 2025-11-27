import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExamDate = async () => {
            try {
                let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                if (window.location.protocol === 'https:' && apiUrl.startsWith('http:')) {
                    apiUrl = apiUrl.replace('http:', 'https:');
                }
                const response = await fetch(`${apiUrl}/settings`);
                if (response.ok) {
                    const settings = await response.json();
                    if (settings.examDate) {
                        calculateTimeLeft(settings.examDate);
                        // Update every second
                        const interval = setInterval(() => {
                            calculateTimeLeft(settings.examDate);
                        }, 1000);
                        return () => clearInterval(interval);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch exam date", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExamDate();
    }, []);

    const calculateTimeLeft = (dateString) => {
        const difference = +new Date(dateString) - +new Date();

        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        } else {
            setTimeLeft(null);
        }
    };

    if (loading || !timeLeft) return null;

    return (
        <div className="flex flex-col items-center my-12">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-900 dark:text-blue-100 mb-6 uppercase tracking-widest">
                Temps restant avant l'EAP Echelle 11
            </h3>
            <div className="flex justify-center gap-3 sm:gap-6">
                <TimeUnit value={timeLeft.days} label="Jours" />
                <TimeUnit value={timeLeft.hours} label="Heures" />
                <TimeUnit value={timeLeft.minutes} label="Minutes" />
                <TimeUnit value={timeLeft.seconds} label="Secondes" />
            </div>
        </div>
    );
}

function TimeUnit({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <motion.div
                key={value}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 sm:w-24 sm:h-24 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-blue-100 dark:border-white/20 flex items-center justify-center text-2xl sm:text-4xl font-bold text-blue-600 dark:text-white shadow-xl shadow-blue-900/5 dark:shadow-none"
            >
                {value < 10 ? `0${value}` : value}
            </motion.div>
            <span className="text-[10px] sm:text-xs text-blue-800 dark:text-blue-200 mt-3 font-bold uppercase tracking-wider">{label}</span>
        </div>
    );
}
