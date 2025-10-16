import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/mockApi';

const SimulationDataContext = createContext(null);

export const SimulationDataProvider = ({ children }) => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch existing reports when the app loads
        const fetchInitialReports = async () => {
            const initialReports = await api.getReports();
            setReports(initialReports);
            setIsLoading(false);
        };
        fetchInitialReports();
    }, []);

    const addReport = async (reportData) => {
        const newReport = await api.addReport(reportData);
        setReports(prevReports => [...prevReports, newReport]);
    };
    
    const value = { reports, addReport, isLoading };

    return (
        <SimulationDataContext.Provider value={value}>
            {children}
        </SimulationDataContext.Provider>
    );
};

// Custom hook to easily access simulation data
export const useSimulationData = () => {
    return useContext(SimulationDataContext);
};
