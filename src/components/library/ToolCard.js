import React from 'react';
import { ToolIcon } from '../../assets/icons';
import { Trash2, Download } from 'lucide-react'; // Import icons
import api from '../../services/api';

const ToolCard = ({ tool, onDelete }) => {
    
    const handleDownload = async (e) => {
        e.stopPropagation();
        try {
            const response = await api.getToolFileById(tool.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            // Extract filename from path or default
            const filename = tool.file_path ? tool.file_path.split('/').pop().split('\\').pop() : 'tool_geometry.step';
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download tool file.");
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${tool.name}"?`)) {
            onDelete(tool.id);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-200 group relative">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    <ToolIcon className="w-6 h-6" />
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Download Button */}
                    <button 
                        onClick={handleDownload}
                        className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Download File"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                        onClick={handleDeleteClick}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Tool"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
            
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-300">{tool.tool_type || 'Standard'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">File Format</span>
                    <span className="text-gray-300 uppercase">
                        {tool.file_path ? tool.file_path.split('.').pop() : 'Unknown'}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ID</span>
                    <span className="text-gray-600">#{tool.id}</span>
                </div>
            </div>
        </div>
    );
};

export default ToolCard;