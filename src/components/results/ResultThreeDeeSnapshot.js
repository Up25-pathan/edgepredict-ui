import React from 'react';
import Card from '../common/Card';

const ResultThreeDeeSnapshot = () => {
    return (
        <Card className="h-[250px] flex flex-col p-0">
             <div className="bg-hud-dark h-full rounded-md flex items-center justify-center border border-hud-border">
                <p className="text-hud-text-secondary text-sm">3D Snapshot: Max Stress Point</p>
            </div>
        </Card>
    );
};

export default ResultThreeDeeSnapshot;
