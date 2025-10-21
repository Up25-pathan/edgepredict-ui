import React from 'react';
import KeyMetric from './KeyMetric'; // <-- Import the new component

const ReportSection = ({ title, children, color = 'text-white' }) => (
    <div>
        <h4 className={`text-lg font-semibold ${color} border-b border-gray-600 pb-2 mb-3`}>{title}</h4>
        <div className="text-gray-300 space-y-2">{children}</div>
    </div>
);

const AnalysisReport = ({ metrics, material }) => {
    if (!metrics || !material) {
        return <p>Insufficient data for analysis.</p>;
    }

    const { maxStress, fracturedNodes, totalNodes, uts } = metrics;
    const stressVsUtsPercentage = uts > 0 ? (maxStress / uts) * 100 : 0;

    // --- Analysis Logic ---
    const performanceAnalysis = () => { /* ... (This function is unchanged) ... */ };
    const improvementTips = () => { /* ... (This function is unchanged) ... */ };
    
    // --- Helper function to determine status color ---
    const getStressStatusColor = () => {
        if (fracturedNodes > 0 || stressVsUtsPercentage > 90) return 'bg-red-500';
        if (stressVsUtsPercentage > 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-8">
            <ReportSection title="Overall Performance Analysis">
                {/* This analysis text now stands on its own */}
                {
                    fracturedNodes > 0 ? (
                        <p><span className="font-bold text-red-400">Critical Failure Detected.</span> The tool experienced fractures, indicating operational stress exceeded the material's strength.</p>
                    ) : stressVsUtsPercentage > 90 ? (
                        <p><span className="font-bold text-yellow-400">High Risk of Failure.</span> The maximum stress reached {stressVsUtsPercentage.toFixed(1)}% of the material's UTS. The tool is operating at its limit.</p>
                    ) : stressVsUtsPercentage > 70 ? (
                        <p><span className="font-bold text-blue-400">Acceptable Performance.</span> The tool is performing within its safety margin, but stress levels are significant.</p>
                    ) : (
                        <p><span className="font-bold text-green-400">Excellent Performance.</span> The tool is operating well within its material limits with a low risk of failure.</p>
                    )
                }
            </ReportSection>

            {/* --- NEW: Integrated Key Metrics Section --- */}
            <ReportSection title="Key Metrics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KeyMetric 
                        title="Maximum Stress"
                        value={`${maxStress.toFixed(0)} MPa`}
                        subtext={`/ ${uts} MPa (UTS)`}
                        statusColor={getStressStatusColor()}
                    />
                    <KeyMetric 
                        title="Fractured Nodes"
                        value={`${fracturedNodes} / ${totalNodes}`}
                        subtext={`(${(fracturedNodes / totalNodes * 100).toFixed(1)}%)`}
                        statusColor={fracturedNodes > 0 ? 'bg-red-500' : 'bg-green-500'}
                    />
                </div>
            </ReportSection>

            <ReportSection title="Recommendations for Improvement" color="text-indigo-400">
                <ul className="list-disc list-inside space-y-2">
                    { (fracturedNodes > 0 || stressVsUtsPercentage > 90) && <li>**Consider a Stronger Material:** The selected material, {material.name}, may be unsuitable. Look for an alternative with a higher UTS.</li> }
                    { (fracturedNodes > 0 || stressVsUtsPercentage > 90) && <li>**Reduce Strain Rate:** A lower strain rate will decrease stress on the tool.</li> }
                    { stressVsUtsPercentage > 70 && <li>**Improve Cooling:** Increasing the heat transfer coefficient can help maintain the tool's strength.</li> }
                    { stressVsUtsPercentage < 50 && <li>**Potential for Optimization:** The tool is under very low stress. You may be able to increase the strain rate for higher productivity.</li> }
                </ul>
            </ReportSection>
        </div>
    );
};

export default AnalysisReport;