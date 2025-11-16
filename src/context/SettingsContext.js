import React, { createContext, useContext, useState, useEffect } from 'react';

// Default settings if the user has never visited before
const DEFAULT_SETTINGS = {
    // Simulation Defaults
    units: 'metric', // 'metric' or 'imperial'
    solverPrecision: 'standard', // 'standard', 'high', 'research'
    
    // Visualization
    heatmapPalette: 'turbo', // 'turbo', 'inferno', 'viridis'
    autoSave: true,
    
    // Notifications & Data
    emailNotifications: true,
    dataRetention: 'forever' // 'forever', '90d', '1y'
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        // 1. Try to load from LocalStorage on startup
        const saved = localStorage.getItem('edgepredict_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    // 2. Function to update a specific setting
    const updateSetting = (key, value) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            // Save to storage immediately so it persists on refresh
            localStorage.setItem('edgepredict_settings', JSON.stringify(newSettings));
            return newSettings;
        });
    };

    // 3. Function to save all (used by the Save button)
    const saveSettings = (newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('edgepredict_settings', JSON.stringify(newSettings));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);