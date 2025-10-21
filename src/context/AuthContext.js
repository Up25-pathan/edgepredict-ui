import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // <-- NEW: Loading state

  // On initial app load, check if user is already logged in (from a previous session)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setIsInitializing(false); // <-- Finish loading
    }
  }, []);

  const login = async (email, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userData = { email: email, token: data.access_token };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData); // Set the user state
      return true;
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem('user');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = { user, login, logout, isInitializing }; // <-- Provide the new state

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};