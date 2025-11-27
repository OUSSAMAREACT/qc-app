import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set base URL for API
    let apiUrl = import.meta.env.VITE_API_URL || '/api';
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && apiUrl.startsWith('http:')) {
        apiUrl = apiUrl.replace('http:', 'https:');
    }
    axios.defaults.baseURL = apiUrl;

    // On mount, try to restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data.user);
        } catch (err) {
            console.error('Auth check failed', err);
            localStorage.removeItem('token');
            setToken(null);
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        const { token: newToken, user } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setUser(user);
        return user;
    };

    // Register now logs in automatically
    const register = async (name, email, password, specialtyId) => {
        const res = await axios.post('/auth/register', { name, email, password, specialtyId });
        const { token: newToken, user } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = { user, token, login, register, logout, loading };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
