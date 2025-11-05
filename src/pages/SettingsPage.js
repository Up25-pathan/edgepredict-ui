import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const SettingsPage = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-hud-text-primary mb-6">Settings</h2>
            <div className="space-y-8">
                {/* Profile Settings */}
                <Card>
                    <h3 className="text-lg font-bold text-hud-text-primary mb-4 border-b border-hud-border pb-2">Profile</h3>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-hud-text-secondary">Full Name</label>
                                <input type="text" id="fullName" defaultValue="Demo User" className="mt-1 block w-full px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary sm:text-sm text-hud-text-primary" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-hud-text-secondary">Email Address</label>
                                <input type="email" id="email" defaultValue="demo@example.com" className="mt-1 block w-full px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary sm:text-sm text-hud-text-primary" />
                            </div>
                        </div>
                        <div className="pt-2 text-right">
                             <Button variant="primary">Save Profile</Button>
                        </div>
                    </form>
                </Card>

                {/* Preferences */}
                <Card>
                    <h3 className="text-lg font-bold text-hud-text-primary mb-4 border-b border-hud-border pb-2">Preferences</h3>
                     <div className="space-y-6">
                        <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-hud-text-secondary">Theme</label>
                            <select id="theme" className="mt-1 block w-full pl-3 pr-10 py-2 bg-hud-dark border-hud-border focus:outline-none focus:ring-hud-primary focus:border-hud-primary sm:text-sm rounded-md text-hud-text-primary">
                                <option>Digital Twin (Dark)</option>
                                <option disabled>Classic (Light)</option>
                            </select>
                        </div>
                         <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input id="notifications" name="notifications" type="checkbox" defaultChecked className="focus:ring-hud-primary h-4 w-4 text-hud-primary border-hud-border rounded bg-hud-dark" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="notifications" className="font-medium text-hud-text-primary">Email Notifications</label>
                                <p className="text-hud-text-secondary">Get notified when simulations are complete.</p>
                            </div>
                        </div>
                         <div className="pt-2 text-right">
                            <Button variant="primary">Save Preferences</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;

