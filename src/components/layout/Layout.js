import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const location = useLocation();

    const getPageTitle = (pathname) => {
        if (pathname.startsWith('/simulations/live/')) {
            return 'Simulation Lab: Live Analysis';
        }
        if (pathname.startsWith('/simulations/')) {
            return 'Simulation Results';
        }
        const cleanPath = pathname.split('/').pop();
        switch (cleanPath) {
            case 'dashboard': return 'Dashboard';
            case 'create': return 'Create New Simulation';
            case 'reports': return 'Reports';
            case 'settings': return 'Settings';
            default: return 'Dashboard';
        }
    };
    
    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="flex h-screen font-mono">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar pageTitle={pageTitle} />
                {/* We remove the background color here to let the body's grid show through */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet /> 
                </main>
            </div>
        </div>
    );
};

export default Layout;

