import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // Load from localStorage or use defaults
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('edgepredict_settings');
        return saved ? JSON.parse(saved) : {
            units: 'metric',
            solverPrecision: 'standard',
            colorMap: 'turbo',
            emailNotifications: true
        };
    });

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('edgepredict_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};