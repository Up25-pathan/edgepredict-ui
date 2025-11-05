import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '../../assets/icons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import AddMaterialModal from '../../components/library/AddMaterialModal';
import api from '../../services/api';

const MaterialLibraryPage = () => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to fetch materials from the backend
    const fetchMaterials = async () => {
        try {
            setIsLoading(true);
            const response = await api.getMaterials();
            setMaterials(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch materials:", err);
            setError("Could not load materials.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch materials when the component first loads
    useEffect(() => {
        fetchMaterials();
    }, []);

    // Function to handle adding a new material
    const handleAddMaterial = async (newMaterial) => {
        try {
            // The modal will give us the name and properties
            await api.createMaterial(newMaterial);
            // After successfully creating, close the modal and refresh the list
            setIsModalOpen(false);
            fetchMaterials(); 
        } catch (err) {
            console.error("Failed to add material:", err);
            // You could add error handling to the modal here
        }
    };

    // Function to handle deleting a material
    const handleDeleteMaterial = async (materialId) => {
        // Add a confirmation dialog to prevent accidental deletion
        if (window.confirm('Are you sure you want to delete this material?')) {
            try {
                await api.deleteMaterial(materialId);
                // Refresh the list after deleting
                fetchMaterials();
            } catch (err) {
                console.error("Failed to delete material:", err);
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Material Library</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Material
                </Button>
            </div>

            {isLoading && <p className="text-center text-gray-400">Loading materials...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.length > 0 ? materials.map(material => (
                        <Card key={material.id}>
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <h5 className="text-xl font-bold text-white mb-2">{material.name}</h5>
                                    <Button
                                        onClick={() => handleDeleteMaterial(material.id)}
                                        variant="danger"
                                        className="p-1 h-8 w-8"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                                <pre className="text-xs bg-gray-800 p-2 rounded-md text-gray-300 overflow-auto">
                                    {JSON.stringify(material.properties, null, 2)}
                                </pre>
                            </div>
                        </Card>
                    )) : (
                        <p className="text-gray-400 col-span-full text-center">No materials found. Click "Add Material" to create one.</p>
                    )}
                </div>
            )}

            <AddMaterialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddMaterial} // Pass the handler function to the modal
            />
        </div>
    );
};

export default MaterialLibraryPage;