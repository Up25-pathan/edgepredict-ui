import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    PlusIcon, 
    DocumentReportIcon, 
    CogIcon, 
    ChartBarIcon, 
    LibraryIcon, 
    ToolIcon,
    Hexagon 
} from '../../assets/icons';
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
            <div className="w-64 bg-hud-surface border-r border-hud-border flex flex-col p-4 shrink-0">
                {/* LOGO SECTION */}
                <div className="flex items-center mb-8 shrink-0">
                    <div className="w-10 h-10 mr-3 text-hud-primary flex items-center justify-center">
                         <Hexagon className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl font-bold text-hud-text-primary tracking-tight">EdgePredict</h1>
                </div>

                {/* NAVIGATION LINKS */}
                <nav className="flex-1 space-y-1">
                    <NavLink to="/" className={navLinkClasses}>
                        <ChartBarIcon className="w-6 h-6" />
                        <span className="ml-3">Dashboard</span>
                    </NavLink>

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

                {/* FOOTER ACTIONS */}
                <div className="mt-auto space-y-2">
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)} 
                        className="flex items-center justify-center w-full p-3 text-base text-hud-text-secondary rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="ml-2 font-bold">Logout</span>
                    </button>
                    
                    <NavLink
                        to="/simulation-setup"
                        className="flex items-center justify-center w-full p-3 text-base text-white bg-hud-primary rounded-lg hover:bg-hud-primary-hover transition-all duration-200 shadow-lg shadow-hud-glow hover:scale-[1.02] active:scale-95"
                    >
                        <PlusIcon className="w-6 h-6" />
                        <span className="ml-2 font-bold">New Simulation</span>
                    </NavLink>
                </div>
            </div>

            {/* LOGOUT MODAL */}
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