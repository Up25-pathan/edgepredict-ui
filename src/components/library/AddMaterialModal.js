import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/mockApi';
import toast from 'react-hot-toast';

const AddMaterialModal = ({ isOpen, onClose, onMaterialAdded }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Workpiece');
    const [youngsModulus, setYoungsModulus] = useState('');
    const [thermalConductivity, setThermalConductivity] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newMaterial = {
                name,
                type,
                youngs_modulus: youngsModulus,
                thermal_conductivity: thermalConductivity,
            };
            const savedMaterial = await api.addMaterial(newMaterial);
            toast.success(`Material "${savedMaterial.name}" added successfully!`);
            onMaterialAdded(savedMaterial); // Pass the new material back to the parent page
            onClose(); // Close the modal
        } catch (error) {
            toast.error("Failed to add material.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-hud-text-primary mb-6">Add New Material</h2>
                <div className="space-y-4">
                    {/* Form Fields */}
                    <div>
                        <label htmlFor="mat-name" className="block text-sm font-medium text-hud-text-secondary">Material Name</label>
                        <input id="mat-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary" />
                    </div>
                     <div>
                        <label htmlFor="mat-type" className="block text-sm font-medium text-hud-text-secondary">Type</label>
                        <select id="mat-type" value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-hud-dark border-hud-border focus:outline-none focus:ring-hud-primary focus:border-hud-primary rounded-md">
                            <option>Workpiece</option>
                            <option>Tool</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="mat-youngs" className="block text-sm font-medium text-hud-text-secondary">Young's Modulus (e.g., 69 GPa)</label>
                        <input id="mat-youngs" type="text" value={youngsModulus} onChange={e => setYoungsModulus(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary" />
                    </div>
                     <div>
                        <label htmlFor="mat-thermal" className="block text-sm font-medium text-hud-text-secondary">Thermal Conductivity (e.g., 167 W/m·K)</label>
                        <input id="mat-thermal" type="text" value={thermalConductivity} onChange={e => setThermalConductivity(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary" />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-hud-border">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Material'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddMaterialModal;
