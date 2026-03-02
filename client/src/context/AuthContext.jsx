import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMe()
            .then((res) => setUser(res.data.user))
            .catch((err) => {
                // Silent failure if 401 (not logged in)
                if (err.response?.status !== 401) {
                    console.error('Initial auth check failed:', err);
                }
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);

    const isTenant = user?.role === 'tenant';
    const isOwner = user?.role === 'owner';
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isTenant, isOwner, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
