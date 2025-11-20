// up25-pathan/edgepredict-ui/edgepredict-ui-78e995580b3fa52516eeb83b101a6ec84adacfd4/src/pages/SimulationResultsPage.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

import LoadingPage from './LoadingPage';
import InProgressDisplay from '../components/results/InProgressDisplay';
import KeyMetric from '../components/results/KeyMetric';
import MainResultsChart from '../components/results/MainResultsChart';
import MetricCard from '../components/results/MetricCard';
import AnalysisReport from '../components/results/AnalysisReport';
import ResultThreeDeeSnapshot from '../components/results/ResultThreeDeeSnapshot';

import { 
    Thermometer, Gauge, Layers, AlertTriangle, Clock, ChevronsLeft, Wind, Sparkles,
    RotateCw 
} from 'lucide-react';

// --- PERFORMANCE FIREWALLS ---
const MemoizedChart = React.memo(MainResultsChart);
const Memoized3D = React.memo(ResultThreeDeeSnapshot);
const MemoizedAnalysisReport = React.memo(AnalysisReport);

const SimulationResultsPage = () => {
    const { id } = useParams();
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [aiReportContent, setAiReportContent] = useState(null);

    const fetchSimulation = useCallback(async (isPolling = false) => {
        try {
            if (!isPolling) setLoading(true);
            const res = await api.getSimulationById(id);
            setSimulation(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching simulation:", err);
            if (!isPolling) setError("Failed to load simulation results.");
        } finally {
            if (!isPolling) setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchSimulation(); }, [fetchSimulation]);

    useEffect(() => {
        let intervalId;
        if (simulation?.status === 'RUNNING' || simulation?.status === 'PENDING') {
            intervalId = setInterval(() => { fetchSimulation(true); }, 3000);
        }
        return () => { if (intervalId) clearInterval(intervalId); };
    }, [simulation?.status, fetchSimulation]);

    // --- DATA PROCESSING ---
    const resultString = simulation?.results;

    const { chartData, peakMetrics, cfdPeaks, finalNodeStates, meshIndices, lastParticleFrame, savedAiReport } = useMemo(() => {
        if (!resultString) {
            return { chartData: [], peakMetrics: null, cfdPeaks: null, finalNodeStates: [], meshIndices: [], lastParticleFrame: [], savedAiReport: null };
        }

        try {
            const results = typeof resultString === 'string' ? JSON.parse(resultString) : resultString;
            const timeSeriesData = results.time_series_data || [];

            // 1. Chart Downsampling (Max 100)
            const TARGET_POINTS = 100;
            const SAMPLING_RATE = Math.max(1, Math.ceil(timeSeriesData.length / TARGET_POINTS));
            
            const cleanChartData = [];
            for (let i = 0; i < timeSeriesData.length; i += SAMPLING_RATE) {
                const step = timeSeriesData[i];
                cleanChartData.push({
                    time: step.time_s || 0,
                    Stress: step.max_stress_MPa || 0,
                    Temperature: step.max_temperature_C || 0,
                    Wear: step.total_accumulated_wear_m || 0
                });
            }
            if (timeSeriesData.length > 0) {
                 const last = timeSeriesData[timeSeriesData.length - 1];
                 if (cleanChartData.length === 0 || cleanChartData[cleanChartData.length - 1].time !== last.time_s) {
                    cleanChartData.push({
                        time: last.time_s || 0,
                        Stress: last.max_stress_MPa || 0,
                        Temperature: last.max_temperature_C || 0,
                        Wear: last.total_accumulated_wear_m || 0
                    });
                 }
            }
            
            // 2. Peaks
            let maxChipTemp = 0, maxRakePress = 0, maxShearAngle = 0, maxChipVel = 0;
            let temp = 0, stress = 0, wear = 0, fractured = 0;

            for (const step of timeSeriesData) {
                if ((step.max_temperature_C || 0) > temp) temp = step.max_temperature_C;
                if ((step.max_stress_MPa || 0) > stress) stress = step.max_stress_MPa;
                if ((step.total_accumulated_wear_m || 0) > wear) wear = step.total_accumulated_wear_m;
                if ((step.cumulative_fractured_nodes || 0) > fractured) fractured = step.cumulative_fractured_nodes;

                if (step.cfd) {
                    if (step.cfd.chip_flow) {
                        const flow = step.cfd.chip_flow;
                        if ((flow.avg_chip_temperature_C || 0) > maxChipTemp) maxChipTemp = flow.avg_chip_temperature_C;
                        if ((flow.shear_angle_degrees || 0) > maxShearAngle) maxShearAngle = flow.shear_angle_degrees;
                        if ((flow.chip_velocity_m_s || 0) > maxChipVel) maxChipVel = flow.chip_velocity_m_s;
                    }
                    if (step.cfd.rake_face) {
                        if ((step.cfd.rake_face.avg_pressure_MPa || 0) > maxRakePress) maxRakePress = step.cfd.rake_face.avg_pressure_MPa;
                    }
                }
            }

            const life = results.tool_life_prediction?.predicted_hours || 0;
            const nodes = results.final_node_states || [];
            const indices = results.mesh_connectivity || [];
            
            let particles = [];
            
            // --- THIS IS THE MODIFIED SECTION ---
            // 1. Check for the NEW "visualization_data" key (from R&D Engine)
            // 2. Fall back to the OLD "cfd_particle_animation" key (from Legacy Engine)
            const vizData = results.visualization_data || results.cfd_particle_animation || [];

            if (vizData && vizData.length > 0) {
                // This assumes the new SPH data is also an array of frames
                // and we want the last one.
                const lastFrame = vizData[vizData.length - 1];
                if (lastFrame && lastFrame.particles) {
                    particles = lastFrame.particles;
                }
            }
            // --- END OF MODIFIED SECTION ---

            return { 
                chartData: cleanChartData, 
                peakMetrics: { temp, stress, wear, fractured, life },
                cfdPeaks: { maxChipTemp, maxRakePress, maxShearAngle, maxChipVel },
                finalNodeStates: nodes,
                meshIndices: indices,
                lastParticleFrame: particles,
                savedAiReport: results.ai_analysis || null
            };

        } catch (e) {
            console.error("Failed to parse results:", e);
            return { chartData: [], peakMetrics: null, cfdPeaks: null, finalNodeStates: [], meshIndices: [], lastParticleFrame: [], savedAiReport: null };
        }
    }, [resultString]);

    useEffect(() => { if (savedAiReport) setAiReportContent(savedAiReport); }, [savedAiReport]);

    useEffect(() => {
        if (simulation?.status === 'COMPLETED' && !savedAiReport && !aiReportContent && !isGeneratingReport) {
            const autoGenerate = async () => {
                setIsGeneratingReport(true);
                try {
                    const res = await api.generateReport(id);
                    setAiReportContent(res.data.analysis);
                } catch (err) { console.error("Auto-generation failed:", err); } 
                finally { setIsGeneratingReport(false); }
            };
            autoGenerate();
        }
    }, [simulation, savedAiReport, aiReportContent, isGeneratingReport, id]);

    if (loading) return <LoadingPage />;
    if (error) return <div className="p-6 text-red-400 bg-red-900/50 rounded-lg">{error}</div>;
    if (simulation?.status === 'RUNNING' || simulation?.status === 'PENDING') return <InProgressDisplay simulation={simulation} />;
    if (!simulation || !peakMetrics) return <div className="p-6">No simulation data found.</div>;

    return (
        // Bottom padding prevents scrollbar bounce when content loads
        <div className="p-4 md:p-6 space-y-8 pb-32">
            <div className="flex justify-between items-center">
                <div>
                    <Link to="/reports" className="flex items-center text-sm text-gray-400 hover:text-indigo-400 mb-1">
                        <ChevronsLeft className="w-4 h-4 mr-1" /> Back to Reports
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{simulation.name}</h1>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    simulation.status === 'COMPLETED' ? 'bg-green-600/30 text-green-300' : 'bg-yellow-600/30 text-yellow-300'
                }`}>{simulation.status}</span>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Simulation Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KeyMetric title="Predicted Life" value={`${peakMetrics.life.toFixed(1)} hr`} icon={Clock} color="text-indigo-400" />
                    <KeyMetric title="Peak Temp" value={`${peakMetrics.temp.toFixed(0)} °C`} icon={Thermometer} color="text-red-400" />
                    <KeyMetric title="Max Stress" value={`${peakMetrics.stress.toFixed(0)} MPa`} icon={Gauge} color="text-yellow-400" />
                    <KeyMetric title="Total Wear" value={(peakMetrics.wear * 1e6) < 0.001 ? (peakMetrics.wear === 0 ? "0.000 μm" : "< 0.001 μm") : `${(peakMetrics.wear * 1e6).toFixed(3)} μm`} icon={Layers} color="text-blue-400" />
                    <KeyMetric title="Fractures" value={String(peakMetrics.fractured)} icon={AlertTriangle} color="text-orange-400" />
                </div>
                
                {cfdPeaks && cfdPeaks.maxChipTemp > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <MetricCard title="Peak Chip Temp" value={cfdPeaks.maxChipTemp.toFixed(0)} unit="°C" icon={Thermometer} />
                        <MetricCard title="Peak Rake Pressure" value={cfdPeaks.maxRakePress.toFixed(0)} unit="MPa" icon={Gauge} />
                        <MetricCard title="Max Shear Angle" value={cfdPeaks.maxShearAngle.toFixed(1)} unit="deg" icon={RotateCw} />
                        <MetricCard title="Max Chip Velocity" value={cfdPeaks.maxChipVel.toFixed(2)} unit="m/s" icon={Wind} />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex justify-between items-center">
                    <span>3D Interaction</span>
                    <span className="text-xs font-normal text-gray-500">Scroll to zoom • Drag to rotate</span>
                </h3>
                <div className="w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                    <Memoized3D 
                        nodeData={finalNodeStates}
                        meshIndices={meshIndices}
                        particleData={lastParticleFrame}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Performance Timeline</h3>
                <div 
                    className="w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
                    style={{ height: '400px' }}
                >
                    <MemoizedChart data={chartData} />
                </div>
            </div>

            {/* Report Section */}
            <div className="space-y-4" style={{ minHeight: '200px', contain: 'content' }}>
                 <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
                        Expert AI Analysis
                    </h3>
                    {isGeneratingReport && (
                        <span className="text-xs text-indigo-400 animate-pulse flex items-center">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                            Analyzing simulation data...
                        </span>
                    )}
                </div>
                <MemoizedAnalysisReport 
                    simulationData={simulation} 
                    peakMetrics={peakMetrics}
                    reportContentOverride={aiReportContent} 
                    isGenerating={isGeneratingReport}
                />
            </div>
        </div>
    );
};

export default SimulationResultsPage;