import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const AddToolModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        setError('');
        if (!name.trim()) {
            setError('Tool name is required.');
            return;
        }
        if (!file) {
            setError('Please select a tool file.');
            return;
        }

        // The backend expects FormData for file uploads
        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', file);

        // Pass the FormData object to the parent component's onAdd function
        onAdd(formData);
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
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                    />
                </div>
                <div>
                    <label htmlFor="tool-file" className="block text-sm font-medium text-gray-300">
                        Tool File (.stl, .step, .iges)
                    </label>
                    <input
                        type="file"
                        id="tool-file"
                        onChange={(e) => setFile(e.target.files[0])}
                        accept=".stl,.step,.iges"
                        className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-2 pt-2">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button onClick={handleSubmit}>Add Tool</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddToolModal;