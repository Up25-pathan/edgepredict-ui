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
    
    // --- State for Form Inputs (General) ---
    const [name, setName] = useState('New Simulation');
    const [description, setDescription] = useState('Running with new engine parameters.');
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [selectedToolId, setSelectedToolId] = useState('');
    const [toolSelectionMode, setToolSelectionMode] = useState('library');
    const [newToolFile, setNewToolFile] = useState(null);

    // --- State for Simulation Parameters ---
    const [numSteps, setNumSteps] = useState(500);
    const [timeStepDuration, setTimeStepDuration] = useState(0.001);

    // --- State for Physics Parameters ---
    const [ambientTemp, setAmbientTemp] = useState(25.0);
    const [heatCoeff, setHeatCoeff] = useState(50.0);
    const [strainRate, setStrainRate] = useState(10000.0);
    const [strainIncrement, setStrainIncrement] = useState(0.01);
    const [slidingVelocity, setSlidingVelocity] = useState(2.0);
    const [uncutChipThickness, setUncutChipThickness] = useState(0.1);
    const [cuttingWidth, setCuttingWidth] = useState(3.0);

    // --- State for Contact Zone ---
    const [contactXMin, setContactXMin] = useState(-0.004);
    const [contactXMax, setContactXMax] = useState(0.004);
    const [contactYMin, setContactYMin] = useState(-0.051);
    const [contactYMax, setContactYMax] = useState(-0.045);
    const [contactZMin, setContactZMin] = useState(-0.004);
    const [contactZMax, setContactZMax] = useState(0.004);

    // --- State for CFD Parameters ---
    const [enableCfd, setEnableCfd] = useState(true);
    const [chipFlowModel, setChipFlowModel] = useState('navier_stokes');
    const [numParticles, setNumParticles] = useState(1500);
    const [rakeAngle, setRakeAngle] = useState(12.0);
    const [clearanceAngle, setClearanceAngle] = useState(7.0);
    const [frictionCoefficient, setFrictionCoefficient] = useState(0.6);
    const [chipThicknessRatio, setChipThicknessRatio] = useState(2.5);
    
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

        // --- 1. Build Simulation Parameters ---
        const simulation_parameters = { 
            num_steps: parseInt(numSteps), 
            time_step_duration_s: parseFloat(timeStepDuration) 
        };

        // --- 2. Build Physics Parameters ---
        const physics_parameters = {
            ambient_temperature_C: parseFloat(ambientTemp),
            heat_transfer_coefficient: parseFloat(heatCoeff),
            strain_rate: parseFloat(strainRate),
            strain_increment_per_step: parseFloat(strainIncrement),
            sliding_velocity_m_s: parseFloat(slidingVelocity),
            uncut_chip_thickness_mm: parseFloat(uncutChipThickness),
            cutting_width_mm: parseFloat(cuttingWidth),
            contact_zone: {
                x: [parseFloat(contactXMin), parseFloat(contactXMax)],
                y: [parseFloat(contactYMin), parseFloat(contactYMax)],
                z: [parseFloat(contactZMin), parseFloat(contactZMax)]
            }
        };

        // --- 3. Build CFD Parameters ---
        const cfd_parameters = {
            enable_cfd: enableCfd,
            chip_flow_model: chipFlowModel,
            num_particles: parseInt(numParticles),
            rake_angle_degrees: parseFloat(rakeAngle),
            clearance_angle_degrees: parseFloat(clearanceAngle),
            friction_coefficient: parseFloat(frictionCoefficient),
            chip_thickness_ratio: parseFloat(chipThicknessRatio)
        };

        // --- 4. Build FormData ---
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('simulation_parameters', JSON.stringify(simulation_parameters));
        formData.append('physics_parameters', JSON.stringify(physics_parameters));
        
        // --- THIS IS THE FIX ---
        // selectedMaterial.properties is ALREADY a JSON string. Don't stringify it again.
        formData.append('material_properties', selectedMaterial.properties); 
        // --- END FIX ---
        
        formData.append('cfd_parameters', JSON.stringify(cfd_parameters)); 

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

    // --- Helper function for number inputs (unchanged) ---
    const renderNumberInput = (label, value, setter, step = "any") => (
        <div>
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <input type="number" value={value} onChange={(e) => setter(e.target.value)} step={step} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2" />
        </div>
    );
    
    // --- Helper function for text inputs ---
    const renderTextInput = (label, value, setter) => (
        <div>
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <input type="text" value={value} onChange={(e) => setter(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2" />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-800 rounded-lg">
            
            {/* General Info */}
            <div className="p-4 border border-gray-600 rounded-md space-y-4"> 
                <h3 className="text-lg font-semibold text-white">Simulation Info</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Simulation Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white p-2" />
                </div>
            </div>

            {/* Library Selections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
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
                        <input type="file" onChange={(e) => setNewToolFile(e.target.files[0])} accept=".stl,.step,.iges" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    )}
                </div>
            </div>

            {/* Simulation Parameters */}
            <div className="p-4 border border-gray-600 rounded-md">
                <h3 className="text-lg font-semibold text-white mb-4">Simulation Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {renderNumberInput("Number of Steps", numSteps, setNumSteps, "1")}
                    {renderNumberInput("Time Step Duration (s)", timeStepDuration, setTimeStepDuration)}
                </div>
            </div>
            
            {/* Physics Parameters */}
            <div className="p-4 border border-gray-600 rounded-md">
                <h3 className="text-lg font-semibold text-white mb-4">Physics Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {renderNumberInput("Ambient Temperature (°C)", ambientTemp, setAmbientTemp)}
                    {renderNumberInput("Heat Transfer Coeff.", heatCoeff, setHeatCoeff)}
                    {renderNumberInput("Strain Rate", strainRate, setStrainRate)}
                    {renderNumberInput("Strain Increment / Step", strainIncrement, setStrainIncrement)}
                    {renderNumberInput("Sliding Velocity (m/s)", slidingVelocity, setSlidingVelocity)}
                    {renderNumberInput("Uncut Chip Thickness (mm)", uncutChipThickness, setUncutChipThickness)}
                    {renderNumberInput("Cutting Width (mm)", cuttingWidth, setCuttingWidth)}
                </div>
            </div>
            
            {/* Contact Zone Parameters */}
            <div className="p-4 border border-gray-600 rounded-md">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Zone (m)</h3>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    {renderNumberInput("X Min", contactXMin, setContactXMin)}
                    {renderNumberInput("Y Min", contactYMin, setContactYMin)}
                    {renderNumberInput("Z Min", contactZMin, setContactZMin)}
                    {renderNumberInput("X Max", contactXMax, setContactXMax)}
                    {renderNumberInput("Y Max", contactYMax, setContactYMax)}
                    {renderNumberInput("Z Max", contactZMax, setContactZMax)}
                </div>
            </div>

            {/* CFD Parameters */}
            <div className="p-4 border border-gray-600 rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">CFD Parameters</h3>
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input
                            type="checkbox"
                            checked={enableCfd}
                            onChange={(e) => setEnableCfd(e.target.checked)}
                            className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Enable CFD</span>
                    </label>
                </div>
                {enableCfd && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderTextInput("Chip Flow Model", chipFlowModel, setChipFlowModel)}
                        {renderNumberInput("Num Particles", numParticles, setNumParticles, "1")}
                        {renderNumberInput("Rake Angle (°)", rakeAngle, setRakeAngle)}
                        {renderNumberInput("Clearance Angle (°)", clearanceAngle, setClearanceAngle)}
                        {renderNumberInput("Friction Coefficient", frictionCoefficient, setFrictionCoefficient)}
                        {renderNumberInput("Chip Thickness Ratio", chipThicknessRatio, setChipThicknessRatio)}
                    </div>
                )}
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