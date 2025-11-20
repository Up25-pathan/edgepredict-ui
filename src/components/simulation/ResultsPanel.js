import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const ResultsPanel = ({ metrics }) => {
    const metricItems = [
        { label: "Max Von Mises Stress", value: `${metrics.maxVonMisesStress} MPa`, description: "Primary indicator for fracture risk." },
        { label: "Max Temperature", value: `${metrics.maxTemperature} °C`, description: "Critical for predicting thermal softening and wear." },
        { label: "Bending Deflection", value: `${metrics.bendingDeflection} mm`, description: "Affects final part accuracy and surface finish." },
        { label: "Tool Life Estimate", value: `${metrics.toolLifeEstimate} min`, description: "Based on calibrated wear models." },
    ];

    return (
        <Card className="h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Key Output Metrics</h3>
            <div className="space-y-4">
                {metricItems.map(item => (
                    <div key={item.label} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-baseline">
                            <p className="text-sm font-medium text-gray-600">{item.label}</p>
                            <p className="text-lg font-bold text-blue-600">{item.value}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t">
                <Button variant="primary" className="w-full">Download Full Report (PDF)</Button>
            </div>
        </Card>
    );
};

export default ResultsPanel;
