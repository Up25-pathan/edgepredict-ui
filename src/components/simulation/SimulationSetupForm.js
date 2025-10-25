import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SimulationSetupForm = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- State for Library Data ---
    const [materials, setMaterials] = useState([]);
    const [tools, setTools] = useState([]);
    
    // --- State for Form Inputs ---
    const [name, setName] = useState('Final Test Simulation');
    const [description, setDescription] = useState('Using libraries and physics parameters.');
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [selectedToolId, setSelectedToolId] = useState('');
    const [toolSelectionMode, setToolSelectionMode] = useState('library');
    const [newToolFile, setNewToolFile] = useState(null);

    // --- State for Simulation & Physics Parameters ---
    const [numSteps, setNumSteps] = useState(200); // <-- Updated default
    const [timeStepDuration, setTimeStepDuration] = useState(0.0001); // <-- Updated default
    const [ambientTemp, setAmbientTemp] = useState(20.0); // <-- Updated default
    const [heatCoeff, setHeatCoeff] = useState(150.0); // <-- Updated default
    const [strainRate, setStrainRate] = useState(1000.0); // <-- Updated default
    const [strainIncrement, setStrainIncrement] = useState(0.005); // <-- Updated default
    
    // --- 1. NEW STATE VARIABLE ---
    const [slidingVelocity, setSlidingVelocity] = useState(1.5); // <-- NEW

    useEffect(() => {
        const fetchLibraryData = async () => {
            try {
                const materialsRes = await api.getMaterials();
                setMaterials(materialsRes.data);
                if (materialsRes.data.length > 0) setSelectedMaterialId(materialsRes.data[0].id);

                const toolsRes = await api.getTools();
                setTools(toolsRes.data);
                 if (toolsRes.data.length > 0) setSelectedToolId(toolsRes.data[0].id);
            } catch (err) {
                setError("Could not load materials or tools from the library.");
            }
        };
        fetchLibraryData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!selectedMaterialId) { setError('Please select a material.'); return; }
        if (toolSelectionMode === 'library' && !selectedToolId) { setError('Please select a tool from the library.'); return; }
        if (toolSelectionMode === 'upload' && !newToolFile) { setError('Please upload a new tool file.'); return; }

        setIsLoading(true);

        const selectedMaterial = materials.find(m => m.id === parseInt(selectedMaterialId));
        if (!selectedMaterial) {
            setError('Selected material not found.');
            setIsLoading(false);
            return;
        }

        // --- 2. UPDATED physics_parameters OBJECT ---
        const simulation_parameters = { num_steps: parseInt(numSteps), time_step_duration_s: parseFloat(timeStepDuration) };
        const physics_parameters = {
            ambient_temperature_C: parseFloat(ambientTemp),
            heat_transfer_coefficient: parseFloat(heatCoeff),
            strain_rate: parseFloat(strainRate),
            strain_increment_per_step: parseFloat(strainIncrement),
            sliding_velocity_m_s: parseFloat(slidingVelocity), // <-- NEW: Add to object
        };

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('simulation_parameters', JSON.stringify(simulation_parameters));
        formData.append('physics_parameters', JSON.stringify(physics_parameters));
        formData.append('material_properties', JSON.stringify(selectedMaterial.properties));

        if (toolSelectionMode === 'library') {
            formData.append('tool_id', selectedToolId);
        } else {
            formData.append('tool_file', newToolFile);
        }

        try {
            const response = await api.createSimulation(formData);
            navigate(`/simulation/${response.data.id}`);
        } catch (err) {
            const errorDetail = err.response?.data?.detail || 'Check the console for details.';
            setError(`Failed to start simulation: ${errorDetail}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderNumberInput = (label, value, setter, step = "any") => (
        <div>
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <input type="number" value={value} onChange={(e) => setter(e.target.value)} step={step} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2" />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-800 rounded-lg">
            <div className="p-4 border border-gray-600 rounded-md space-y-4"> {/* General Info */}
                <h3 className="text-lg font-semibold text-white">Simulation Info</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Simulation Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Library Selections */}
                <div className="p-4 border border-gray-600 rounded-md space-y-4">
                    <h3 className="text-lg font-semibold text-white">Select Material</h3>
                    <select value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2">
                        <option value="">-- Select a Material --</option>
                        {materials.map(material => <option key={material.id} value={material.id}>{material.name}</option>)}
                    </select>
                </div>
                <div className="p-4 border border-gray-600 rounded-md space-y-4">
                    <h3 className="text-lg font-semibold text-white">Select Tool</h3>
                    <div className="flex space-x-4">
                        <label className="flex items-center"><input type="radio" value="library" checked={toolSelectionMode === 'library'} onChange={() => setToolSelectionMode('library')} className="form-radio text-indigo-600"/><span className="ml-2 text-gray-300">From Library</span></label>
                        <label className="flex items-center"><input type="radio" value="upload" checked={toolSelectionMode === 'upload'} onChange={() => setToolSelectionMode('upload')} className="form-radio text-indigo-600"/><span className="ml-2 text-gray-300">Upload New</span></label>
                    </div>
                    {toolSelectionMode === 'library' ? (
                        <select value={selectedToolId} onChange={(e) => setSelectedToolId(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2">
                            <option value="">-- Select a Tool --</option>
                            {tools.map(tool => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
                        </select>
                    ) : (
                        <input type="file" onChange={(e) => setNewToolFile(e.target.files[0])} accept=".stl" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    )}
                </div>
            </div>

            
            <div className="p-4 border border-gray-600 rounded-md">
                <h3 className="text-lg font-semibold text-white mb-4">Process Parameters</h3>
                {/* --- 3. UPDATED JSX Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> {/* <-- Changed to 4 columns */}
                    {renderNumberInput("Number of Steps", numSteps, setNumSteps, "1")}
                    {renderNumberInput("Time Step Duration (s)", timeStepDuration, setTimeStepDuration)}
                    {renderNumberInput("Ambient Temperature (°C)", ambientTemp, setAmbientTemp)}
                    {renderNumberInput("Heat Transfer Coefficient", heatCoeff, setHeatCoeff)}
                    {renderNumberInput("Strain Rate", strainRate, setStrainRate)}
                    {renderNumberInput("Strain Increment per Step", strainIncrement, setStrainIncrement)}
                    {/* --- NEW INPUT FIELD RENDERED HERE --- */}
                    {renderNumberInput("Sliding Velocity (m/s)", slidingVelocity, setSlidingVelocity)}
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="pt-4">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500">
                    {isLoading ? 'Starting Simulation...' : 'Start Simulation'}
                </button>
            </div>
        </form>
    );
};

export default SimulationSetupForm;