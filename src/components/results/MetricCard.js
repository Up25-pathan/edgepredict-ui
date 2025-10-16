import React from 'react';
import Card from '../common/Card';

const MetricCard = ({ label, value, unit }) => {
    // Special styling for the 'Outcome' card
    const isOutcome = label === 'Outcome';
    const outcomeColor = value === 'Success' ? 'text-green-400' : 'text-red-400';

    return (
        <Card className="!p-4">
            <p className="text-sm text-hud-text-secondary mb-1">{label}</p>
            <p className={`text-3xl font-bold font-mono ${isOutcome ? outcomeColor : 'text-hud-text-primary'}`}>
                {value}
                <span className="text-lg ml-1 text-hud-text-secondary">{unit}</span>
            </p>
        </Card>
    );
};

export default MetricCard;
