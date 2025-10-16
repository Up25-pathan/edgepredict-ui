import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { api } from '../../services/mockApi';
import toast from 'react-hot-toast';

// Helper components for the form
const FormInput = ({ label, name, type = "number", placeholder, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-hud-text-secondary mb-1">{label}</label>
        <input type={type} id={name} name={name} placeholder={placeholder} required={required} className="w-full bg-hud-dark border border-hud-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-hud-primary" />
    </div>
);

const FormSelect = ({ label, name, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-hud-text-secondary mb-1">{label}</label>
        <select id={name} name={name} className="w-full bg-hud-dark border border-hud-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-hud-primary">
            {children}
        </select>
    </div>
);

const SimulationSetupForm = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData(event.target);
        const formProps = Object.fromEntries(formData);

        // 1. Structure the data exactly as the backend endpoint expects
        const simulationData = {
            tool_geometry: {
                diameter_mm: parseFloat(formProps.diameter),
                flute_count: parseInt(formProps.flute_count),
                helix_angle_deg: parseFloat(formProps.helix_angle),
            },
            tool_material: { name: formProps.tool_material },
            workpiece_material: { name: formProps.workpiece_material },
            cutting_parameters: {
                spindle_speed_rpm: parseFloat(formProps.rpm),
                feed_rate_mm_min: parseFloat(formProps.feed_rate),
                axial_depth_mm: parseFloat(formProps.axial_doc),
                radial_depth_mm: parseFloat(formProps.radial_doc),
            }
        };

        try {
            // 2. Send the data to the backend to run the simulation
            const result = await api.runSimulation(simulationData);
            toast.success("Simulation completed successfully!");
            
            // 3. Navigate to the results page using the ID from the backend response
            navigate(`/simulations/results/${result.simulation_id}`);

        } catch (error) {
            toast.error(`Simulation failed: ${error.message}`);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Column 1: Geometry & Parameters */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-hud-text-primary border-b border-hud-border pb-2">Tool Geometry</h3>
                        <FormInput label="Diameter (mm)" name="diameter" placeholder="10" />
                        <FormInput label="Flute Count" name="flute_count" placeholder="4" />
                        <FormInput label="Helix Angle (°)" name="helix_angle" placeholder="30" />
                        
                        <h3 className="text-lg font-bold text-hud-text-primary border-b border-hud-border pb-2 mt-4">Cutting Parameters</h3>
                        <FormInput label="Spindle Speed (RPM)" name="rpm" placeholder="8000" />
                        <FormInput label="Feed Rate (mm/min)" name="feed_rate" placeholder="1200" />
                        <FormInput label="Axial Depth of Cut (mm)" name="axial_doc" placeholder="5" />
                        <FormInput label="Radial Depth of Cut (mm)" name="radial_doc" placeholder="2" />
                    </div>

                    {/* Column 2: Material Selection */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-hud-text-primary border-b border-hud-border pb-2">Material Selection</h3>
                        <FormSelect label="Tool Material" name="tool_material">
                            <option>Tungsten Carbide</option>
                            <option>High-Speed Steel (HSS)</option>
                        </FormSelect>
                        <FormSelect label="Workpiece Material" name="workpiece_material">
                            <option>Aluminum 6061-T6</option>
                            <option>Titanium Ti-6Al-4V</option>
                        </FormSelect>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-hud-border text-right">
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Running Simulation...' : 'Run Simulation'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default SimulationSetupForm;

