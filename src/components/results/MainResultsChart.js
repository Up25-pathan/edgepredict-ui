import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const MainResultsChart = ({ data }) => {
    // This hook processes the raw stress data into a sorted array for the line chart
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        // Create an array of points, then sort them by stress value
        return data
            .map((stress, index) => ({ index, stress }))
            .sort((a, b) => a.stress - b.stress);
    }, [data]);

    if (!chartData || chartData.length === 0) {
        return <p className="text-gray-400">No data available for chart.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis 
                    dataKey="index" 
                    stroke="#9CA3AF" 
                    tick={false} // Hide the individual index numbers for a cleaner look
                    label={{ value: 'Nodes (Sorted by Stress)', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
                />
                <YAxis 
                    stroke="#9CA3AF" 
                    label={{ value: 'Stress (MPa)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} 
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                    labelFormatter={() => ''} // Hide the index label in the tooltip
                    formatter={(value) => [`${value.toFixed(2)} MPa`, 'Stress']}
                />
                <Line 
                    type="monotone" 
                    dataKey="stress" 
                    stroke="#818CF8" 
                    strokeWidth={2} 
                    dot={false} 
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MainResultsChart;