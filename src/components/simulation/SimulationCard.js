import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const SimulationCard = ({ simulation }) => {
    const { id, name, status, date } = simulation;

    const statusStyles = {
        Completed: 'bg-green-500',
        Running: 'bg-yellow-500',
        Failed: 'bg-red-500',
    };

    const statusClass = statusStyles[status] || 'bg-gray-500';

    return (
        <Card className="flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                    <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${statusClass}`}></span>
                        <span className="text-sm font-semibold text-gray-600">{status}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500">Last run: {date}</p>
            </div>
            <div className="mt-6 flex gap-2">
                <Link to={`/simulations/${id}`} className="w-full">
                    <Button variant="primary" className="w-full">View Results</Button>
                </Link>
                <Button variant="secondary" className="w-full">Run Again</Button>
            </div>
        </Card>
    );
};

export default SimulationCard;

