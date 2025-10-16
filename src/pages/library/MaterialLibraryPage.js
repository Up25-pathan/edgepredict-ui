import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { api } from '../../services/mockApi';
import AddMaterialModal from '../../components/library/AddMaterialModal'; // Import the modal
import toast from 'react-hot-toast';

const MaterialLibraryPage = () => {
    const [materials, setMaterials] = useState([]); // Start with an empty array
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    // Fetch data from the backend when the component mounts
    useEffect(() => {
        const fetchMaterials = async () => {
            setIsLoading(true);
            try {
                const data = await api.getMaterials();
                setMaterials(data);
            } catch (error) {
                console.error("Error fetching materials:", error);
                toast.error("Could not fetch material library.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    const handleMaterialAdded = (newMaterial) => {
        // Add the new material to the list to update the UI instantly
        setMaterials(prevMaterials => [...prevMaterials, newMaterial]);
    };

    const filteredMaterials = useMemo(() => {
        return materials
            .filter(material => filterType === 'All' || material.type === filterType)
            .filter(material => material.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [materials, searchTerm, filterType]);

    return (
        <>
            <div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-hud-text-primary">Material Library</h2>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 px-3 py-2 bg-hud-dark border border-hud-border rounded-md shadow-sm focus:outline-none focus:ring-hud-primary focus:border-hud-primary text-hud-text-primary"
                        />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-3 pr-10 py-2 bg-hud-dark border-hud-border focus:outline-none focus:ring-hud-primary focus:border-hud-primary rounded-md text-hud-text-primary"
                        >
                            <option value="All">All Types</option>
                            <option value="Workpiece">Workpiece</option>
                            <option value="Tool">Tool</option>
                        </select>
                        {/* This button now opens the modal */}
                        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                            Add New
                        </Button>
                    </div>
                </div>
                <Card>
                    {isLoading ? (
                        <p className="text-hud-text-secondary text-center p-8">Loading materials...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b border-hud-border">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">Material Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">Young's Modulus</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">Thermal Conductivity</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-hud-border">
                                    {filteredMaterials.map((material) => (
                                        <tr key={material.id} className="hover:bg-hud-border transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-hud-text-primary">{material.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">{material.youngs_modulus}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">{material.thermal_conductivity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${material.type === 'Tool' ? 'bg-blue-900 text-blue-200' : 'bg-gray-700 text-gray-300'}`}>
                                                    {material.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Render the AddMaterialModal */}
            <AddMaterialModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onMaterialAdded={handleMaterialAdded}
            />
        </>
    );
};

export default MaterialLibraryPage;

