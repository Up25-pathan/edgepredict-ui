import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext'; // Import hook
import Card from '../components/common/Card';
import { User, Sliders, Eye, Bell, Save, Database, CheckCircle } from 'lucide-react';

// Reusable Toggle Component
const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-colors">
        <div>
            <h4 className="text-sm font-medium text-white">{label}</h4>
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
    </div>
);

// Reusable Select Component
const Select = ({ label, options, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const SettingsSection = ({ icon: Icon, title, children }) => (
    <Card className="mb-8 shadow-lg border border-gray-800 bg-gray-900">
        <div className="p-6">
            <div className="flex items-center mb-6 border-b border-gray-800 pb-4">
                {Icon && <Icon className="w-5 h-5 text-indigo-500 mr-3" />}
                <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    </Card>
);

const SettingsPage = () => {
    const { user } = useAuth();
    const { settings, saveSettings } = useSettings(); // Get real settings
    
    // Local state for the form (so we don't save on every keystroke, only on "Save")
    const [formData, setFormData] = useState(settings);
    const [showSuccess, setShowSuccess] = useState(false);

    // Sync local state if global settings change (e.g. loaded from storage)
    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        saveSettings(formData);
        setShowSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    System Configuration
                </h1>
                {showSuccess && (
                    <div className="flex items-center bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 animate-fade-in-down">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Settings Saved Successfully
                    </div>
                )}
            </div>

            {/* Profile Section (Read Only) */}
            <SettingsSection icon={User} title="User Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={user?.email || ''} 
                            disabled
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-2 text-xs text-gray-500 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Active Account
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                        <input 
                            type="text" 
                            value={user?.is_admin ? "Administrator" : "Standard User"} 
                            readOnly
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-300"
                        />
                    </div>
                </div>
            </SettingsSection>

            {/* Simulation Defaults */}
            <SettingsSection icon={Sliders} title="Simulation Defaults">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Select 
                        label="Measurement Units"
                        value={formData.units}
                        onChange={(val) => handleChange('units', val)}
                        options={[
                            { value: 'metric', label: 'Metric (mm, °C, MPa)' },
                            { value: 'imperial', label: 'Imperial (in, °F, ksi)' }
                        ]}
                     />
                     <Select 
                        label="Default Solver Precision"
                        value={formData.solverPrecision}
                        onChange={(val) => handleChange('solverPrecision', val)}
                        options={[
                            { value: 'standard', label: 'Standard (Balanced Speed/Accuracy)' },
                            { value: 'high', label: 'High Precision (Slower)' },
                            { value: 'research', label: 'Research Grade (Very Slow)' }
                        ]}
                     />
                </div>
            </SettingsSection>

            {/* Visualization Settings */}
             <SettingsSection icon={Eye} title="Visualization & Interface">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select 
                        label="Stress Heatmap Palette"
                        value={formData.heatmapPalette}
                        onChange={(val) => handleChange('heatmapPalette', val)}
                        options={[
                            { value: 'turbo', label: 'Turbo (Rainbow - Default)' },
                            { value: 'inferno', label: 'Inferno (High Contrast Heat)' },
                            { value: 'viridis', label: 'Viridis (Colorblind Accessible)' }
                        ]}
                    />
                    <div className="flex items-end">
                         <Toggle 
                            label="Auto-Save Results" 
                            description="Save intermediate time-steps during active runs"
                            checked={formData.autoSave}
                            onChange={(val) => handleChange('autoSave', val)}
                        />
                    </div>
                </div>
            </SettingsSection>

             {/* Notifications & Data */}
            <SettingsSection icon={Database} title="Data & Notifications">
                <div className="grid grid-cols-1 gap-4">
                    <Toggle 
                        label="Email Notifications" 
                        description="Receive an alert when long-running simulations complete or fail"
                        checked={formData.emailNotifications}
                        onChange={(val) => handleChange('emailNotifications', val)}
                    />
                     <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-colors">
                         <div>
                            <h4 className="text-sm font-medium text-white">Data Retention Policy</h4>
                            <p className="text-xs text-gray-400 mt-1">Automatically clear old results to save storage cost</p>
                        </div>
                        <select 
                            value={formData.dataRetention}
                            onChange={(e) => handleChange('dataRetention', e.target.value)}
                            className="bg-gray-950 border border-gray-800 text-white text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                        >
                            <option value="forever">Keep Forever</option>
                            <option value="90d">Delete after 90 days</option>
                            <option value="1y">Delete after 1 year</option>
                        </select>
                    </div>
                </div>
            </SettingsSection>

            {/* Save Button */}
            <div className="flex justify-end pt-4 pb-12">
                <button 
                    onClick={handleSave}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center hover:scale-[1.02] active:scale-95"
                >
                    <Save className="w-5 h-5 mr-2" />
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;