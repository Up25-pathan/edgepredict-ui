import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import ToolCard from '../../components/library/ToolCard';
import AddToolModal from '../../components/library/AddToolModal';
// Make sure these icons are in your assets/icons.js
import { PlusIcon, ToolIcon } from '../../assets/icons';

const ToolLibraryPage = () => {
    const [tools, setTools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTools = useCallback(async () => {
        setIsLoading(true); setError('');
        try { 
            const response = await api.getTools(); 
            setTools(response.data || []); 
        }
        catch (err) { 
            console.error("Failed to fetch tools:", err); 
            setError('Failed to load tools.'); 
            setTools([]); 
        }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { 
        fetchTools(); 
    }, [fetchTools]);

    const handleDeleteTool = useCallback(async (toolId) => {
        if (window.confirm("Are you sure you want to delete this tool? This action cannot be undone.")) {
            try {
                await api.deleteTool(toolId);
                setTools(prevTools => prevTools.filter(tool => tool.id !== toolId));
                setError('');
            } catch (err) {
                console.error("Failed to delete tool:", err);
                setError('Failed to delete tool. Please try again.');
            }
        }
    }, []);

    const handleCreateTool = useCallback(async (formData) => {
        setError('');
        try {
            await api.createTool(formData);
            setIsModalOpen(false);
            fetchTools();
        } catch (err) {
            console.error("Failed to add tool:", err);
            setError('Failed to add tool. Please try again.');
        }
    }, [fetchTools]);

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-hud-text-primary tracking-tight">Tool Library</h1>
                    <p className="text-hud-text-secondary mt-1">Manage 3D tool geometries for simulation</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-hud-primary hover:bg-hud-primary-hover text-white font-medium rounded-lg transition-all shadow-lg shadow-hud-glow/20 hover:shadow-hud-glow/50"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Tool
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
                    {tools.length > 0 ? tools.map(tool => (
                        <ToolCard
                            key={tool.id}
                            tool={tool}
                            onDelete={handleDeleteTool} 
                        />
                    )) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-hud-text-secondary border-2 border-dashed border-hud-border rounded-xl">
                            <ToolIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No tools found</p>
                            <p className="text-sm mt-1">Click "New Tool" to upload your first one.</p>
                        </div>
                    )}
                </div>
            )}

            <AddToolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleCreateTool} 
            />
        </div>
    );
};

export default ToolLibraryPage;