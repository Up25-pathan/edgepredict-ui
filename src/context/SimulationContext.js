import React, { createContext, useState, useContext, useEffect } from 'react';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
    const [metrics, setMetrics] = useState({
        stress: 0,
        temp: 25,
        deflection: 0,
    });
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // This effect simulates a live data feed from a backend
    useEffect(() => {
        const dataInterval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(dataInterval);
                setIsComplete(true);
                return;
            }

            setMetrics(prev => ({
                stress: Math.max(0, prev.stress + (Math.random() * 50 - 10)),
                temp: Math.max(25, prev.temp + (Math.random() * 15 - 4)),
                deflection: Math.max(0, prev.deflection + (Math.random() * 0.001)),
            }));
        }, 750);

        return () => clearInterval(dataInterval);
    }, [progress]);
    
    const value = { metrics, progress, setProgress, isComplete };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
};

export const useSimulation = () => {
    return useContext(SimulationContext);
};
