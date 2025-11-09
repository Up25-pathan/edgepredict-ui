import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // <-- THIS LINE RESTORES YOUR STYLES
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SimulationDataProvider } from './context/SimulationDataContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <SimulationDataProvider>
          <App />
        </SimulationDataProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();