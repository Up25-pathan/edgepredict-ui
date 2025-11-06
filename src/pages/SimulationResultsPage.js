import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- (Import components) ---
import AnalysisReport from '../components/results/AnalysisReport';
import MetricCard from '../components/results/MetricCard';
import ResultThreeDeeSnapshot from '../components/results/ResultThreeDeeSnapshot';

// --- (jsPDF imports) ---
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- (Recharts components) ---
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SimulationResultsPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [simulation, setSimulation] = useState(null);
    const [parsedResults, setParsedResults] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Use a ref to track mounted state for safe async state updates
    const isMounted = useRef(true);
    // Use a ref for the polling timer so we can clear it easily
    const pollTimer = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (pollTimer.current) clearTimeout(pollTimer.current);
        };
    }, []);

    const fetchSimulation = useCallback(async () => {
        try {
            const response = await api.getSimulationById(id);
            if (!isMounted.current) return;

            const sim = response.data;
            setSimulation(sim);

            if (sim.status === 'COMPLETED' || sim.status === 'FAILED') {
                setIsLoading(false);

                if (sim.results) {
                    try {
                        // Only parse if we haven't already to save re-renders
                        const results = typeof sim.results === 'string' ? JSON.parse(sim.results) : sim.results;
                        setParsedResults(results);

                        if (sim.status === 'COMPLETED' && (!results || results.error)) {
                            setError(`Simulation reported complete, but results indicate failure: ${results?.error || 'Unknown error'}`);
                        }
                    } catch (e) {
                        console.error("Failed to parse simulation results:", e);
                        setError("Failed to parse simulation results data.");
                    }
                } else if (sim.status === 'COMPLETED') {
                    setError("Simulation marked as complete, but no results data was found.");
                }
            } else {
                // Still running, poll again in 3 seconds
                pollTimer.current = setTimeout(fetchSimulation, 3000);
            }

        } catch (err) {
            if (!isMounted.current) return;
            console.error("Error fetching simulation:", err);
            setError(err.response?.data?.detail || "Failed to fetch simulation status.");
            setIsLoading(false);
        }
    }, [id]);

    // Initial fetch on mount
    useEffect(() => {
        if (user) {
            setIsLoading(true);
            fetchSimulation();
        }
    }, [fetchSimulation, user]);


    // --- (Handle PDF Download) ---
    const handleDownloadPdf = async () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;

        try {
            setIsGeneratingPdf(true);
            const canvas = await html2canvas(reportElement, {
                useCORS: true,
                allowTaint: true,
                scale: 2 // Higher resolution
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`EdgePredict_Report_${simulation?.name.replace(/\s+/g, '_') || id}.pdf`);

        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Could not generate PDF. Please try again.");
        } finally {
            if (isMounted.current) setIsGeneratingPdf(false);
        }
    };

    // --- (Prepare Data Safely) ---
    const timeSeriesData = (parsedResults?.time_series_data || []).map(d => ({
        time: d.time_s ?? 0,
        maxStress: d.max_stress_MPa ?? 0,
        avgTemp: d.avg_temperature_C ?? 0,
        maxTemp: d.max_temperature_C ?? (d.avg_temperature_C ?? 0),
        totalWear: d.total_accumulated_wear_m ?? 0
    }));

    let keyMetrics = {
        max_stress_MPa: 'N/A',
        max_temperature_C: 'N/A',
        total_accumulated_wear_m: 'N/A',
        predicted_tool_life_hrs: 'N/A'
    };

    if (simulation?.status === 'COMPLETED' && parsedResults) {
        if (timeSeriesData.length > 0) {
            const maxStresses = timeSeriesData.map(d => d.maxStress);
            keyMetrics.max_stress_MPa = Math.max(...maxStresses) || 0;

            const maxTemps = timeSeriesData.map(d => d.maxTemp);
            keyMetrics.max_temperature_C = Math.max(...maxTemps) || 0;

            keyMetrics.total_accumulated_wear_m = timeSeriesData[timeSeriesData.length - 1]?.totalWear || 0;
        }

        keyMetrics.predicted_tool_life_hrs = parsedResults?.tool_life_prediction?.predicted_hours ?? 'N/A';
    }

    // --- Render States ---

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                <p>Loading simulation data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-white">
                <div className="bg-red-900/30 border border-red-500 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Simulation</h2>
                    <p className="text-gray-300">{error}</p>
                    <Link to="/simulations" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
                        &larr; Return to Simulations
                    </Link>
                </div>
            </div>
        );
    }

    if (simulation?.status === 'FAILED') {
        return (
            <div className="p-6 text-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{simulation.name}</h1>
                    <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500">
                        FAILED
                    </span>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-red-500/50">
                    <h3 className="text-xl font-semibold mb-4">Failure Details</h3>
                    <div className="bg-gray-950 p-4 rounded font-mono text-sm text-red-300 overflow-auto max-h-[500px]">
                        {parsedResults?.error || parsedResults?.stderr || simulation.results || "Unknown error occurred during execution."}
                    </div>
                </div>
            </div>
        );
    }

    if (simulation?.status === 'PENDING' || simulation?.status === 'RUNNING') {
        return (
            <div className="p-6 text-white max-w-4xl mx-auto mt-10">
                <div className="bg-gray-800 p-10 rounded-xl shadow-2xl text-center border border-indigo-500/30">
                    <h1 className="text-3xl font-bold mb-6">{simulation.name}</h1>
                    
                    <div className="relative mx-auto w-32 h-32 mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                        <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg tracking-wider">
                            {simulation.status}
                        </div>
                    </div>

                    <p className="text-gray-400 text-lg animate-pulse">
                        {simulation.status === 'PENDING' 
                            ? "Queued for execution..." 
                            : "Physics engine is running..."}
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        This page will automatically refresh when results are ready.
                    </p>
                </div>
            </div>
        );
    }

    // --- COMPLETED STATE (Main Render) ---

    // 4. Get 3D Tool Data
    const vertexData = parsedResults?.final_node_states || null;

    // 5. Get 3D CFD Particle Data
    const particleFrames = parsedResults?.cfd_particle_animation || [];
    const lastFrame = particleFrames.length > 0 ? particleFrames[particleFrames.length - 1] : null;
    const particleData = lastFrame?.particles || null;

    return (
        <div className="p-6 text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold">{simulation.name}</h1>
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm font-bold border border-green-500">
                            COMPLETED
                        </span>
                    </div>
                    <p className="text-gray-400 max-w-2xl">{simulation.description}</p>
                </div>
                <div className="flex gap-4">
                    <Link 
                        to="/simulations" 
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                        Back to List
                    </Link>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        className={`px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-colors flex items-center gap-2 ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isGeneratingPdf ? (
                            <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Generating...</>
                        ) : (
                            <>Download PDF Report</>
                        )}
                    </button>
                </div>
            </div>

            {/* Report Content Container */}
            <div id="report-content" className="space-y-8">
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Max Von Mises Stress"
                        value={typeof keyMetrics.max_stress_MPa === 'number' ? keyMetrics.max_stress_MPa.toFixed(1) : 'N/A'}
                        unit="MPa"
                        icon="⚡"
                        color="blue"
                    />
                    <MetricCard
                        title="Peak Tool Temperature"
                        value={typeof keyMetrics.max_temperature_C === 'number' ? keyMetrics.max_temperature_C.toFixed(1) : 'N/A'}
                        unit="°C"
                        icon="🔥"
                        color="orange"
                    />
                    <MetricCard
                        title="Predicted Tool Life"
                        value={typeof keyMetrics.predicted_tool_life_hrs === 'number' ? keyMetrics.predicted_tool_life_hrs.toFixed(1) : 'N/A'}
                        unit="hours"
                        icon="⏳"
                        color="green"
                    />
                    <MetricCard
                        title="Total Flank Wear"
                        value={typeof keyMetrics.total_accumulated_wear_m === 'number' ? (keyMetrics.total_accumulated_wear_m * 1000).toFixed(3) : 'N/A'}
                        unit="mm"
                        icon="📉"
                        color="red"
                    />
                </div>

                {/* Main Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 3D Viewer - Takes 2/3 width on large screens */}
                    <div className="lg:col-span-2 bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 flex flex-col h-[600px]">
                        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg">3D Stress Analysis State (Final Step)</h3>
                            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-900 rounded">
                                {parsedResults?.final_node_states?.length || 0} nodes
                            </span>
                        </div>
                        <div className="flex-grow relative h-full w-full min-h-[500px]">
                            {(vertexData || particleData) ? (
                                <ResultThreeDeeSnapshot 
                                    nodeData={vertexData} 
                                    particleData={particleData} 
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-900/50">
                                    <div className="text-center">
                                        <p className="text-xl mb-2">No 3D Data Available</p>
                                        <p className="text-sm">The simulation did not return any node state data.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Analysis Report - Takes 1/3 width */}
                    <div className="lg:col-span-1 bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 h-[600px] overflow-y-auto custom-scrollbar">
                        <h3 className="font-bold text-xl mb-4 text-indigo-300">Engineering Report</h3>
                        <AnalysisReport
                            summaryMetrics={keyMetrics}
                            materialProperties={typeof simulation.material_properties === 'string' 
                                ? JSON.parse(simulation.material_properties) 
                                : simulation.material_properties}
                        />
                    </div>
                </div>

                {/* Charts Section - Stacked vertically */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Chart 1 */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
                        <h3 className="font-bold text-lg mb-6 text-center">Thermo-Mechanical History</h3>
                        <div className="h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis 
                                        dataKey="time" 
                                        stroke="#9ca3af" 
                                        label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -20, fill: '#9ca3af' }} 
                                    />
                                    <YAxis 
                                        yAxisId="left" 
                                        stroke="#60a5fa" 
                                        label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fill: '#60a5fa' }} 
                                    />
                                    <YAxis 
                                        yAxisId="right" 
                                        orientation="right" 
                                        stroke="#f97316" 
                                        label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight', fill: '#f97316' }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                        itemStyle={{ color: '#e5e7eb' }}
                                        labelStyle={{ color: '#9ca3af' }}
                                    />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Line yAxisId="left" type="monotone" dataKey="maxStress" stroke="#60a5fa" name="Max Stress (MPa)" dot={false} strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="maxTemp" stroke="#f97316" name="Max Temp (°C)" dot={false} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 2 */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
                        <h3 className="font-bold text-lg mb-6 text-center">Progressive Tool Wear</h3>
                        <div className="h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 30, bottom: 25 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis 
                                        dataKey="time" 
                                        stroke="#9ca3af" 
                                        label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -20, fill: '#9ca3af' }} 
                                    />
                                    <YAxis 
                                        stroke="#34d399" 
                                        label={{ value: 'Accumulated Wear (m)', angle: -90, position: 'insideLeft', offset: 10, fill: '#34d399' }} 
                                        tickFormatter={(value) => value.toExponential(1)} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                        formatter={(value) => [value.toExponential(4) + ' m', 'Total Wear']}
                                    />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Line type="monotone" dataKey="totalWear" stroke="#34d399" name="Cumulative Wear (meters)" dot={false} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationResultsPage;
