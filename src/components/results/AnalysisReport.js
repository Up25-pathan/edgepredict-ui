import React, { useState } from 'react';
import api from '../../services/api';
import { Sparkles, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AnalysisReport = ({ simulationData, peakMetrics }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [report, setReport] = useState(null);

    // --- THIS IS THE FIX ---
    // If the props haven't loaded yet, return a skeleton placeholder.
    // This prevents the "Cannot read properties of undefined" crash.
    if (!peakMetrics || !simulationData) {
        return (
            <div className="bg-gray-900 rounded-lg p-6 relative animate-pulse">
                <h3 className="text-lg font-semibold text-white mb-4">Analysis & Recommendations</h3>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        );
    }
    // --- END FIX ---

    // Now that we know peakMetrics exists, we can safely define staticReport.
    const staticReport = `
The simulation completed successfully. 
The tool experienced a peak temperature of **${peakMetrics.temp.toFixed(1)} °C** and a max stress of **${peakMetrics.stress.toFixed(1)} MPa**. 
This resulted in **${peakMetrics.fractured} fractured nodes** and a final predicted tool life of **${peakMetrics.life.toFixed(1)} hours**.
`;

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError(null);
        setReport(null);
        try {
            const res = await api.generateReport(simulationData.id);
            setReport(res.data.analysis);
        } catch (err) {
            console.error("Error generating AI report:", err);
            setError("Failed to generate AI analysis. Please try again.");
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-gray-900 rounded-lg p-6 relative">
            <h3 className="text-lg font-semibold text-white mb-4">Analysis & Recommendations</h3>
            
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-wait transition-all"
                >
                    <Sparkles className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Generating...' : 'Generate AI Analysis'}
                </button>
            </div>

            {error && (
                <div className="flex items-center p-3 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-md mb-4">
                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div>{error}</div>
                </div>
            )}

            <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                {report ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {report}
                    </ReactMarkdown>
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {staticReport}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
};

export default AnalysisReport;