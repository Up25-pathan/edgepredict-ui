import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import Card from '../components/common/Card';
import ResultThreeDeeSnapshot from '../components/results/ResultThreeDeeSnapshot';
import AnalysisReport from '../components/results/AnalysisReport';
import InProgressDisplay from '../components/results/InProgressDisplay';

const SimpleStressChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.map((stress, index) => ({ index, stress })).sort((a, b) => a.stress - b.stress);
    }, [data]);
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="index" stroke="#9CA3AF" tick={false} label={{ value: 'Nodes (Sorted by Stress)', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }} />
                <YAxis stroke="#9CA3AF" label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} formatter={(value) => [`${value.toFixed(2)} MPa`, 'Stress']} />
                <Line type="monotone" dataKey="stress" stroke="#818CF8" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

const SimulationResultsPage = () => {
    const { id } = useParams();
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [parsedResults, setParsedResults] = useState(null);

    useEffect(() => {
        let intervalId = null;

        const fetchSimulationData = async () => {
            try {
                const response = await api.getSimulationById(id);
                setSimulation(response.data);
                if (response.data.results) {
                    setParsedResults(JSON.parse(response.data.results));
                }
                setLoading(false);
                return response.data.status;
            } catch (err) {
                console.error("Failed to fetch simulation:", err);
                setError('Failed to load simulation data.');
                if (intervalId) clearInterval(intervalId);
                return 'FAILED';
            }
        };

        fetchSimulationData().then(initialStatus => {
            if (initialStatus === 'PENDING' || initialStatus === 'RUNNING') {
                intervalId = setInterval(async () => {
                    const currentStatus = await fetchSimulationData();
                    if (currentStatus === 'COMPLETED' || currentStatus === 'FAILED') {
                        clearInterval(intervalId);
                    }
                }, 5000); // Poll every 5 seconds
            }
        });

        // Cleanup on component unmount
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [id]);

    const { metrics, materialProps } = useMemo(() => {
        if (!parsedResults || !parsedResults.nodes || !simulation || !simulation.material_properties) {
            return { metrics: null, materialProps: null };
        }
        let uts = 0, material = null;
        try {
            material = JSON.parse(simulation.material_properties);
            uts = material?.failure_criterion?.ultimate_tensile_strength_MPa || 0;
        } catch (e) { console.error("Could not parse material_properties", e); }
        const stresses = parsedResults.nodes.map(n => n.stress_MPa);
        return {
            metrics: {
                maxStress: Math.max(...stresses),
                fracturedNodes: parsedResults.nodes.filter(n => n.status === 'FRACTURED').length,
                totalNodes: parsedResults.nodes.length,
                uts: uts,
            },
            materialProps: material
        };
    }, [parsedResults, simulation]);

    if (loading) return <div className="text-center p-8">Loading Simulation Data...</div>;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!simulation) return <div className="text-center p-8">Simulation not found.</div>;

    const { status, name } = simulation;

    // Show the "In Progress" display while running
    if (status === 'PENDING' || status === 'RUNNING') {
        return <InProgressDisplay status={status} />;
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{name}</h1>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${ status === 'COMPLETED' ? 'bg-green-600' : 'bg-red-600' } text-white`}>
                    {status}
                </span>
            </div>
            
            {status === 'COMPLETED' && metrics && parsedResults ? (
                <div className="flex-1 flex flex-col gap-6">
                    {/* --- Top Row: Analysis and 3D View --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <div className="p-6 h-full">
                                <AnalysisReport metrics={metrics} material={materialProps} />
                            </div>
                        </Card>
                        <Card>
                            <div className="p-4 h-[60vh] bg-gray-800 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-2">3D Visualization</h3>
                                <ResultThreeDeeSnapshot simulationData={simulation} nodeData={parsedResults.nodes} />
                            </div>
                        </Card>
                    </div>

                    {/* --- Bottom Row: Full-Width Graph --- */}
                    <div className="h-[40vh]">
                        <Card className="h-full flex flex-col">
                            <div className="p-4 h-full flex flex-col">
                                <h3 className="text-lg font-semibold text-white mb-4">Stress Curve</h3>
                                <div className="flex-1 min-h-0">
                                    <SimpleStressChart data={parsedResults.nodes.map(n => n.stress_MPa)} />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card>
                    <div className="p-8 text-center">
                        <h3 className="text-xl font-bold text-red-500">Simulation Failed</h3>
                        <p className="text-gray-400 mt-2">No data is available for this simulation.</p>
                        <Link to="/simulation-setup" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
                           Run a new simulation
                        </Link>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SimulationResultsPage;