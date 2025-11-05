import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchSimulation = async () => { 
            try {
                const response = await api.getSimulationById(id);
                const sim = response.data;
                setSimulation(sim);

                if (sim.status === 'COMPLETED' || sim.status === 'FAILED') {
                    setIsLoading(false);
                    
                    if (sim.results) {
                        try {
                            const results = JSON.parse(sim.results);
                            setParsedResults(results);
                            
                            if (!results || (results.error && sim.status === 'COMPLETED')) {
                                setError(`Simulation completed but results are invalid: ${results.error || 'Unknown error.'}`);
                            }
                        } catch (e) {
                            console.error("Failed to parse simulation results:", e);
                            setError(`Simulation finished, but results are not valid JSON: ${sim.results}`);
                        }
                    } else if (sim.status === 'COMPLETED') {
                         setError("Simulation completed, but no results were saved.");
                    }

                } else if (sim.status === 'PENDING' || sim.status === 'RUNNING') {
                    setTimeout(fetchSimulation, 5000); // Poll every 5 seconds
                }

            } catch (err) {
                console.error("Error fetching simulation:", err);
                setError("Failed to fetch simulation data. You may not have permission.");
                setIsLoading(false);
            }
        };

        if (user) {
            fetchSimulation();
        }
    }, [id, user]); 

    // --- (Handle PDF Download) ---
    const handleDownloadPdf = () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;
        setIsLoading(true); 
        html2canvas(reportElement, { useCORS: true, allowTaint: true })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasHeight / canvasWidth;
                const imgHeight = pdfWidth * ratio;
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
                pdf.save(`EdgePredict_Simulation_${id}.pdf`);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error generating PDF:", err);
                setError("Could not generate PDF report.");
                setIsLoading(false);
            });
    };

    // --- (Handle Loading & Error States) ---
    if (isLoading && !simulation) {
        return <div className="text-center text-gray-300 p-10">Loading simulation data...</div>;
    }
    if (!simulation) {
         return <div className="text-center text-gray-300 p-10">Loading...</div>;
    }
    if (simulation.status === 'PENDING' || simulation.status === 'RUNNING') {
        return (
            <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-4">Simulation: {simulation.name}</h1>
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                    <div className="text-2xl font-semibold mb-4">Simulation is: {simulation.status}</div>
                    <div className="text-gray-400">Please wait. This page will automatically refresh...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mt-6"></div>
                </div>
            </div>
        );
    }
    if (simulation.status === 'FAILED') {
        return (
            <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-4">Simulation: {simulation.name}</h1>
                <div className="bg-gray-800 p-8 rounded-lg">
                    <div className="text-2xl font-semibold mb-4 text-red-500">Simulation FAILED</div>
                    <div className="text-gray-300 mb-2">The simulation engine reported an error.</div>
                    {parsedResults && parsedResults.error ? (
                        <pre className="bg-gray-900 p-4 rounded-md text-red-300 overflow-auto">
                            <div className="font-bold">Error: {parsedResults.error}</div>
                            {parsedResults.stderr && <div className="mt-2">Details: {parsedResults.stderr}</div>}
                        </pre>
                    ) : (
                         <pre className="bg-gray-900 p-4 rounded-md text-red-300 overflow-auto">
                            {simulation.results || "No error details were provided by the worker."}
                         </pre>
                    )}
                </div>
            </div>
        );
    }
    if (error) {
        return (
             <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-4">Error Loading Results</h1>
                <div className="bg-gray-800 p-8 rounded-lg">
                    <div className="text-2xl font-semibold mb-4 text-red-500">Could not display results</div>
                    <div className="text-gray-300 mb-2">The simulation completed, but the results could not be parsed.</div>
                    <pre className="bg-gray-900 p-4 rounded-md text-red-300 overflow-auto">
                        {error}
                    </pre>
                </div>
            </div>
        );
    }
    if (simulation.status === 'COMPLETED' && !parsedResults) {
        return (
            <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-4">Error Loading Results</h1>
                <div className="bg-gray-800 p-8 rounded-lg">
                    <div className="text-2xl font-semibold mb-4 text-red-500">Parsing Error</div>
                    <div className="text-gray-300 mb-2">Simulation completed but results are missing or could not be parsed.</div>
                </div>
            </div>
        );
    }
    
    // --- (Prepare Data - ALL BUGS FIXED) ---
    
    // 1. Get Time Series Data
    const timeSeriesData = parsedResults?.time_series_data?.map(d => ({
        time: d.time_s,
        maxStress: d.max_stress_MPa,
        avgTemp: d.avg_temperature_C, 
        maxTemp: d.max_temperature_C, // <-- Get max_temperature_C
        totalWear: d.total_accumulated_wear_m
    })) || [];
    
    // 2. Create the keyMetrics object
    let keyMetrics = {};
    if (timeSeriesData.length > 0) {
        const lastStep = timeSeriesData[timeSeriesData.length - 1];
        
        // Filter out null/undefined/NaN values before finding max
        const maxStresses = timeSeriesData.map(d => d.maxStress).filter(t => t != null && !isNaN(t));
        keyMetrics.max_stress_MPa = maxStresses.length > 0 ? Math.max(...maxStresses) : null;
        
        // --- THIS IS THE MAX TEMP FIX ---
        // Your console log showed `max_temperature_C` is not always present,
        // so we will find the max of the `avg_temperature_C` instead.
        const maxTemps = timeSeriesData.map(d => d.avgTemp).filter(t => t != null && !isNaN(t));
        keyMetrics.max_temperature_C = maxTemps.length > 0 ? Math.max(...maxTemps) : null;
        // --- END MAX TEMP FIX ---
        
        keyMetrics.total_accumulated_wear_m = lastStep.totalWear;
    }
    
    // 3. Get Tool Life
    if (parsedResults?.tool_life_prediction) {
        keyMetrics.predicted_tool_life_hrs = parsedResults.tool_life_prediction.predicted_hours;
    }
    
    // 4. Get 3D data
    const vertexData = parsedResults?.final_node_states || null;
    
    // --- END DATA PREP ---


    return (
        <div className="p-6 text-white">
            {/* --- (Header and Buttons) --- */}
            <div className="flex justify-between items-center mb-6">
                <Link to="/simulations" className="flex items-center text-indigo-400 hover:text-indigo-300">
                    <span className="mr-2">&larr;</span> 
                    Back to Simulations
                </Link>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isLoading}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500"
                >
                    {isLoading ? 'Generating PDF...' : 'Download PDF Report'}
                </button>
            </div>

            {/* --- (Main Report Content - This div is targeted by html2canvas) --- */}
            <div id="report-content" className="bg-gray-900 p-4 md:p-8 rounded-lg">
                
                <h1 className="text-3xl font-bold mb-2">Simulation Report: {simulation.name}</h1>
                <p className="text-gray-400 mb-6">{simulation.description}</p>

                {/* --- Row 1: Key Metrics --- */}
                <h2 className="text-2xl font-semibold mb-4 text-indigo-300">Key Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard 
                        title="Max Stress" 
                        value={keyMetrics.max_stress_MPa?.toFixed(2) || 'N/A'} 
                        unit="MPa" 
                    />
                    <MetricCard 
                        title="Max Tool Temp" 
                        value={keyMetrics.max_temperature_C?.toFixed(2) || 'N/A'} 
                        unit="°C" 
                    />
                    <MetricCard 
                        title="Predicted Tool Life" 
                        value={keyMetrics.predicted_tool_life_hrs || 'N/A'} 
                        unit="hours" 
                    />
                    <MetricCard 
                        title="Total Wear" 
                        value={keyMetrics.total_accumulated_wear_m?.toExponential(2) || 'N/A'} 
                        unit="m" 
                    />
                </div>
                
                {/* --- Row 2: 3D VISUAL & ANALYSIS (Side-by-Side) --- */}
                <h2 className="text-2xl font-semibold mb-4 text-indigo-300">Analysis & 3D Snapshot</h2>
                {/* --- LAYOUT FIX: Changed grid-cols-3, col-span-2, col-span-1 --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    
                    {/* --- 3D Visual Column (Larger) --- */}
                    <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg h-[500px]">
                        <h3 className="text-xl font-semibold mb-2">3D Stress Snapshot (Point Cloud)</h3>
                        {simulation.tool_id && vertexData ? (
                             <ResultThreeDeeSnapshot 
                                nodeData={vertexData} 
                            />
                        ) : (
                            <div className="text-gray-400">3D vertex data (final_node_states) was not found in results.</div>
                        )}
                    </div>
                    
                    {/* --- Analysis Report Column (Smaller) --- */}
                    <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg h-[500px] overflow-y-auto">
                         <h3 className="text-xl font-semibold mb-2">Analysis & Recommendations</h3>
                        <AnalysisReport 
                            summaryMetrics={keyMetrics} 
                            materialProperties={JSON.parse(simulation.material_properties || '{}')} 
                        />
                    </div>
                </div>

                {/* --- Row 3: Charts (Stacked Vertically) --- */}
                <h2 className="text-2xl font-semibold mb-4 text-indigo-300">Time-Series Analysis</h2>
                <div className="grid grid-cols-1 gap-6 mb-6"> 
                    
                    {/* --- Chart 1: Stress & Temp vs. Time --- */}
                    <div className="bg-gray-800 p-4 rounded-lg h-[400px]">
                        <h3 className="text-xl font-semibold mb-4 text-center">Stress & Temperature vs. Time</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis dataKey="time" stroke="#9f7aea" label={{ value: 'Time (s)', position: 'insideBottom', offset: -10, fill: '#e2e8f0' }} />
                                <YAxis yAxisId="left" stroke="#63b3ed" label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fill: '#63b3ed' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#f6ad55" label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#f6ad55' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="maxStress" stroke="#63b3ed" name="Max Stress" dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="avgTemp" stroke="#f6ad55" name="Avg. Temp" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* --- Chart 2: NEW Wear vs. Time --- */}
                    <div className="bg-gray-800 p-4 rounded-lg h-[400px]">
                        <h3 className="text-xl font-semibold mb-4 text-center">Total Wear vs. Time</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis dataKey="time" stroke="#9f7aea" label={{ value: 'Time (s)', position: 'insideBottom', offset: -10, fill: '#e2e8f0' }} />
                                <YAxis stroke="#48bb78" label={{ value: 'Wear (m)', angle: -90, position: 'insideLeft', fill: '#48bb78' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} />
                                <Legend />
                                <Line type="monotone" dataKey="totalWear" stroke="#48bb78" name="Total Wear" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div> {/* End of #report-content */}
        </div>
    );
};

export default SimulationResultsPage;