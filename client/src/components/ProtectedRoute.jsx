import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Onboarding Check
    if (!user.onboardingCompleted && location.pathname !== '/onboarding' && location.pathname !== '/payment' && !requireAdmin) {
        return <Navigate to="/onboarding" />;
    }

    if (user.onboardingCompleted && location.pathname === '/onboarding') {
        return <Navigate to="/dashboard" />;
    }

    if (requireAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return <Navigate to="/dashboard" />;
    }

    return children;
}
