import React from 'react';
import Card from '../common/Card';

const InProgressDisplay = ({ status }) => {
    return (
        <Card>
            <div className="p-8 text-center flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                <h3 className="text-xl font-bold text-yellow-400 mt-6">
                    Simulation is {status}...
                </h3>
                <p className="text-gray-400 mt-2">
                    The page will automatically update when the results are ready. Please wait.
                </p>
            </div>
        </Card>
    );
};

export default InProgressDisplay;