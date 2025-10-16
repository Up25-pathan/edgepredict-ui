import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SimulationDataProvider } from './context/SimulationDataContext'; // Import the new provider
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SimulationDataProvider> {/* Wrap the app in the data provider */}
          <App />
        </SimulationDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

