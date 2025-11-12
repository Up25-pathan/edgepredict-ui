import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
// Using generic standard icons that fit your HUD theme well
import { User, Sliders, Eye, Bell, Save, Database } from 'lucide-react';

// Reusable Toggle Component for consistency
const Toggle = ({ label, description, defaultChecked }) => (
    <div className="flex items-center justify-between p-4 bg-hud-bg/50 rounded-lg border border-hud-border hover:border-hud-primary/50 transition-colors">
        <div>
            <h4 className="text-sm font-medium text-hud-text-primary">{label}</h4>
            {description && <p className="text-xs text-hud-text-secondary mt-1">{description}</p>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
            <div className="w-11 h-6 bg-gray-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-hud-text-secondary after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hud-primary peer-checked:after:bg-white"></div>
        </label>
    </div>
);

// Reusable Select Component for consistent styling
const Select = ({ label, options, defaultValue }) => (
    <div>
        <label className="block text-sm font-medium text-hud-text-secondary mb-2">{label}</label>
        <select 
            defaultValue={defaultValue}
            className="w-full bg-hud-bg border border-hud-border text-hud-text-primary text-sm rounded-lg p-3 focus:ring-1 focus:ring-hud-primary focus:border-hud-primary outline-none transition-all"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const SettingsSection = ({ icon: Icon, title, children }) => (
    <Card className="mb-8 shadow-lg shadow-black/20">
        <div className="p-6">
            <div className="flex items-center mb-6 border-b border-hud-border pb-4">
                {Icon && <Icon className="w-5 h-5 text-hud-primary mr-3" />}
                <h2 className="text-lg font-bold text-hud-text-primary tracking-wide">{title}</h2>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    </Card>
);

const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <div className="w-full max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-hud-text-primary tracking-tight">
                    System Configuration
                </h1>
            </div>

            {/* Profile Section */}
            <SettingsSection icon={User} title="User Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-hud-text-secondary mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={user?.email || ''} 
                            disabled
                            className="w-full bg-hud-bg/30 border border-hud-border/50 rounded-lg px-4 py-3 text-hud-text-secondary cursor-not-allowed"
                        />
                        <p className="mt-2 text-xs text-hud-text-secondary flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Managed by organization admin
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-hud-text-secondary mb-2">Role Permissions</label>
                        <input 
                            type="text" 
                            value="Engineering Lead" 
                            readOnly
                            className="w-full bg-hud-bg/30 border border-hud-border/50 rounded-lg px-4 py-3 text-hud-text-primary"
                        />
                    </div>
                </div>
            </SettingsSection>

            {/* Simulation Defaults */}
            <SettingsSection icon={Sliders} title="Simulation Defaults">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Select 
                        label="Measurement Units"
                        defaultValue="metric"
                        options={[
                            { value: 'metric', label: 'Metric (mm, °C, MPa)' },
                            { value: 'imperial', label: 'Imperial (in, °F, ksi)' }
                        ]}
                     />
                     <Select 
                        label="Default Solver Precision"
                        defaultValue="standard"
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
                        defaultValue="turbo"
                        options={[
                            { value: 'turbo', label: 'Turbo (Rainbow - Default)' },
                            { value: 'inferno', label: 'Inferno (High Contrast Heat)' },
                            { value: 'viridis', label: 'Viridis (Colorblind Accessible)' }
                        ]}
                    />
                    {/* Replaced generic checkbox with a nice toggle */}
                    <div className="flex items-end">
                         <Toggle 
                            label="Auto-Save Results" 
                            description="Save intermediate time-steps during active runs"
                            defaultChecked={true}
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
                        defaultChecked={true}
                    />
                     <div className="flex items-center justify-between p-4 bg-hud-bg/50 rounded-lg border border-hud-border hover:border-hud-primary/50 transition-colors">
                         <div>
                            <h4 className="text-sm font-medium text-hud-text-primary">Data Retention Policy</h4>
                            <p className="text-xs text-hud-text-secondary mt-1">Automatically clear old results to save storage cost</p>
                        </div>
                        <select className="bg-hud-surface border border-hud-border text-hud-text-primary text-sm rounded-lg p-2 focus:ring-1 focus:ring-hud-primary outline-none">
                            <option value="forever">Keep Forever</option>
                            <option value="90d">Delete after 90 days</option>
                            <option value="1y">Delete after 1 year</option>
                        </select>
                    </div>
                </div>
            </SettingsSection>

            {/* Save Button - Floating or Fixed at bottom */}
            <div className="flex justify-end pt-4 pb-12">
                <button className="px-8 py-3 bg-hud-primary hover:bg-hud-primary-hover text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-hud-glow/50 hover:shadow-hud-glow flex items-center hover:scale-[1.02] active:scale-95">
                    <Save className="w-5 h-5 mr-2" />
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;