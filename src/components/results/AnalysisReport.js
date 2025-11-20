import React, { useEffect, useState } from 'react';
import { FileText, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const AnalysisReport = ({ simulationId, initialData }) => {
    const [analysis, setAnalysis] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to manually trigger generation if it's missing
    const generateReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.generateReport(simulationId);
            setAnalysis(res.data.analysis);
        } catch (err) {
            console.error(err);
            setError("Failed to generate AI report.");
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-red-400 p-4 text-center">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">{error}</p>
                <button onClick={generateReport} className="mt-4 text-xs underline hover:text-white">Retry</button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-indigo-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-xs font-medium">Analyzing Physics Data...</p>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
                <FileText className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm text-center mb-4">
                    No analysis report generated yet for this simulation.
                </p>
                <button 
                    onClick={generateReport}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-colors border border-gray-700"
                >
                    Generate R&D Report
                </button>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="prose prose-invert prose-sm max-w-none">
                {/* Simple markdown-like rendering */}
                {analysis.split('\n').map((line, i) => (
                    <p key={i} className={`
                        ${line.startsWith('#') ? 'text-lg font-bold text-white mt-4 mb-2' : 'text-gray-300 mb-2'}
                        ${line.startsWith('-') ? 'pl-4 border-l-2 border-indigo-500/30' : ''}
                    `}>
                        {line.replace(/^#\s*/, '').replace(/^-\s*/, '')}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default AnalysisReport;