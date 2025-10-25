import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PlusIcon, DocumentReportIcon, CogIcon, ChartBarIcon, LibraryIcon, ToolIcon } from '../../assets/icons';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Button from '../common/Button';

const Sidebar = () => {
    const { logout } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutConfirm = () => {
        logout();
        setIsLogoutModalOpen(false);
    };

    const navLinkClasses = ({ isActive }) =>
        `flex items-center p-3 text-base rounded-lg transition-colors duration-200 group ${
            isActive
                ? 'bg-hud-primary text-white shadow-lg shadow-hud-glow' 
                : 'text-hud-text-secondary hover:bg-hud-border hover:text-hud-text-primary'
        }`;

    return (
        <>
            <div className="w-64 bg-hud-surface border-r border-hud-border flex flex-col p-4">
                <div className="flex items-center mb-8 shrink-0">
                    {/* New "Digital Edge" SVG Logo */}
                    <div className="w-12 h-12 mr-3 text-hud-primary">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4h12v2H4zM4 11h16v2H4zM4 18h12v2H4zM18 6h2v3h-2zM10 8h2v2h-2zM18 13h2v3h-2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-hud-text-primary">EdgePredict</h1>
                </div>

                <nav className="flex-1 space-y-1">
                    <NavLink to="/dashboard" className={navLinkClasses}>
                        <ChartBarIcon className="w-6 h-6" />
                        <span className="ml-3">Dashboard</span>
                    </NavLink>

                    {/* Libraries Section */}
                    <div className="pt-4 pb-2">
                        <h3 className="px-3 text-xs font-semibold text-hud-text-secondary uppercase tracking-wider">Libraries</h3>
                    </div>
                    <NavLink to="/library/materials" className={navLinkClasses}>
                        <LibraryIcon className="w-6 h-6" />
                        <span className="ml-3">Material Library</span>
                    </NavLink>
                    <NavLink to="/library/tools" className={navLinkClasses}>
                        <ToolIcon className="w-6 h-6" />
                        <span className="ml-3">Tool Library</span>
                    </NavLink>

                    {/* Other Links */}
                    <div className="pt-4 pb-2">
                        <h3 className="px-3 text-xs font-semibold text-hud-text-secondary uppercase tracking-wider">Manage</h3>
                    </div>
                    <NavLink to="/reports" className={navLinkClasses}>
                        <DocumentReportIcon className="w-6 h-6" />
                        <span className="ml-3">Reports</span>
                    </NavLink>
                    <NavLink to="/settings" className={navLinkClasses}>
                        <CogIcon className="w-6 h-6" />
                        <span className="ml-3">Settings</span>
                    </NavLink>
                </nav>

                <div className="mt-auto space-y-2">
                    {/* The logout button now opens the modal */}
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)} 
                        className="flex items-center justify-center w-full p-3 text-base text-hud-text-secondary rounded-lg hover:bg-red-900/50 hover:text-red-300 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="ml-2 font-bold">Logout</span>
                    </button>
                    <NavLink
                        to="/create"
                        className="flex items-center justify-center w-full p-3 text-base text-white bg-hud-primary rounded-lg hover:bg-hud-primary-hover transition-all duration-200 shadow-lg shadow-hud-glow hover:scale-105"
                    >
                        <PlusIcon className="w-6 h-6" />
                        <span className="ml-2 font-bold">New Simulation</span>
                    </NavLink>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)}>
                <h2 className="text-xl font-bold text-hud-text-primary mb-4">Confirm Logout</h2>
                <p className="text-hud-text-secondary mb-6">Are you sure you want to end your current session?</p>
                <div className="flex justify-end gap-4">
                    <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLogoutConfirm}>
                        Logout
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default Sidebar;

