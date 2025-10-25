import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ pageTitle }) => {
    const { user } = useAuth(); 

    return (
        <header className="bg-hud-surface border-b border-hud-border p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-hud-text-primary">{pageTitle}</h1>
                <div className="flex items-center">
                    {user && (
                        <div className="w-10 h-10 bg-hud-primary rounded-full flex items-center justify-center font-bold text-white">
                            {user.initials || 'US'}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;