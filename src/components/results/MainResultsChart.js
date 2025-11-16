import React from 'react';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Legend, 
    CartesianGrid 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && label !== undefined) {
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-700 rounded-md shadow-lg" style={{ zIndex: 100 }}>
                <p className="text-gray-300 text-sm font-semibold mb-2">{`Time: ${Number(label).toFixed(3)} s`}</p>
                {payload.map((p) => (
                    <p key={p.name} style={{ color: p.color }} className="text-sm">
                        {`${p.name}: `}
                        {p.name === 'Stress' && `${(p.value || 0).toFixed(1)} MPa`}
                        {p.name === 'Temperature' && `${(p.value || 0).toFixed(1)} °C`}
                        {p.name === 'Wear' && `${(p.value || 0).toExponential(2)} m`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const MainResultsChart = ({ data }) => {
    return (
        // FIX: Wrapper div ensures ResponsiveContainer has a strictly defined bounding box.
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ResponsiveContainer width="99%" height="100%" debounce={100}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    
                    <XAxis 
                        dataKey="time" 
                        stroke="#9ca3af" 
                        tick={{ fontSize: 12 }} 
                        unit="s" 
                        tickFormatter={(val) => Number(val).toFixed(2)} 
                        minTickGap={30}
                    />
                    
                    <YAxis 
                        yAxisId="left" 
                        stroke="#9ca3af" 
                        tick={{ fontSize: 12 }} 
                        label={{ value: 'Stress (MPa) / Temp (°C)', angle: -90, position: 'insideLeft', fill: '#9ca3af', dx: -10 }}
                    />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#3b82f6" 
                        tick={{ fontSize: 12 }} 
                        tickFormatter={(val) => Number(val).toExponential(1)}
                        label={{ value: 'Wear (m)', angle: 90, position: 'insideRight', fill: '#3b82f6', dx: 10 }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />

                    <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="Temperature" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false} 
                        name="Temperature"
                        unit="°C"
                    />
                    <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="Stress" 
                        stroke="#eab308" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        name="Stress"
                        unit="MPa"
                    />
                    <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="Wear" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        name="Wear"
                        unit="m"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MainResultsChart;