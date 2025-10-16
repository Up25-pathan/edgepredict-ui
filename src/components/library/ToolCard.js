import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const ToolCard = ({ tool }) => {
    return (
        <Card className="flex flex-col transition-all duration-300 hover:border-hud-primary hover:shadow-2xl hover:shadow-hud-glow/50">
            {/* Placeholder for a 3D preview thumbnail */}
            <div className="bg-hud-dark h-40 rounded-md mb-4 flex items-center justify-center border border-hud-border">
                <p className="text-hud-text-secondary text-sm">3D Preview Thumbnail</p>
            </div>
            
            <h3 className="font-bold text-lg text-hud-text-primary truncate">{tool.name}</h3>
            <p className="text-sm text-hud-text-secondary mb-4 flex-grow">{tool.type}</p>

            <div className="text-xs space-y-2 mb-6">
                {Object.entries(tool.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                        <span className="text-hud-text-secondary">{key}:</span>
                        <span className="text-hud-text-primary font-mono">{value}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mt-auto border-t border-hud-border pt-4">
                <Button variant="secondary" className="w-full text-xs">
                    Download .STEP
                </Button>
                <Button variant="secondary" className="w-full text-xs">
                    Download .JSON
                </Button>
            </div>
        </Card>
    );
};

export default ToolCard;

