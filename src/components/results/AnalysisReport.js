import React from 'react';
import { Sparkles, BrainCircuit, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';

// Simple markdown-like parser for standard AI response format
const FormattedReport = ({ text }) => {
    if (!text) return null;
    
    // Split by double newlines to get paragraphs/sections
    const sections = text.split('\n\n');
    
    return (
        <div className="space-y-4 text-gray-300 leading-relaxed">
            {sections.map((section, i) => {
                // Bold headings (lines starting with **)
                if (section.trim().startsWith('**')) {
                    return <h4 key={i} className="text-indigo-300 font-semibold mt-4">{section.replace(/\*\*/g, '')}</h4>;
                }
                // Bullet points
                if (section.trim().startsWith('* ')) {
                    const items = section.split('\n').filter(line => line.trim().startsWith('* '));
                    return (
                        <ul key={i} className="list-disc list-inside space-y-1 pl-2">
                            {items.map((item, j) => (
                                <li key={j}>{item.replace('* ', '')}</li>
                            ))}
                        </ul>
                    );
                }
                // Numbered lists
                if (section.trim().match(/^\d\./)) {
                     const items = section.split('\n').filter(line => line.trim().match(/^\d\./));
                     return (
                        <ol key={i} className="list-decimal list-inside space-y-1 pl-2">
                            {items.map((item, j) => (
                                <li key={j} className="pl-1">{item.replace(/^\d\.\s*/, '')}</li>
                            ))}
                        </ol>
                    );
                }
                // Standard paragraph
                return <p key={i}>{section}</p>;
            })}
        </div>
    );
};

const AnalysisReport = ({ reportContentOverride, isGenerating }) => {
    // 1. LOADING STATE (Generating)
    if (isGenerating) {
        return (
            <Card>
                <div className="p-6 space-y-6 animate-pulse">
                    <div className="flex items-center space-x-3 text-indigo-400">
                        <BrainCircuit className="w-6 h-6 animate-spin-slow" />
                        <span className="text-lg font-semibold">Generating Expert Analysis...</span>
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-800 rounded w-full"></div>
                        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                    </div>
                    <div className="space-y-3 pt-4">
                        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-800 rounded w-full"></div>
                        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                    </div>
                </div>
            </Card>
        );
    }

    // 2. ERROR STATE (Failed to generate)
    if (!reportContentOverride || reportContentOverride.startsWith("Error:")) {
        return (
             <Card>
                <div className="p-6 flex items-center text-red-400 space-x-3">
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                        <h4 className="font-semibold">Analysis Unavailable</h4>
                        <p className="text-sm text-red-400/70">
                            {reportContentOverride || "Could not generate AI report at this time."}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    // 3. SUCCESS STATE (Show Report)
    return (
        <div className="bg-gradient-to-br from-gray-900 to-indigo-950/20 rounded-xl border border-indigo-500/30 overflow-hidden">
            <div className="p-4 bg-indigo-950/50 border-b border-indigo-500/20 flex items-center">
                <Sparkles className="w-5 h-5 text-indigo-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">EdgePredict AI Report</h3>
            </div>
            <div className="p-6">
                <FormattedReport text={reportContentOverride} />
            </div>
        </div>
    );
};

export default AnalysisReport;