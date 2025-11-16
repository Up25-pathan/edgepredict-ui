import React from 'react';
// REMOVED: import { BeakerIcon } from '../../assets/icons'; 
// ADDED: Import Beaker from lucide-react instead
import { Trash2, Beaker } from 'lucide-react'; 

const MaterialCard = ({ material, onDelete }) => {
    // Parse properties if they are a string
    let properties = material.properties;
    if (typeof properties === 'string') {
        try {
            properties = JSON.parse(properties);
        } catch (e) {
            properties = {};
        }
    }

    const handleDeleteClick = (e) => {
        e.stopPropagation(); 
        if (window.confirm(`Are you sure you want to delete "${material.name}"?`)) {
            onDelete(material.id);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-200 group relative">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    {/* Updated Icon */}
                    <Beaker className="w-6 h-6" />
                </div>
                
                {/* Delete Button */}
                <button 
                    onClick={handleDeleteClick}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Material"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{material.name}</h3>
            
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Yield Strength</span>
                    <span className="text-gray-300">{properties.A_yield_strength_MPa || 'N/A'} MPa</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Thermal Softening</span>
                    <span className="text-gray-300">{properties.m_thermal_softening_exp || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Melting Point</span>
                    <span className="text-gray-300">{properties.melting_point_C || 'N/A'} °C</span>
                </div>
            </div>
        </div>
    );
};

export default MaterialCard;