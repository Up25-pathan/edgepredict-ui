import React from 'react';
import Card from '../common/Card';
const MetricCard = ({ title, value, unit }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg text-center">
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h4>
      
      {/* --- THIS IS THE FIX --- */}
      {/* Check if value is 'N/A'. If it is, don't display the unit. */}
      {value === 'N/A' ? (
        <p className="text-3xl font-bold text-gray-500">{value}</p>
      ) : (
        <p className="text-3xl font-bold text-white">
          {value} <span className="text-lg text-gray-300">{unit}</span>
        </p>
      )}
      {/* --- END FIX --- */}

    </div>
  );
};

export default MetricCard;
