import React from 'react';
import { TrashIcon, DatabaseIcon } from '../../assets/icons'; // Using DatabaseIcon as a generic material icon for now

const MaterialCard = ({ material, onDelete }) => {
    // Safely parse properties if they are a string, or use directly if object
    let props = {};
    try {
        props = typeof material.properties === 'string' 
            ? JSON.parse(material.properties) 
            : material.properties;
    } catch (e) {
        console.error("Error parsing material properties", e);
    }

    return (
        <div className="relative group bg-hud-surface/40 backdrop-blur-md border border-hud-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-hud-primary/30">
            {/* Top Highlight Line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hud-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-hud-primary/10 rounded-lg mr-3">
                             {/* You can replace this with a specific 'ingot' icon later if you add one */}
                            <DatabaseIcon className="w-5 h-5 text-hud-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">{material.name}</h3>
                            <span className="text-xs text-hud-text-secondary">Standard Material</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onDelete(material.id)}
                        className="p-2 text-hud-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete Material"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Key Properties Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-hud-bg/50 p-3 rounded-lg border border-hud-border/50">
                        <p className="text-xs text-hud-text-secondary mb-1">Yield Strength</p>
                        <p className="font-mono text-sm text-white">
                            {props.A_yield_strength_MPa ? `${props.A_yield_strength_MPa} MPa` : 'N/A'}
                        </p>
                    </div>
                    <div className="bg-hud-bg/50 p-3 rounded-lg border border-hud-border/50">
                        <p className="text-xs text-hud-text-secondary mb-1">Melting Point</p>
                        <p className="font-mono text-sm text-white">
                            {props.melting_point_C ? `${props.melting_point_C} °C` : 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Footer / ID */}
                <div className="flex justify-between items-center pt-3 border-t border-hud-border/30 text-xs text-hud-text-secondary font-mono">
                     <span>ID: {material.id.toString().padStart(4, '0')}</span>
                     {/* Optional: Add a 'View Details' link if you ever build a detailed view page */}
                </div>
            </div>
        </div>
    );
};

export default MaterialCard;