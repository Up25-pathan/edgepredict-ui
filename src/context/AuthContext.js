import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/mockApi';
import LoadingPage from '../pages/LoadingPage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if the user is already logged in when the app loads
        const validateSession = async () => {
            try {
                const { isAuthenticated, user } = await api.checkAuth();
                if (isAuthenticated) {
                    setUser(user);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Session validation failed", error);
            } finally {
                setIsLoading(false);
            }
        };
        validateSession();
    }, []);

    const login = async (email, password) => {
        const loggedInUser = await api.login(email, password);
        setUser(loggedInUser);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily access auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
