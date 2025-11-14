import React, { createContext, useState, useContext, useEffect } from 'react';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
    const [metrics, setMetrics] = useState({
        stress: 0,
        temp: 25,
        wear: 0,
        deflection: 0,
    });
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [activeSimulationId, setActiveSimulationId] = useState(null);
    const [status, setStatus] = useState('IDLE'); // IDLE, STARTING, RUNNING, COMPLETED, FAILED

    // Function to be called when a user starts a new simulation
    const trackSimulation = (id) => {
        setActiveSimulationId(id);
        setProgress(0);
        setIsComplete(false);
        setStatus('STARTING');
        setMetrics({ stress: 0, temp: 25, wear: 0, deflection: 0 });
    };

    useEffect(() => {
        if (!activeSimulationId || isComplete || status === 'FAILED') return;

        const pollInterval = setInterval(async () => {
            try {
                const token = localStorage.getItem('accessToken');
                // Adjust URL if your API base URL is different in production
                const response = await fetch(`http://localhost:8000/simulations/${activeSimulationId}/progress`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStatus(data.status);

                    if (data.status === "COMPLETED") {
                        setIsComplete(true);
                        setProgress(100);
                    } else if (data.status === "FAILED") {
                        setIsComplete(true);
                        // Optionally set an error message here
                    } else if (data.status === "RUNNING" && data.latest_metrics) {
                        setProgress(data.progress_percentage);
                        setMetrics({
                            stress: data.latest_metrics.max_stress_MPa || 0,
                            temp: data.latest_metrics.max_temperature_C || 25,
                            wear: data.latest_metrics.total_accumulated_wear_m || 0,
                            // Mock deflection if not in metrics yet, or add to C++ engine
                            deflection: (data.latest_metrics.max_stress_MPa || 0) * 0.00001, 
                        });
                    }
                }
            } catch (error) {
                console.error("Error polling simulation progress:", error);
            }
        }, 1000); // Poll every 1 second

        return () => clearInterval(pollInterval);
    }, [activeSimulationId, isComplete, status]);
    
    const value = { 
        metrics, 
        progress, 
        isComplete, 
        status, 
        trackSimulation 
    };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
};

export const useSimulation = () => {
    return useContext(SimulationContext);
};