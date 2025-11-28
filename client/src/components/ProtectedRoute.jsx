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

    // Profile Completion Check
    // If user hasn't completed profile (e.g. city is missing), redirect to /profile-setup
    // But allow access to /profile-setup itself
    if ((!user.city || !user.hospital) && location.pathname !== '/profile-setup' && !requireAdmin) {
        return <Navigate to="/profile-setup" />;
    }

    // If profile is completed and user tries to go to /profile-setup, redirect to dashboard
    if (user.city && user.hospital && location.pathname === '/profile-setup') {
        return <Navigate to="/dashboard" />;
    }

    if (requireAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return <Navigate to="/dashboard" />;
    }

    return children;
}
