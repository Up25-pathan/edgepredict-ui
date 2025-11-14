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
import RequestAccessPage from './pages/RequestAccessPage';

// --- NEW IMPORTS ---
import UserManagementPage from './pages/admin/UserManagementPage';
import AccessRequestsPage from './pages/admin/AccessRequestsPage'; // Import the new page

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

// --- Admin Only Route Protection ---
const AdminRoute = ({ children }) => {
  const { user, isInitializing } = useAuth();
  if (isInitializing) return null; // Wait for auth check
  
  // If logged in but NOT admin, redirect to dashboard
  if (user && !user.is_admin) {
      return <Navigate to="/" replace />;
  }
  // If not logged in at all, redirect to login
  if (!user) {
      return <Navigate to="/login" replace />;
  }
  
  // Only render children if user is an admin
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/request-access" element={<RequestAccessPage />} />

      {/* Private Layout */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        
        {/* --- ADMIN ROUTES --- */}
        <Route path="admin/users" element={
            <AdminRoute>
                <UserManagementPage />
            </AdminRoute>
        } />
        {/* ADDED THIS NEW ROUTE */}
        <Route path="admin/requests" element={
            <AdminRoute>
                <AccessRequestsPage />
            </AdminRoute>
        } />
        {/* --- END ADMIN ROUTES --- */}

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