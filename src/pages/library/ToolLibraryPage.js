import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import ToolCard from '../../components/library/ToolCard';
import AddToolModal from '../../components/library/AddToolModal';
import api from '../../services/api';

const ToolLibraryPage = () => {
    const [tools, setTools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTools = async () => {
        setIsLoading(true);
        try {
            const response = await api.getTools();
            setTools(response.data);
        } catch (error) {
            console.error("Failed to fetch tools:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTools();
    }, []);

    const handleDeleteTool = async (id) => {
        try {
            await api.deleteTool(id);
            // Optimistic update
            setTools(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete tool:", error);
            alert("Failed to delete tool. It might be in use or you may not have permission.");
        }
    };

    const filteredTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Tool Library</h1>
                    <p className="text-gray-400">Manage cutting tool geometries and files.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Tool
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search tools..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                    />
                </div>
                <button 
                    onClick={fetchTools}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading tools...</div>
                ) : filteredTools.length > 0 ? (
                    filteredTools.map(tool => (
                        <ToolCard 
                            key={tool.id} 
                            tool={tool} 
                            onDelete={handleDeleteTool} // Pass delete handler
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                        <p className="text-gray-500">No tools found. Upload one to get started.</p>
                    </div>
                )}
            </div>

            <AddToolModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onToolAdded={fetchTools}
            />
        </div>
    );
};

export default ToolLibraryPage;