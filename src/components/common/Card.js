import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        // This solid background makes the card float visually on top of the grid
        <div className={`bg-hud-surface border border-hud-border rounded-lg shadow-2xl p-6 ${className}`}>
            {children}
        </div>
    );
};

export default Card;

