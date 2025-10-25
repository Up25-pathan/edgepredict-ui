import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import ToolCard from '../../components/library/ToolCard'; // Adjust path if needed
import AddToolModal from '../../components/library/AddToolModal'; // Adjust path if needed
// Removed shadcn Button and AlertDialog imports
// Removed lucide-react import (assuming Add New Tool doesn't need icon now)

const ToolLibraryPage = () => {
    const [tools, setTools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Removed toolToDelete state

    // fetchTools (unchanged)
    const fetchTools = useCallback(async () => {
        setIsLoading(true); setError('');
        try { const response = await api.getTools(); setTools(response.data || []); }
        catch (err) { console.error("Failed to fetch tools:", err); setError('Failed to load tools.'); setTools([]); }
        finally { setIsLoading(false); }
     }, []);

    // Fetch tools on mount (unchanged)
    useEffect(() => { fetchTools(); }, [fetchTools]);

    // Simplified delete handler (uses window.confirm)
    const handleDeleteTool = useCallback(async (toolId) => {
        // Use standard browser confirmation
        // Note: window.confirm blocks execution, which is simple but not ideal UX
        if (window.confirm("Are you sure you want to delete this tool? This action cannot be undone.")) {
            try {
                await api.deleteTool(toolId); // Assumes api.deleteTool exists
                setTools(prevTools => prevTools.filter(tool => tool.id !== toolId));
                setError('');
            } catch (err) {
                console.error("Failed to delete tool:", err);
                setError('Failed to delete tool. Please try again.');
            }
        }
    }, []); // Removed fetchTools dependency

     // handleToolAdded (unchanged)
    const handleToolAdded = useCallback(() => {
        setIsModalOpen(false);
        fetchTools();
     }, [fetchTools]);


    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-100">Tool Library</h2>
                {/* Use standard button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                >
                    + Add New Tool
                </button>
            </div>

            {isLoading && <p className="text-center text-gray-400">Loading tools...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!isLoading && !error && tools.length === 0 && (
                 <p className="text-center text-gray-500 py-10">Your tool library is empty. Click "Add New Tool" to upload your first tool.</p>
             )}

            {!isLoading && !error && tools.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
                    {tools.map(tool => (
                        <ToolCard
                            key={tool.id}
                            tool={tool}
                            onDelete={handleDeleteTool} // Pass the simplified handler
                        />
                    ))}
                </div>
            )}

            {/* Modal for adding a new tool (assumed to be independent of shadcn) */}
            <AddToolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onToolAdded={handleToolAdded}
            />

            {/* Removed AlertDialog */}
        </div>
    );
};

export default ToolLibraryPage;

