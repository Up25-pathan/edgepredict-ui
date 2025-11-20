import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import MaterialCard from '../../components/library/MaterialCard';
import AddMaterialModal from '../../components/library/AddMaterialModal';
import api from '../../services/api';

const MaterialLibraryPage = () => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const response = await api.getMaterials();
            setMaterials(response.data);
        } catch (error) {
            console.error("Failed to fetch materials:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleDeleteMaterial = async (id) => {
        try {
            await api.deleteMaterial(id);
            // Optimistic update or refetch
            setMaterials(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Failed to delete material:", error);
            alert("Failed to delete material. It might be in use or you may not have permission.");
        }
    };

    const filteredMaterials = materials.filter(mat => 
        mat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Material Library</h1>
                    <p className="text-gray-400">Manage workpiece materials and their physical properties.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Material
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search materials..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                    />
                </div>
                <button 
                    onClick={fetchMaterials}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading materials...</div>
                ) : filteredMaterials.length > 0 ? (
                    filteredMaterials.map(material => (
                        <MaterialCard 
                            key={material.id} 
                            material={material} 
                            onDelete={handleDeleteMaterial} // Pass delete handler
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                        <p className="text-gray-500">No materials found. Create one to get started.</p>
                    </div>
                )}
            </div>

            <AddMaterialModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onMaterialAdded={fetchMaterials}
            />
        </div>
    );
};

export default MaterialLibraryPage;