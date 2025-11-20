import React from 'react';
import { SimulationProvider } from '../context/SimulationContext';
import ThreeDeeViewer from '../components/simulation/ThreeDeePlayer';
import RealTimeMetrics from '../components/simulation/RealTimeMetrics';
import SimulationStatus from '../components/simulation/SimulationStatus';

const SimulationInProgressPage = () => {
    return (
        // Wrap the entire page in our new provider to manage live state
        <SimulationProvider>
            <div>
                <h2 className="text-2xl font-bold text-hud-text-primary mb-4">Simulation Lab: Live Analysis</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ThreeDeeViewer />
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <SimulationStatus />
                        <RealTimeMetrics />
                    </div>
                </div>
            </div>
        </SimulationProvider>
    );
};

export default SimulationInProgressPage;

