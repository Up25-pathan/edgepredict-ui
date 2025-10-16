import React, { useState, useEffect } from 'react';
import ToolCard from '../../components/library/ToolCard';
import Button from '../../components/common/Button';
import { api } from '../../services/mockApi';
import AddToolModal from '../../components/library/AddToolModal';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';

const ToolLibraryPage = () => {
    const [tools, setTools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTools = async () => {
            setIsLoading(true);
            try {
                const data = await api.getTools();
                setTools(data);
            } catch (error) {
                console.error("Error fetching tools:", error);
                toast.error("Could not fetch tool library.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTools();
    }, []);

    const handleToolAdded = (newTool) => {
        setTools(prevTools => [...prevTools, newTool]);
    };

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-hud-text-primary">Tool Library</h2>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        Add New Tool
                    </Button>
                </div>

                {isLoading ? (
                    <p className="text-hud-text-secondary text-center p-8">Loading tools...</p>
                ) : tools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tools.map(tool => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                ) : (
                     <Card>
                        <div className="text-center p-8">
                            <h3 className="text-lg font-medium text-hud-text-primary">No Tools Found</h3>
                            <p className="mt-1 text-sm text-hud-text-secondary">
                                Get started by adding your first tool to the library.
                            </p>
                        </div>
                    </Card>
                )}
            </div>

            <AddToolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onToolAdded={handleToolAdded}
            />
        </>
    );
};

export default ToolLibraryPage;

