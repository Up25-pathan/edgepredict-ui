import React, { useState, useEffect } from 'react';
// FIXED: Added DatabaseIcon to top imports
import { PlusIcon, DatabaseIcon } from '../../assets/icons';
import MaterialCard from '../../components/library/MaterialCard';
import AddMaterialModal from '../../components/library/AddMaterialModal';
import api from '../../services/api';

const MaterialLibraryPage = () => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleAddMaterial = async (newMaterial) => {
        try {
            await api.createMaterial(newMaterial);
            setIsModalOpen(false);
            fetchMaterials(); 
        } catch (err) {
            console.error("Failed to add material:", err);
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (window.confirm('Are you sure you want to delete this material?')) {
            try {
                await api.deleteMaterial(materialId);
                fetchMaterials();
            } catch (err) {
                console.error("Failed to delete material:", err);
            }
        }
    };

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-hud-text-primary tracking-tight">Material Library</h1>
                    <p className="text-hud-text-secondary mt-1">Manage workpiece materials for simulation</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-hud-primary hover:bg-hud-primary-hover text-white font-medium rounded-lg transition-all shadow-lg shadow-hud-glow/20 hover:shadow-hud-glow/50"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Material
                </button>
            </div>

            {/* Content Section */}
            {isLoading && (
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hud-primary"></div>
                </div>
            )}
            
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center">
                    {error}
                </div>
            )}
            
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {materials.length > 0 ? materials.map(material => (
                        <MaterialCard 
                            key={material.id} 
                            material={material} 
                            onDelete={handleDeleteMaterial} 
                        />
                    )) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-hud-text-secondary border-2 border-dashed border-hud-border rounded-xl">
                            <DatabaseIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No materials found</p>
                            <p className="text-sm mt-1">Click "New Material" to add your first one.</p>
                        </div>
                    )}
                </div>
            )}

            <AddMaterialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddMaterial}
            />
        </div>
    );
};

export default MaterialLibraryPage;