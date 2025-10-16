import React from 'react';
import Card from '../common/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MainResultsChart = ({ data }) => {
    return (
        <Card className="h-[400px]">
            <h3 className="text-lg font-bold text-hud-text-primary mb-4">Temperature vs. Time</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                    <XAxis dataKey="time" stroke="#8B949E" label={{ value: 'Time (min)', position: 'insideBottom', offset: -15, fill: '#8B949E' }} />
                    <YAxis stroke="#8B949E" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#8B949E' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }} />
                    <Legend wrapperStyle={{ color: '#C9D1D9' }} />
                    <Line type="monotone" dataKey="temperature" stroke="#58A6FF" strokeWidth={2} dot={false} name="Max Temperature" />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default MainResultsChart;
