import React, { useState, useEffect } from 'react';
import { PlusIcon } from '../../assets/icons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import AddToolModal from '../../components/library/AddToolModal';
import ToolCard from '../../components/library/ToolCard';
import api from '../../services/api';

const ToolLibraryPage = () => {
    const [tools, setTools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to fetch tools from the backend
    const fetchTools = async () => {
        try {
            setIsLoading(true);
            const response = await api.getTools();
            setTools(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch tools:", err);
            setError("Could not load tools.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch tools when the component first loads
    useEffect(() => {
        fetchTools();
    }, []);

    // Function to handle adding a new tool
    const handleAddTool = async (formData) => {
        try {
            await api.createTool(formData);
            // After success, close the modal and refresh the list
            setIsModalOpen(false);
            fetchTools();
        } catch (err) {
            console.error("Failed to add tool:", err);
            // You could pass an error message back to the modal here
        }
    };

    // Function to handle deleting a tool
    const handleDeleteTool = async (toolId) => {
        if (window.confirm('Are you sure you want to delete this tool?')) {
            try {
                await api.deleteTool(toolId);
                // Refresh the list after deleting
                fetchTools();
            } catch (err) {
                console.error("Failed to delete tool:", err);
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Tool Library</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Tool
                </Button>
            </div>

            {isLoading && <p className="text-center text-gray-400">Loading tools...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!isLoading && !error && (
                 tools.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {tools.map(tool => (
                            <ToolCard 
                                key={tool.id} 
                                tool={tool} 
                                onDelete={() => handleDeleteTool(tool.id)} 
                            />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <div className="p-5 text-center text-gray-400">
                            <p>No tools found in your library.</p>
                            <p>Click "Add Tool" to upload one.</p>
                        </div>
                    </Card>
                )
            )}

            <AddToolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddTool}
            />
        </div>
    );
};

export default ToolLibraryPage;