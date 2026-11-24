import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on mount
    const checkAuth = async () => {
        try {
            const response = await api.post('/users/get-current-user');
            if (response.data?.success && response.data?.data) {
                setUser(response.data.data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (identifier, password) => {
        let isEmail = false;
        if (identifier.includes('@')) {
            isEmail = true;
        }

        const email = isEmail ? identifier.trim() : "";
        const username = isEmail ? "" : identifier.trim();

        const response = await api.post('/users/login', {
            email,
            username,
            password
        });

        if (response.data?.success) {
            setUser(response.data.data.user);
            return response.data;
        }
        throw new Error(response.data?.message || "Login failed");
    };

    const register = async (formData) => {
        // formData must have avatarImage, coverImage (optional), fullName, userName, email, password
        const response = await api.post('/users/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/users/logout');
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
        }
    };

    const updateAccountDetails = async (fullName, email) => {
        const response = await api.patch('/users/update-account-details', {
            fullName,
            email
        });
        if (response.data?.success) {
            setUser(response.data.data);
        }
        return response.data;
    };

    const updateAvatar = async (file) => {
        const formData = new FormData();
        formData.append('avatarImage', file);
        const response = await api.patch('/users/update-avatar-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data?.success) {
            setUser(response.data.data);
        }
        return response.data;
    };

    const updateCover = async (file) => {
        const formData = new FormData();
        formData.append('coverImage', file);
        const response = await api.patch('/users/update-cover-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data?.success) {
            setUser(response.data.data);
        }
        return response.data;
    };

    const changePassword = async (oldPassword, newPassword, confirmPassword) => {
        const response = await api.post('/users/change-password', {
            oldPassword,
            newPassword,
            confirmPassword
        });
        return response.data;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            checkAuth,
            updateAccountDetails,
            updateAvatar,
            updateCover,
            changePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
