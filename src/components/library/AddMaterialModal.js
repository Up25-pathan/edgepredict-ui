import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const AddMaterialModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [properties, setProperties] = useState('');
    const [error, setError] = useState('');

    // Pre-filled example to guide the user
    const exampleJson = `{
    "name": "Titanium (Ti-6Al-4V)",
    "density_kg_m3": 4430,
    "specific_heat_J_kgC": 526.3,
    "A_yield_strength_MPa": 1099,
    "B_strain_hardening_MPa": 653.1,
    "n_strain_hardening_exp": 0.47,
    "m_thermal_softening_exp": 0.8,
    "melting_point_C": 1650,
    "failure_criterion": {
        "ultimate_tensile_strength_MPa": 1150
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
                        placeholder="e.g., Custom Steel Alloy"
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                    />
                </div>
                <div>
                    <label htmlFor="material-properties" className="block text-sm font-medium text-gray-300">
                        Properties (JSON format)
                    </label>
                    <textarea
                        id="material-properties"
                        rows="12"
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