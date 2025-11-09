import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

// Import all the components this page uses
import LoadingPage from './LoadingPage';
import KeyMetric from '../components/results/KeyMetric';
import MainResultsChart from '../components/results/MainResultsChart';
import MetricCard from '../components/results/MetricCard';
import AnalysisReport from '../components/results/AnalysisReport';
import ResultThreeDeeSnapshot from '../components/results/ResultThreeDeeSnapshot';

import { 
    Thermometer, 
    Gauge, 
    Layers, 
    AlertTriangle, 
    Clock, 
    ChevronsLeft,
    Wind // Icon for CFD
} from 'lucide-react';

const SimulationResultsPage = () => {
    const { id } = useParams();
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSimulation = async () => {
            try {
                setLoading(true);
                const res = await api.getSimulationById(id);
                setSimulation(res.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching simulation:", err);
                setError("Failed to load simulation results. Please try again.");
            }
            setLoading(false);
        };
        fetchSimulation();
    }, [id]);

    const { chartData, peakMetrics, cfdMetrics } = useMemo(() => {
        if (!simulation || !simulation.results) {
            return { chartData: [], peakMetrics: null, cfdMetrics: null };
        }

        try {
            const results = JSON.parse(simulation.results);
            const timeSeriesData = results.time_series_data;
            if (!timeSeriesData) {
                 return { chartData: [], peakMetrics: null, cfdMetrics: null };
            }

            // 1. Prepare Chart Data
            const cleanChartData = timeSeriesData.map(step => ({
                time: step.time_s || 0,
                Stress: step.max_stress_MPa || 0,
                Temperature: step.max_temperature_C || 0,
                Wear: step.total_accumulated_wear_m || 0
            }));
            
            // 2. Calculate Standard Peak Metrics
            const metrics = timeSeriesData.reduce((acc, step) => ({
                temp: Math.max(acc.temp, step.max_temperature_C || 0),
                stress: Math.max(acc.stress, step.max_stress_MPa || 0),
                wear: Math.max(acc.wear, step.total_accumulated_wear_m || 0),
                fractured: Math.max(acc.fractured, step.cumulative_fractured_nodes || 0)
            }), { temp: 0, stress: 0, wear: 0, fractured: 0 });

            const life = results.tool_life_prediction?.predicted_hours || 0;

            // 3. Extract Latest CFD Metrics (from the last step that has them)
            let latestCfd = {};
            for (let i = timeSeriesData.length - 1; i >= 0; i--) {
                if (timeSeriesData[i].cfd) {
                    latestCfd = timeSeriesData[i].cfd;
                    break;
                }
            }

            return { 
                chartData: cleanChartData, 
                peakMetrics: { ...metrics, life },
                cfdMetrics: latestCfd
            };

        } catch (e) {
            console.error("Failed to parse simulation results:", e);
            setError("Failed to parse simulation results JSON.");
            return { chartData: [], peakMetrics: null, cfdMetrics: null };
        }
    }, [simulation]);

    if (loading) return <LoadingPage />;
    if (error) return <div className="p-6 text-red-400 bg-red-900/50 rounded-lg">{error}</div>;
    if (!simulation || !peakMetrics) return <div className="p-6">No simulation data found.</div>;

    return (
        // --- THIS IS THE FIX ---
        // Removed max-w-[1400px] and mx-auto to make the layout full-width
        <div className="p-4 md:p-6 space-y-8">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center">
                <div>
                    <Link 
                        to="/reports" 
                        className="flex items-center text-sm text-gray-400 hover:text-indigo-400 mb-1"
                    >
                        <ChevronsLeft className="w-4 h-4 mr-1" />
                        Back to Reports
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{simulation.name}</h1>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    simulation.status === 'COMPLETED' ? 'bg-green-600/30 text-green-300' : 'bg-yellow-600/30 text-yellow-300'
                }`}>
                    {simulation.status}
                </span>
            </div>

            {/* --- SECTION 1: ALL METRICS (Top Summary) --- */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">
                    Simulation Summary
                </h3>
                {/* Primary Physics Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KeyMetric title="Predicted Life" value={`${peakMetrics.life.toFixed(1)} hr`} icon={Clock} color="text-indigo-400" />
                    <KeyMetric title="Peak Temp" value={`${peakMetrics.temp.toFixed(0)} °C`} icon={Thermometer} color="text-red-400" />
                    <KeyMetric title="Max Stress" value={`${peakMetrics.stress.toFixed(0)} MPa`} icon={Gauge} color="text-yellow-400" />
                    <KeyMetric title="Total Wear" value={`${(peakMetrics.wear * 1e6).toFixed(1)} μm`} icon={Layers} color="text-blue-400" />
                    <KeyMetric title="Fractures" value={peakMetrics.fractured} icon={AlertTriangle} color="text-orange-400" />
                </div>
                {/* Secondary CFD Metrics (if available) */}
                {cfdMetrics && cfdMetrics.chip_flow && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <MetricCard title="Chip Temp" value={cfdMetrics.chip_flow.avg_chip_temperature_C?.toFixed(0) || 'N/A'} unit="°C" icon={Wind} />
                        <MetricCard title="Rake Pressure" value={cfdMetrics.rake_face?.avg_pressure_MPa?.toFixed(0) || 'N/A'} unit="MPa" />
                        <MetricCard title="Shear Angle" value={cfdMetrics.chip_flow.shear_angle_degrees?.toFixed(1) || 'N/A'} unit="deg" />
                        <MetricCard title="Chip Velocity" value={cfdMetrics.chip_flow.chip_velocity_m_s?.toFixed(2) || 'N/A'} unit="m/s" />
                    </div>
                )}
            </div>

            {/* --- SECTION 2: 3D VISUALIZATION (Large & Prominent) --- */}
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex justify-between items-center">
                    <span>3D Interaction</span>
                    <span className="text-xs font-normal text-gray-500">Scroll to zoom • Drag to rotate</span>
                </h3>
                <div className="w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                    <ResultThreeDeeSnapshot />
                </div>
            </div>

            {/* --- SECTION 3: PERFORMANCE CHART (Full Width) --- */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">
                    Performance Timeline
                </h3>
                <div className="w-full h-[400px] bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <MainResultsChart data={chartData} />
                </div>
            </div>

            {/* --- SECTION 4: AI ANALYSIS REPORT --- */}
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">
                    Expert Analysis
                </h3>
                <AnalysisReport 
                    simulationData={simulation} 
                    peakMetrics={peakMetrics} 
                />
            </div>
        </div>
    );
};

export default SimulationResultsPage;