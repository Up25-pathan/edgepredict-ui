import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SimulationSetupPage from './pages/SimulationSetupPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import SimulationInProgressPage from './pages/SimulationInProgressPage';
import MaterialLibraryPage from './pages/library/MaterialLibraryPage';
import SimulationResultsPage from './pages/SimulationResultsPage';
import ToolLibraryPage from './pages/library/ToolLibraryPage'; // Import the new page

// Wrapper for the main application layout
const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#161B22', // hud-surface
            color: '#C9D1D9', // hud-text-primary
            border: '1px solid #30363D', // hud-border
          },
        }}
      />
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
        />
        
        <Route 
          path="/*" 
          element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create" element={<SimulationSetupPage />} />
          <Route path="library/materials" element={<MaterialLibraryPage />} />
          <Route path="library/tools" element={<ToolLibraryPage />} /> {/* Add this route */}
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="simulations/live/:simulationId" element={<SimulationInProgressPage />} />
          <Route path="simulations/results/:simulationId" element={<SimulationResultsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

