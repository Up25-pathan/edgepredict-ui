import React from 'react';

const KeyMetric = ({ title, value, subtext, statusColor = 'bg-gray-500' }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <div className="flex items-baseline mt-1">
                    <p className="text-xl font-semibold text-white">{value}</p>
                    {subtext && <p className="ml-2 text-sm text-gray-400">{subtext}</p>}
                </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
        </div>
    );
};

export default KeyMetric;