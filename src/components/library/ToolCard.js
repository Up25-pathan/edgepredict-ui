import React, { useState, useEffect } from 'react'; // Removed Suspense, useRef
// Removed all @react-three/fiber, drei, three, STLLoader imports
import api from '../../services/api';

// Simple placeholder icon component (replace with a better SVG or icon library if desired)
const ToolPlaceholderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-gray-500">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
);


// Main ToolCard component - No 3D logic
const ToolCard = ({ tool, onDelete }) => {
  // State for potential download blob (kept in case needed later)
  const [stlBlob, setStlBlob] = useState(null);
  const [isFetchingBlob, setIsFetchingBlob] = useState(false); // Track blob fetching for download

  // --- Removed useEffect for fetching STL for preview ---

  // Download handler - Fetches blob on demand
  const handleDownload = async () => {
    if (!tool || !tool.id) return;
    setIsFetchingBlob(true);
    try {
        const response = await api.getToolFileById(tool.id); // Fetch blob when download is clicked
        if (response.data instanceof Blob) {
            const blob = response.data;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = tool.file_path?.split(/[\\/]/).pop() || `${tool.name?.replace(/ /g, '_') || 'tool'}.stl`;
            link.setAttribute('download', filename);
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setStlBlob(blob); // Optionally store it after first download
        } else {
             throw new Error("Invalid data received for STL file.");
        }
      } catch (err) {
        console.error(`Failed to download STL ${tool.id}:`, err);
        alert("Failed to download the tool file."); // Inform user
      } finally {
        setIsFetchingBlob(false);
      }
   };

  // Delete handler (uses window.confirm)
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete tool "${tool.name}"?`)) {
        onDelete(tool.id);
    }
  };

  return (
    // Card container using Tailwind
    <div className="flex flex-col h-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden transition-shadow duration-200 hover:shadow-xl">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-700">
        <h3 className="text-base font-medium truncate text-gray-100" title={tool.name}>
          {tool.name || 'Unnamed Tool'}
        </h3>
      </div>

      {/* --- REPLACED Canvas container with Placeholder --- */}
      <div className="flex-grow aspect-square relative bg-gray-700 flex items-center justify-center">
        {/* Simple Placeholder Icon */}
        <ToolPlaceholderIcon />
      </div>
      {/* --- END REPLACEMENT --- */}


      {/* Footer */}
      <div className="flex justify-between items-center p-2 bg-gray-700/50 border-t border-gray-600">
        <button
            onClick={handleDownload}
            disabled={isFetchingBlob || !tool || !tool.id}
            className="px-3 py-1 text-xs font-medium text-indigo-300 bg-indigo-900/50 rounded hover:bg-indigo-800/70 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download STL"
        >
          {isFetchingBlob ? '...' : 'Download'}
        </button>
        <button
            onClick={handleDelete}
            className="px-2 py-1 text-xs text-red-400 rounded hover:bg-red-500/20"
            title="Delete Tool"
            aria-label="Delete Tool"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ToolCard;

