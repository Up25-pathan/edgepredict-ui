import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/mockApi';
import toast from 'react-hot-toast';

const AddToolModal = ({ isOpen, onClose, onToolAdded }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [specsJson, setSpecsJson] = useState('{\n  "Diameter": "10 mm",\n  "Flutes": 4\n}');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let specs;
        try {
            // Validate that the specs input is valid JSON
            specs = JSON.parse(specsJson);
        } catch (error) {
            toast.error("Invalid JSON format for specifications.");
            return;
        }

        setIsSubmitting(true);
        try {
            const newTool = { name, type, specs };
            const savedTool = await api.addTool(newTool);
            toast.success(`Tool "${savedTool.name}" added successfully!`);
            onToolAdded(savedTool);
            onClose();
        } catch (error) {
            toast.error("Failed to add tool.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-hud-text-primary mb-6">Add New Tool</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="tool-name" className="block text-sm font-medium text-hud-text-secondary">Tool Name (e.g., EM-10-4F-CARB)</label>
                        <input id="tool-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary" />
                    </div>
                    <div>
                        <label htmlFor="tool-type" className="block text-sm font-medium text-hud-text-secondary">Tool Type (e.g., 4-Flute Carbide End Mill)</label>
                        <input id="tool-type" type="text" value={type} onChange={e => setType(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary" />
                    </div>
                    <div>
                        <label htmlFor="tool-specs" className="block text-sm font-medium text-hud-text-secondary">Specifications (JSON format)</label>
                        <textarea 
                            id="tool-specs" 
                            rows="4"
                            value={specsJson} 
                            onChange={e => setSpecsJson(e.target.value)} 
                            required 
                            className="mt-1 block w-full px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary font-mono"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-hud-border">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Tool'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddToolModal;
