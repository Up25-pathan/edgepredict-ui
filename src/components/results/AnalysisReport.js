import React, { useMemo } from 'react';

// Helper component for displaying key metrics (assumed to exist)
// import KeyMetric from './KeyMetric';

// --- Helper function to format large numbers ---
const formatWear = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    if (value === 0) return '0.00';
    return value.toExponential(2);
};

// --- Analysis Report Component ---
const AnalysisReport = ({ metrics, material, timeSeriesData }) => {

    // --- NEW: Dynamic Analysis Logic ---
    const { analysisText, recommendationText } = useMemo(() => {
        let analysis = "Analysis could not be generated.";
        let recommendation = "Ensure simulation completed successfully and data is valid.";

        if (!metrics || !material || !timeSeriesData || timeSeriesData.length === 0) {
            return { analysisText: analysis, recommendationText: recommendation };
        }

        const uts = metrics.uts || Infinity; // Get Ultimate Tensile Strength
        const maxStress = metrics.maxStress;
        const didFracture = metrics.fracturedNodes > 0;
        const lastStepData = timeSeriesData[timeSeriesData.length - 1];
        const finalWear = lastStepData?.total_accumulated_wear ?? 0;
        const stressRatio = maxStress / uts;

        // Find step where fracture first occurred (if it did)
        let fractureStep = null;
        if (didFracture) {
            const firstFractureEntry = timeSeriesData.find(step => step.fractured_nodes_count > 0);
            fractureStep = firstFractureEntry?.step;
        }

        // --- Basic Decision Logic ---
        if (didFracture) {
            analysis = `Tool failure occurred around step ${fractureStep ?? 'N/A'}. Maximum stress reached ${maxStress.toFixed(1)} MPa, exceeding the material's UTS of ${uts.toFixed(1)} MPa.`;
            recommendation = "High risk of tool breakage under these conditions. RECOMMENDATION: Significantly reduce cutting parameters (speed, feed, depth of cut) or select a tool/material with higher strength.";
        } else if (stressRatio > 0.9) { // High stress, near UTS
            analysis = `Simulation completed without fracture, but stress levels were very high (Max: ${maxStress.toFixed(1)} MPa, approaching UTS: ${uts.toFixed(1)} MPa). Total accumulated wear was ${formatWear(finalWear)}.`;
            recommendation = `High risk of fracture. RECOMMENDATION: Reduce cutting parameters moderately. Monitor tool condition closely during operation. Consider a stronger tool if possible. Wear appears manageable but monitor.`;
        } else if (stressRatio > 0.7) { // Moderate stress
             // Basic wear threshold (example: adjust based on units/expected values)
            const wearThreshold = 1e-5; // Example threshold - NEEDS ADJUSTMENT BASED ON REAL UNITS/SCALE
            if (finalWear > wearThreshold) {
                 analysis = `Simulation completed successfully. Maximum stress (${maxStress.toFixed(1)} MPa) remained well below UTS (${uts.toFixed(1)} MPa). However, predicted tool wear (${formatWear(finalWear)}) is notable.`;
                 recommendation = `Fracture risk is low, but tool life may be limited by wear. RECOMMENDATION: Consider minor adjustments to reduce wear (e.g., slightly lower speed, improved cooling) or use a more wear-resistant tool coating/material.`;
            } else {
                 analysis = `Simulation completed successfully. Maximum stress (${maxStress.toFixed(1)} MPa) was moderate and well below UTS (${uts.toFixed(1)} MPa). Predicted tool wear (${formatWear(finalWear)}) was minimal.`;
                 recommendation = `Parameters appear safe regarding fracture and wear. RECOMMENDATION: Current setup is likely reliable. Potential exists to cautiously increase parameters for higher productivity if desired.`;
            }
        } else { // Low stress
             const wearThreshold = 1e-5; // Example threshold
             if (finalWear > wearThreshold) {
                 analysis = `Simulation completed successfully with low stress levels (Max: ${maxStress.toFixed(1)} MPa). However, predicted tool wear (${formatWear(finalWear)}) is notable despite low stress, possibly due to thermal effects or material properties.`;
                 recommendation = `Fracture risk is very low. Focus on managing tool wear. RECOMMENDATION: Investigate cause of wear (thermal, abrasive?). Consider coatings, different tool material, or optimized cooling.`;
            } else {
                analysis = `Simulation completed successfully with low stress levels (Max: ${maxStress.toFixed(1)} MPa) and minimal predicted wear (${formatWear(finalWear)}).`;
                recommendation = `Parameters appear very safe. RECOMMENDATION: Significant potential to increase cutting parameters (speed, feed, depth) for improved productivity, while monitoring wear and stress.`;
            }
        }

        return { analysisText: analysis, recommendationText: recommendation };

    }, [metrics, material, timeSeriesData]);
    // --- END Dynamic Analysis ---

    // Fallback if metrics or material aren't loaded yet
    if (!metrics || !material) {
        return <div className="text-gray-400">Loading analysis data...</div>;
    }

    return (
        <div className="space-y-6 text-gray-300">
            {/* --- Section 1: Key Metrics (Displays numbers) --- */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                   {/* Using a simpler display for now, assuming KeyMetric component isn't essential */}
                   <div className="bg-gray-700 p-3 rounded-lg shadow">
                       <div className="text-sm text-gray-400">Max Stress</div>
                       <div className="text-lg font-bold text-white">{metrics.maxStress?.toFixed(1) ?? 'N/A'} MPa</div>
                   </div>
                   <div className="bg-gray-700 p-3 rounded-lg shadow">
                       <div className="text-sm text-gray-400">UTS</div>
                       <div className="text-lg font-bold text-white">{metrics.uts?.toFixed(1) ?? 'N/A'} MPa</div>
                   </div>
                    <div className="bg-gray-700 p-3 rounded-lg shadow">
                       <div className="text-sm text-gray-400">Fractured Nodes</div>
                       <div className={`text-lg font-bold ${metrics.fracturedNodes > 0 ? 'text-red-400' : 'text-green-400'}`}>
                           {metrics.fracturedNodes ?? 'N/A'} / {metrics.totalNodes ?? 'N/A'}
                       </div>
                   </div>
                   <div className="bg-gray-700 p-3 rounded-lg shadow">
                       <div className="text-sm text-gray-400">Final Total Wear</div>
                       <div className="text-lg font-bold text-white">
                           {/* Use the value from the last time step if available */}
                           {formatWear(timeSeriesData?.[timeSeriesData.length - 1]?.total_accumulated_wear)}
                        </div>
                   </div>
                </div>
            </div>

            {/* --- Section 2: Overall Performance Analysis (Uses dynamic text) --- */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-600 pb-2">Overall Performance Analysis</h3>
                <p className="text-sm leading-relaxed">
                    {analysisText} {/* <-- Use dynamic analysis text */}
                </p>
            </div>

            {/* --- Section 3: Recommendations (Uses dynamic text) --- */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-600 pb-2">Recommendations</h3>
                <p className="text-sm leading-relaxed">
                   {recommendationText} {/* <-- Use dynamic recommendation text */}
                </p>
            </div>
        </div>
    );
};

export default AnalysisReport;