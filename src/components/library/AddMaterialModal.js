import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const AddMaterialModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [properties, setProperties] = useState('');
    const [error, setError] = useState('');

    // --- UPDATED: Pre-filled example to guide the user ---
    const exampleJson = `{
    "name": "Ti-6Al-4V (Titanium Alloy)",
    "A_yield_strength_MPa": 792.0,
    "B_strain_hardening_MPa": 510.0,
    "n_strain_hardening_exp": 0.26,
    "C_strain_rate_sensitivity": 0.014,
    "m_thermal_softening_exp": 1.0,
    "melting_point_C": 1668.0,
    "density_kg_m3": 4420.0,
    "specific_heat_J_kgC": 526.0,
    "thermal_conductivity_W_mK": 7.4,
    "failure_criterion": {
        "ultimate_tensile_strength_MPa": 1200.0,
        "fatigue_limit_MPa": 600.0
    },
    "usui_wear_model": {
        "A_constant": 1.2e-8,
        "B_inv_temp_K": 9000.0
    }
}`;

    const handleSubmit = () => {
        setError('');
        let parsedProperties;

        // Validate that the properties field contains valid JSON
        try {
            parsedProperties = JSON.parse(properties);
        } catch (e) {
            setError('Invalid JSON format in properties.');
            return;
        }

        // Validate that a name has been entered
        if (!name.trim()) {
            setError('Material name is required.');
            return;
        }

        // Pass the new material object to the parent component's onAdd function
        onAdd({ name, properties: parsedProperties });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Material">
            <div className="space-y-4">
                <div>
                    <label htmlFor="material-name" className="block text-sm font-medium text-gray-300">
                        Material Name
                    </label>
                    <input
                        type="text"
                        id="material-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Ti-6Al-4V"
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                    />
                </div>
                <div>
                    <label htmlFor="material-properties" className="block text-sm font-medium text-gray-300">
                        Properties (JSON format)
                    </label>
                    <textarea
                        id="material-properties"
                        rows="16"
                        value={properties}
                        onChange={(e) => setProperties(e.target.value)}
                        placeholder={exampleJson}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white font-mono"
                    ></textarea>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-2 pt-2">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleSubmit}>Add Material</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddMaterialModal;