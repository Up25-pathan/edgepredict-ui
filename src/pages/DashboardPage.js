import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SimulationCard from '../components/simulation/SimulationCard';
import { PlusIcon } from '../assets/icons';
import Button from '../components/common/Button';

const DashboardPage = () => {
    // The dashboard now starts with an empty array of simulations
    const [simulations, setSimulations] = useState([]);

    return (
        <div>
            {simulations.length > 0 ? (
                <>
                    <h2 className="text-xl font-semibold text-brand-text mb-4">Recent Simulations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {simulations.map(sim => (
                            <SimulationCard key={sim.id} simulation={sim} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center bg-brand-surface p-12 rounded-lg border-2 border-dashed border-brand-secondary">
                    <div className="mx-auto h-12 w-12 text-brand-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V4m0 16v-2M12 12l-2-2-2-2 2-2 2-2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l2 2 2 2-2 2-2 2" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-xl font-medium text-brand-text">No simulations found</h3>
                    <p className="mt-1 text-sm text-brand-text-secondary">
                        Get started by creating your first tool performance simulation.
                    </p>
                    <div className="mt-6">
                        <Link to="/create">
                            <Button variant="primary">
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                New Simulation
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;

