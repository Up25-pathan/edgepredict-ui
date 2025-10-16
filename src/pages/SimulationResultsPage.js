import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import MetricCard from '../components/results/MetricCard';
import MainResultsChart from '../components/results/MainResultsChart';
import RecommendationsPanel from '../components/results/RecommendationsPanel';
import ResultThreeDeeSnapshot from '../components/results/ResultThreeDeeSnapshot';

// Mock data representing the final output of a completed simulation
const mockResultData = {
    id: 'EM-10-4F-CARB-Al6061',
    name: 'End Mill - Aluminum 6061',
    summary: {
        'Max Von Mises Stress': { value: 854.7, unit: 'MPa' },
        'Max Temperature': { value: 472.1, unit: '°C' },
        'Tool Life Estimate': { value: 118.5, unit: 'min' },
        'Outcome': { value: 'Success', unit: '' },
    },
    // Generate a realistic-looking temperature curve over time
    timeSeriesData: Array.from({ length: 100 }, (_, i) => ({
        time: i * 1.2, // 120 minutes total simulation time
        temperature: 450 * (1 - Math.exp(-i / 20)) + 25 + (Math.random() * 20),
        stress: 800 * (1 - Math.exp(-i / 15)) + 50 + (Math.random() * 30),
    })),
    recommendations: [
        "Optimal spindle speed is within 5% of the tested value.",
        "Consider a tool with a higher helix angle for better chip evacuation.",
        "Tool wear is acceptable, but monitor flank wear after 100 minutes of use."
    ]
};

const SimulationResultsPage = () => {
    const { simulationId } = useParams();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link to="/dashboard" className="text-sm text-hud-primary hover:underline mb-2 block">&larr; Back to Dashboard</Link>
                    <h2 className="text-3xl font-bold text-hud-text-primary">Simulation Results: {mockResultData.name}</h2>
                </div>
                <Button variant="primary">Download Full Report</Button>
            </div>

            {/* Top row: KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {Object.entries(mockResultData.summary).map(([key, data]) => (
                    <MetricCard key={key} label={key} value={data.value} unit={data.unit} />
                ))}
            </div>

            {/* Main content: Chart, 3D View, and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MainResultsChart data={mockResultData.timeSeriesData} />
                </div>
                <div className="space-y-6">
                    <ResultThreeDeeSnapshot />
                    <RecommendationsPanel recommendations={mockResultData.recommendations} />
                </div>
            </div>
        </div>
    );
};

export default SimulationResultsPage;

