import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import SimulationSetupPage from './pages/SimulationSetupPage';
import SimulationResultsPage from './pages/SimulationResultsPage';
import MaterialLibraryPage from './pages/library/MaterialLibraryPage';
import ToolLibraryPage from './pages/library/ToolLibraryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

// This component remains the same, protecting our layout route
const PrivateRoute = ({ children }) => {
  const { user, isInitializing } = useAuth();
  if (isInitializing) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* All private routes are now children of the Layout route */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* The Outlet in Layout.js will render these nested routes */}
        <Route index element={<DashboardPage />} /> {/* This is the default page for "/" */}
        <Route path="reports" element={<ReportsPage />} />
        <Route path="simulation-setup" element={<SimulationSetupPage />} />
        <Route path="simulation/:id" element={<SimulationResultsPage />} />
        <Route path="library/materials" element={<MaterialLibraryPage />} />
        <Route path="library/tools" element={<ToolLibraryPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Catch-all for any unknown routes inside the app */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;