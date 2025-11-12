import React from 'react';
// Make sure you add 'ToolIcon' and 'TrashIcon' to your assets/icons.js file
import { ToolIcon, TrashIcon } from '../../assets/icons'; 

const ToolCard = ({ tool, onDelete }) => {

    // Helper to get a clean file type (e.g., "STEP", "STL")
    const getFileType = (filePath) => {
        if (!filePath) return 'N/A';
        const parts = filePath.split('.');
        return parts[parts.length - 1].toUpperCase();
    };

    return (
        <div className="relative group bg-hud-surface/40 backdrop-blur-md border border-hud-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-hud-primary/30">
            {/* Top Highlight Line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hud-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-hud-primary/10 rounded-lg mr-3">
                            <ToolIcon className="w-5 h-5 text-hud-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight truncate" title={tool.name}>
                                {tool.name}
                            </h3>
                            <span className="text-xs text-hud-text-secondary">{tool.tool_type || 'General Tool'}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onDelete(tool.id)}
                        className="p-2 text-hud-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete Tool"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Key Properties */}
                <div className="space-y-2 mb-4">
                    <div className="bg-hud-bg/50 p-3 rounded-lg border border-hud-border/50">
                        <p className="text-xs text-hud-text-secondary mb-1">File Format</p>
                        <p className="font-mono text-sm text-white font-bold">
                            {getFileType(tool.file_path)}
                        </p>
                    </div>
                    {/* You could add more properties here later, like Diameter or Flutes, if you store them */}
                </div>

                {/* Footer / ID */}
                <div className="flex justify-between items-center pt-3 border-t border-hud-border/30 text-xs text-hud-text-secondary font-mono">
                     <span>ID: {tool.id.toString().padStart(4, '0')}</span>
                     <span className="px-2 py-0.5 bg-hud-primary/20 text-hud-primary rounded-full">
                        {getFileType(tool.file_path)}
                     </span>
                </div>
            </div>
        </div>
    );
};

export default ToolCard;