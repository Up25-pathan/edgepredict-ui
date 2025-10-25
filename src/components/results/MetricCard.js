import React from 'react';
import Card from '../common/Card';

const MetricCard = ({ title, value, subtext, progress, progressColor = 'bg-indigo-500' }) => {
  return (
    <Card>
      <div className="p-5">
        <p className="text-sm font-medium text-gray-400 truncate">{title}</p>
        <div className="mt-1 flex items-baseline">
          <p className="text-2xl font-semibold text-white">{value}</p>
          {subtext && <p className="ml-2 text-sm text-gray-500">{subtext}</p>}
        </div>
        {progress !== undefined && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
            <div
              className={`${progressColor} h-2 rounded-full`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;