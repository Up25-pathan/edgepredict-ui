import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Loader2 } from 'lucide-react'; // Import loader icon
import api from '../../services/api';   // Import API service

// Changed 'onAdd' to 'onToolAdded' to match the parent component
const AddToolModal = ({ isOpen, onClose, onToolAdded }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const handleSubmit = async () => {
        setError('');
        
        if (!name.trim()) {
            setError('Tool name is required.');
            return;
        }
        if (!file) {
            setError('Please select a tool file.');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('file', file);

            // 1. Make the API call here
            await api.createTool(formData);

            // 2. Refresh the parent list
            onToolAdded();
            
            // 3. Close and reset
            onClose();
            setName('');
            setFile(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to upload tool.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Tool">
            <div className="space-y-4">
                <div>
                    <label htmlFor="tool-name" className="block text-sm font-medium text-gray-300">
                        Tool Name
                    </label>
                    <input
                        type="text"
                        id="tool-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Standard End Mill"
                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white px-3 py-2"
                    />
                </div>
                <div>
                    <label htmlFor="tool-file" className="block text-sm font-medium text-gray-300 mb-1">
                        Tool File (.stl, .step, .iges)
                    </label>
                    <input
                        type="file"
                        id="tool-file"
                        onChange={(e) => setFile(e.target.files[0])}
                        accept=".stl,.step,.iges"
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all cursor-pointer"
                    />
                </div>

                {error && <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

                <div className="flex justify-end space-x-3 pt-4">
                    <Button onClick={onClose} variant="secondary" disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="primary" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Add Tool'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddToolModal;