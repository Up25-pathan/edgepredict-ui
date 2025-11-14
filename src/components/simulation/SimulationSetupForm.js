import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SimulationSetupForm = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Library Data ---
    const [materials, setMaterials] = useState([]);
    const [tools, setTools] = useState([]);
    
    // --- General Info ---
    const [name, setName] = useState('New Simulation');
    const [description, setDescription] = useState('Standard titanium cutting test.');
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [selectedToolId, setSelectedToolId] = useState('');
    const [toolSelectionMode, setToolSelectionMode] = useState('library');
    const [newToolFile, setNewToolFile] = useState(null);

    // --- Run Settings ---
    const [numSteps, setNumSteps] = useState(500);
    const [timeStepDuration, setTimeStepDuration] = useState(0.001);

    // --- Process Physics Parameters ---
    const [ambientTemp, setAmbientTemp] = useState(25.0);
    const [heatCoeff, setHeatCoeff] = useState(5000.0);
    const [strainRate, setStrainRate] = useState(1000.0);
    const [strainIncrement, setStrainIncrement] = useState(0.005);
    const [slidingVelocity, setSlidingVelocity] = useState(1.5);
    const [uncutChipThickness, setUncutChipThickness] = useState(0.15);
    const [cuttingWidth, setCuttingWidth] = useState(2.0);

    // --- Contact Zone ---
    const [autoContact, setAutoContact] = useState(true);
    const [contactXMin, setContactXMin] = useState(-0.001);
    const [contactXMax, setContactXMax] = useState(0.001);
    const [contactYMin, setContactYMin] = useState(-0.001);
    const [contactYMax, setContactYMax] = useState(0.001);
    const [contactZMin, setContactZMin] = useState(0.0);
    const [contactZMax, setContactZMax] = useState(0.005);

    // --- CFD Parameters ---
    const [enableCfd, setEnableCfd] = useState(true);
    const [numParticles, setNumParticles] = useState(2000);
    const [rakeAngle, setRakeAngle] = useState(8.0);
    const [clearanceAngle, setClearanceAngle] = useState(10.0);
    const [frictionCoefficient, setFrictionCoefficient] = useState(0.55);
    const [chipThicknessRatio, setChipThicknessRatio] = useState(0.45);
    
    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const mats = await api.getMaterials();
                setMaterials(mats.data);
                if (mats.data.length > 0) setSelectedMaterialId(mats.data[0].id);
                const tls = await api.getTools();
                setTools(tls.data);
                if (tls.data.length > 0) setSelectedToolId(tls.data[0].id);
            } catch (err) { setError("Failed to load library data."); }
        };
        fetchLibrary();
    }, []);

    // --- NEW: Validation Logic ---
    const validateForm = () => {
        if (!name.trim()) return "Simulation name is required.";
        if (!selectedMaterialId) return "Please select a material.";
        
        if (toolSelectionMode === 'upload' && !newToolFile) return "Please upload a tool file.";
        if (toolSelectionMode === 'library' && !selectedToolId) return "Please select a tool from the library.";

        // Physics Safety Checks
        if (numSteps <= 0) return "Number of steps must be positive.";
        if (timeStepDuration <= 0) return "Time step duration must be greater than 0.";
        if (ambientTemp < -273.15) return "Ambient temperature cannot be below Absolute Zero (-273.15°C).";
        if (strainRate <= 0) return "Strain Rate must be positive.";
        if (slidingVelocity <= 0) return "Sliding Velocity must be positive.";
        if (heatCoeff < 0) return "Heat Transfer Coefficient cannot be negative.";
        
        // Geometry Safety Checks
        if (uncutChipThickness <= 0) return "Uncut Chip Thickness must be positive.";
        if (cuttingWidth <= 0) return "Cutting Width must be positive.";

        // CFD Safety Checks
        if (enableCfd) {
            if (numParticles < 100) return "Particle count too low (min 100).";
            if (frictionCoefficient < 0 || frictionCoefficient > 1) return "Friction Coefficient must be between 0.0 and 1.0.";
            if (chipThicknessRatio <= 0) return "Chip Thickness Ratio must be positive.";
        }

        return null; // No errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError(''); 
        setIsLoading(true);

        // 1. Run Validation
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setIsLoading(false);
            // Scroll to error message if needed
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            return;
        }

        const mat = materials.find(m => m.id === parseInt(selectedMaterialId));
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('material_properties', mat.properties); 
        if (toolSelectionMode === 'library') formData.append('tool_id', selectedToolId);
        else formData.append('tool_file', newToolFile);

        formData.append('simulation_parameters', JSON.stringify({ 
            num_steps: parseInt(numSteps), time_step_duration_s: parseFloat(timeStepDuration) 
        }));

        formData.append('physics_parameters', JSON.stringify({
            ambient_temperature_C: parseFloat(ambientTemp),
            heat_transfer_coefficient: parseFloat(heatCoeff),
            strain_rate: parseFloat(strainRate),
            strain_increment_per_step: parseFloat(strainIncrement),
            sliding_velocity_m_s: parseFloat(slidingVelocity),
            uncut_chip_thickness_mm: parseFloat(uncutChipThickness),
            cutting_width_mm: parseFloat(cuttingWidth),
            auto_contact_zone: autoContact,
            contact_zone: { x: [parseFloat(contactXMin), parseFloat(contactXMax)], y: [parseFloat(contactYMin), parseFloat(contactYMax)], z: [parseFloat(contactZMin), parseFloat(contactZMax)] }
        }));

        formData.append('cfd_parameters', JSON.stringify({
            enable_cfd: enableCfd,
            chip_flow_model: 'navier_stokes',
            num_particles: parseInt(numParticles),
            rake_angle_degrees: parseFloat(rakeAngle),
            clearance_angle_degrees: parseFloat(clearanceAngle),
            friction_coefficient: parseFloat(frictionCoefficient),
            chip_thickness_ratio: parseFloat(chipThicknessRatio)
        }));

        try {
            const res = await api.createSimulation(formData);
            navigate(`/simulation/${res.data.id}`);
        } catch (err) {
            setError(`Failed: ${err.response?.data?.detail || err.message}`);
        } finally { setIsLoading(false); }
    };

    const Input = ({ label, value, setter, disabled=false, step="any", min }) => (
        <div>
            <label className={`block text-sm font-medium mb-1 ${disabled?'text-gray-500':'text-gray-400'}`}>{label}</label>
            <input 
                type="number" 
                value={value} 
                onChange={e=>setter(e.target.value)} 
                disabled={disabled} 
                step={step}
                min={min}
                className={`w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-colors ${disabled?'opacity-50 cursor-not-allowed':'text-white'}`} 
            />
        </div>
    );
    
    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">New Simulation</h1>
                <p className="text-gray-400">Configure all process parameters.</p>
            </div>
            
            {/* General Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl space-y-4"> 
                    <h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>General</h3>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 outline-none"/></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Material</label><select value={selectedMaterialId} onChange={e=>setSelectedMaterialId(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 outline-none">{materials.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                </div>
                <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl space-y-4">
                     <h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>Tool</h3>
                    <div className="flex space-x-6 mb-4">
                        <label className="flex items-center cursor-pointer"><input type="radio" checked={toolSelectionMode==='library'} onChange={()=>setToolSelectionMode('library')} className="accent-indigo-600"/><span className="ml-2 text-white">Library</span></label>
                        <label className="flex items-center cursor-pointer"><input type="radio" checked={toolSelectionMode==='upload'} onChange={()=>setToolSelectionMode('upload')} className="accent-indigo-600"/><span className="ml-2 text-white">Upload</span></label>
                    </div>
                    {toolSelectionMode==='library' ? <select value={selectedToolId} onChange={e=>setSelectedToolId(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 outline-none">{tools.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select> : <input type="file" onChange={e=>setNewToolFile(e.target.files[0])} accept=".stl,.step,.iges" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"/>}
                </div>
            </div>

            {/* Physics Section */}
            <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>Process Physics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Input label="Ambient Temp (°C)" value={ambientTemp} setter={setAmbientTemp} />
                    <Input label="Sliding Velocity (m/s)" value={slidingVelocity} setter={setSlidingVelocity} min="0.1" />
                    <Input label="Strain Rate (1/s)" value={strainRate} setter={setStrainRate} min="1" />
                    <Input label="Strain Inc. / Step" value={strainIncrement} setter={setStrainIncrement} step="0.001" />
                    <Input label="Heat Transfer Coeff." value={heatCoeff} setter={setHeatCoeff} min="0" />
                    <Input label="Uncut Chip Thick. (mm)" value={uncutChipThickness} setter={setUncutChipThickness} step="0.01" />
                    <Input label="Cutting Width (mm)" value={cuttingWidth} setter={setCuttingWidth} step="0.1" />
                </div>
            </div>
            
            {/* Contact Zone Section */}
            <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>Contact Zone</h3><label className="flex items-center cursor-pointer bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700/50"><span className="mr-3 text-sm text-white">Auto-Detect</span><input type="checkbox" checked={autoContact} onChange={e=>setAutoContact(e.target.checked)} className="accent-indigo-600 h-4 w-4"/></label></div>
                <div className="grid grid-cols-3 gap-6">
                    <Input label="X Min (m)" value={contactXMin} setter={setContactXMin} disabled={autoContact} step="0.0001" />
                    <Input label="Y Min (m)" value={contactYMin} setter={setContactYMin} disabled={autoContact} step="0.0001" />
                    <Input label="Z Min (m)" value={contactZMin} setter={setContactZMin} disabled={autoContact} step="0.0001" />
                    <Input label="X Max (m)" value={contactXMax} setter={setContactXMax} disabled={autoContact} step="0.0001" />
                    <Input label="Y Max (m)" value={contactYMax} setter={setContactYMax} disabled={autoContact} step="0.0001" />
                    <Input label="Z Max (m)" value={contactZMax} setter={setContactZMax} disabled={autoContact} step="0.0001" />
                </div>
            </div>

             {/* CFD & Run Settings */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl">
                    <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>CFD Settings</h3><label className="flex items-center"><span className="mr-3 text-sm text-white">Enable</span><input type="checkbox" checked={enableCfd} onChange={e=>setEnableCfd(e.target.checked)} className="accent-indigo-600 h-4 w-4"/></label></div>
                    {enableCfd && (
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Rake Angle (°)" value={rakeAngle} setter={setRakeAngle} />
                             <Input label="Clearance Angle (°)" value={clearanceAngle} setter={setClearanceAngle} />
                             <Input label="Friction Coeff. (0-1)" value={frictionCoefficient} setter={setFrictionCoefficient} step="0.01" min="0" max="1" />
                             <Input label="Chip Thickness Ratio" value={chipThicknessRatio} setter={setChipThicknessRatio} step="0.01" />
                             <Input label="Particle Count" value={numParticles} setter={setNumParticles} step="100" />
                        </div>
                    )}
                </div>
                <div className="p-6 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl">
                     <h3 className="text-lg font-bold text-white mb-6 flex items-center"><span className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>Run Settings</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <Input label="Time Steps" value={numSteps} setter={setNumSteps} step="100" min="10" />
                        <Input label="Step Duration (s)" value={timeStepDuration} setter={setTimeStepDuration} step="0.0001" />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center font-medium animate-pulse">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Initializing...' : 'Start Simulation'}
                </button>
            </div>
        </form>
    );
};

export default SimulationSetupForm;