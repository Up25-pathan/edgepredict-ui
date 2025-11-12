import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api'; // Import our updated api service

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Holds user details { id, email, is_active }
    const [token, setToken] = useState(localStorage.getItem('accessToken')); // Holds the JWT token
    const [isInitializing, setIsInitializing] = useState(true); // Tracks initial auth check
    const [authError, setAuthError] = useState(''); // Holds login/auth errors

    // Effect to check authentication status on initial load or token change
    useEffect(() => {
        const initializeAuth = async () => {
            setIsInitializing(true);
            setAuthError(''); // Clear previous errors
            const storedToken = localStorage.getItem('accessToken');
            
            if (storedToken) {
                setToken(storedToken); // Make sure token state is set
                try {
                    // Use the interceptor implicitly by calling a protected route
                    const response = await api.getCurrentUser();
                    setUser(response.data); // Set user data if token is valid
                } catch (error) {
                    console.error("Auth initialization failed:", error);
                    // If fetching user fails (e.g., token expired/invalid), clear token and user
                    localStorage.removeItem('accessToken');
                    setToken(null);
                    setUser(null);
                    setAuthError('Session expired. Please log in again.');
                }
            } else {
                setToken(null);
                setUser(null);
            }
            setIsInitializing(false);
        };

        initializeAuth();
    }, []); // Run only once on mount

    // Login function
    const login = useCallback(async (email, password) => {
        setAuthError(''); // Clear previous errors
        try {
            const response = await api.login(email, password);
            const { access_token } = response.data;
            
            localStorage.setItem('accessToken', access_token); // Store token
            setToken(access_token); // Update state

            // After getting the token, fetch user details
            const userResponse = await api.getCurrentUser();
            setUser(userResponse.data);
            
            return true; // Indicate success
        } catch (error) {
            console.error("Login failed:", error);
            localStorage.removeItem('accessToken'); // Ensure no invalid token is stored
            setToken(null);
            setUser(null);
            const detail = error.response?.data?.detail || "Login failed. Please check credentials.";
            setAuthError(detail); // Set error message
            return false; // Indicate failure
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('accessToken'); // Clear token from storage
        setToken(null); // Clear token state
        setUser(null); // Clear user state
        setAuthError(''); // Clear any errors
        // Redirecting might be handled in the component calling logout (e.g., Navbar)
    }, []);

    // Value provided by the context
    const value = {
        user,
        token,
        isInitializing,
        authError,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context easily in other components
export const useAuth = () => {
    return useContext(AuthContext);
};