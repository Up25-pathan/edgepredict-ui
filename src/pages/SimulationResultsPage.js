import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useParams, Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import Card from '../components/common/Card';
import ResultThreeDeeSnapshot from '../components/results/ResultThreeDeeSnapshot';
import AnalysisReport from '../components/results/AnalysisReport';
import InProgressDisplay from '../components/results/InProgressDisplay';

// MaxStressChart component
const MaxStressChart = ({ data }) => {
     if (!Array.isArray(data) || data.length === 0) {
        return <div className="text-center text-gray-500 pt-10">No stress data available.</div>;
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="step" stroke="#9CA3AF" label={{ value: 'Simulation Step (Time)', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}/>
                <YAxis stroke="#9CA3AF" label={{ value: 'Max Stress (MPa)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} domain={['auto', 'auto']}/>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '4px' }} itemStyle={{ color: '#e5e7eb'}} formatter={(value) => [`${value?.toFixed(2) ?? 'N/A'} MPa`, 'Max Stress']}/>
                <Line type="monotone" dataKey="max_stress_MPa" stroke="#818CF8" strokeWidth={2} dot={false} connectNulls/>
            </LineChart>
        </ResponsiveContainer>
    );
};


// safeToExponential helper
const safeToExponential = (value, digits) => {
  if (typeof value !== 'number' || isNaN(value) || value === null) {
    return '0.00e+0';
  }
  return value.toExponential(digits);
};

// ToolLifeChart component
const ToolLifeChart = ({ data }) => {
     if (!Array.isArray(data) || data.length === 0) {
        return <div className="text-center text-gray-500 pt-10">No wear data available.</div>;
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="step" stroke="#9CA3AF" label={{ value: 'Simulation Step (Time)', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}/>
                <YAxis stroke="#9CA3AF" label={{ value: 'Total Wear', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} domain={['auto', 'auto']} tickFormatter={(value) => safeToExponential(value, 2)}/>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '4px' }} itemStyle={{ color: '#e5e7eb'}} formatter={(value, name) => [safeToExponential(value, 4), 'Total Wear']}/>
                <Line type="monotone" dataKey="total_accumulated_wear" name="Total Wear" stroke="#A78BFA" strokeWidth={2} dot={false} connectNulls/>
            </LineChart>
        </ResponsiveContainer>
    );
};


// SimulationResultsPage component
const SimulationResultsPage = () => {
    // Hooks and state
    const { id } = useParams();
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [parsedResults, setParsedResults] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const analysisReportRef = useRef(null);
    const threeDCanvasRef = useRef(null);
    const stressChartRef = useRef(null);
    const wearChartRef = useRef(null);
    const intervalRef = useRef(null);

    // useEffect for fetching data (robust version)
    useEffect(() => {
        let isMounted = true;
        const clearPollingInterval = () => {
            if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        };
        const fetchSimulationData = async () => {
             if (isMounted && loading) setLoading(true); // Only set loading true initially
             try {
                const response = await api.getSimulationById(id);
                if (!isMounted) return;
                const currentSimData = response.data;
                 // Prevent unnecessary state updates if data hasn't changed
                 setSimulation(prevSim => JSON.stringify(prevSim) !== JSON.stringify(currentSimData) ? currentSimData : prevSim);

                if (currentSimData.results && (!parsedResults || simulation?.status !== currentSimData.status)) {
                    try { setParsedResults(JSON.parse(currentSimData.results)); }
                    catch (parseError) { console.error("Parse Error:", parseError); setError('Failed to parse results.'); setParsedResults(null); }
                } else if (!currentSimData.results) { setParsedResults(null); }

                 setLoading(false); // Stop loading indicator AFTER first fetch attempt

                if (currentSimData.status === 'PENDING' || currentSimData.status === 'RUNNING') {
                    if (!intervalRef.current) { intervalRef.current = setInterval(fetchSimulationData, 5000); }
                } else { clearPollingInterval(); }
            } catch (err) {
                 if (!isMounted) return;
                console.error("Fetch Error:", err); setError('Failed to load simulation data.');
                setLoading(false); clearPollingInterval();
            }
        };
        fetchSimulationData(); // Initial fetch
        return () => { isMounted = false; clearPollingInterval(); }; // Cleanup
    }, [id]); // Dependency array should ONLY contain id


    // useMemo for parsing results (robust version)
    const { metrics, materialProps, timeSeriesData } = useMemo(() => {
         if (!parsedResults || !Array.isArray(parsedResults.nodes) || !Array.isArray(parsedResults.time_series_data) || !simulation || !simulation.material_properties) {
            return { metrics: null, materialProps: null, timeSeriesData: [] };
        }
        let uts = 0, material = null;
        try { material = JSON.parse(simulation.material_properties); uts = material?.failure_criterion?.ultimate_tensile_strength_MPa || 0; }
        catch (e) { material = null; }
        const stresses = parsedResults.nodes.map(n => n?.stress_MPa ?? 0);
        const validStresses = stresses.filter(s => typeof s === 'number');
        return {
            metrics: {
                maxStress: validStresses.length > 0 ? Math.max(...validStresses) : 0,
                fracturedNodes: parsedResults.nodes.filter(n => n?.status === 'FRACTURED').length,
                totalNodes: parsedResults.nodes.length,
                uts: uts,
            }, materialProps: material, timeSeriesData: parsedResults.time_series_data
        };
    }, [parsedResults, simulation]) || { metrics: null, materialProps: null, timeSeriesData: [] };


    // handleDownloadPDF function
    const handleDownloadPDF = async () => {
        if (!analysisReportRef.current || !threeDCanvasRef.current || !stressChartRef.current || !wearChartRef.current) {
            setError("Cannot generate PDF: Components not ready."); return;
        }
        setIsDownloading(true); setError(''); // Clear previous errors
        const pdf = new jsPDF('p', 'mm', 'a4');
        const { width: pageWidth, height: pageHeight } = pdf.internal.pageSize;
        const margin = 10; const contentWidth = pageWidth - margin * 2;
        let currentY = margin + 30; // Start below header

        pdf.setFontSize(18); pdf.text(simulation?.name ?? 'Simulation Report', margin, margin + 10);
        pdf.setFontSize(10); pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 18);

        const addImageToPdf = async (element, title) => {
             // Add space before section if not the first element
             if (currentY > margin + 30) currentY += 5;

            // Render title
             pdf.setFontSize(12);
             pdf.setTextColor(40); // Dark gray
             pdf.text(title, margin, currentY);
             currentY += 6; // Space after title

            let canvas, imgData, imgHeight, imgWidth;

            if (element === threeDCanvasRef.current) { // Special handling for canvas
                 canvas = element;
                 imgData = canvas.toDataURL('image/png', 1.0);
                 imgWidth = contentWidth; // Scale to content width
                 imgHeight = (canvas.height * imgWidth) / canvas.width;
            } else { // Handle HTML elements
                canvas = await html2canvas(element, {
                    backgroundColor: element === analysisReportRef.current ? '#374151' : '#111827', // Match background
                    scale: 2, // Increase resolution
                    useCORS: true // If images were involved
                });
                imgData = canvas.toDataURL('image/png');
                imgWidth = contentWidth; // Scale to content width
                imgHeight = (canvas.height * imgWidth) / canvas.width;
            }

             // Check if it fits on the current page, add new page if needed
            if (currentY + imgHeight > pageHeight - margin) {
                pdf.addPage();
                currentY = margin;
                 // Re-render title on new page
                 pdf.setFontSize(12);
                 pdf.setTextColor(40);
                 pdf.text(title, margin, currentY);
                 currentY += 6;
            }

            pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
            currentY += imgHeight + margin; // Add margin after image
        };

        try {
            await addImageToPdf(analysisReportRef.current, "Analysis Report");
            await addImageToPdf(threeDCanvasRef.current, "3D Visualization");
            await addImageToPdf(stressChartRef.current, "Max Stress vs. Time");
            await addImageToPdf(wearChartRef.current, "Predicted Tool Life (Wear vs. Time)");

            pdf.save(`EdgePredict_Report_${simulation?.name?.replace(/ /g, '_') ?? 'Simulation'}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF:", err);
            setError("Could not generate PDF report. Check console.");
        } finally {
            setIsDownloading(false);
        }
    };


    // --- Loading / Error / Display Logic ---
    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white text-xl">Loading Simulation Data...</div>;
    if (error) return <div className="text-center text-red-500 p-8 text-lg">{error}</div>;
    if (!simulation) return <div className="text-center p-8 text-gray-400 text-lg">Waiting for simulation data...</div>;

    const status = simulation.status;
    const name = simulation.name || 'Simulation';

    if (!loading && (status === 'PENDING' || status === 'RUNNING')) {
        return <InProgressDisplay status={status} />;
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-white">{name}</h1>
                 <div className="flex items-center space-x-4">
                    {status === 'COMPLETED' && metrics && parsedResults && timeSeriesData && timeSeriesData.length > 0 && (
                         <button onClick={handleDownloadPDF} disabled={isDownloading} className="px-4 py-2 text-sm font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-500">
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                         </button>
                     )}
                     <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                         status === 'COMPLETED' ? 'bg-green-600' : (status === 'FAILED' ? 'bg-red-600' : 'bg-yellow-500')
                         } text-white`}>
                        {status}
                    </span>
                 </div>
            </div>

            {/* Main Content Area */}
            {status === 'COMPLETED' && metrics && parsedResults ? (
                 (timeSeriesData && timeSeriesData.length > 0) ? (
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Analysis and 3D View */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <div ref={analysisReportRef} className="p-6 h-full bg-gray-800">
                                    <AnalysisReport metrics={metrics} material={materialProps} timeSeriesData={timeSeriesData}/>
                                </div>
                            </Card>
                            <Card>
                                <div className="p-4 h-[60vh] bg-gray-800 rounded-lg">
                                    <h3 className="text-lg font-semibold text-white mb-2">3D Visualization</h3>
                                    <ResultThreeDeeSnapshot simulationData={simulation} nodeData={parsedResults.nodes} canvasRef={threeDCanvasRef}/>
                                </div>
                            </Card>
                        </div>
                        {/* Stress Chart */}
                        <div className="h-[40vh]"> {/* Fixed height parent */}
                            <Card className="h-full flex flex-col">
                                {/* Flex container for title + chart area */}
                                <div ref={stressChartRef} className="p-4 h-full flex flex-col bg-gray-900">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex-shrink-0">Max Stress vs. Time</h3> {/* Title doesn't shrink */}
                                    {/* --- CORRECTED LAYOUT --- */}
                                    {/* This div grows and provides context for ResponsiveContainer */}
                                    <div className="flex-grow relative min-h-0"> {/* Use flex-grow, relative */}
                                        <MaxStressChart data={timeSeriesData} />
                                     </div>
                                     {/* --- END CORRECTION --- */}
                                </div>
                            </Card>
                        </div>
                        {/* Tool Life Chart */}
                        <div className="h-[40vh]"> {/* Fixed height parent */}
                            <Card className="h-full flex flex-col">
                                 {/* Flex container for title + chart area */}
                                <div ref={wearChartRef} className="p-4 h-full flex flex-col bg-gray-900">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex-shrink-0">Predicted Tool Life (Accumulated Wear vs. Time)</h3> {/* Title doesn't shrink */}
                                     {/* --- CORRECTED LAYOUT --- */}
                                     {/* This div grows and provides context for ResponsiveContainer */}
                                    <div className="flex-grow relative min-h-0"> {/* Use flex-grow, relative */}
                                        <ToolLifeChart data={timeSeriesData} />
                                    </div>
                                    {/* --- END CORRECTION --- */}
                                </div>
                            </Card>
                        </div>
                    </div>
                 ) : (
                     <Card>
                        <div className="p-8 text-center text-yellow-400">
                           Simulation completed, but result data (time-series) is missing or invalid.
                        </div>
                    </Card>
                 )
            ) : status === 'FAILED' ? (
                <Card>
                   <div className="p-8 text-center">
                        <h3 className="text-xl font-bold text-red-500">Simulation Failed</h3>
                        <p className="text-gray-400 mt-2">No data is available. Check worker logs for details.</p>
                        <Link to="/simulation-setup" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">Run a new simulation</Link>
                    </div>
                </Card>
            ) : (
                 !loading && <div className="text-center p-8 text-gray-400">Unknown simulation status or data issue.</div>
            )}
        </div>
    );
};

export default SimulationResultsPage;