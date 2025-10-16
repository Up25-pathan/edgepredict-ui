import React from 'react';
// Corrected the import path from ../../ to ../
import { useSimulationData } from '../context/SimulationDataContext'; 
import Card from '../components/common/Card';

const ReportsPage = () => {
    // Get the reports and loading status from the global context
    const { reports, isLoading } = useSimulationData();

    return (
        <div>
            <h2 className="text-2xl font-bold text-hud-text-primary mb-6">Simulation Reports</h2>
            <Card>
                {isLoading ? (
                    <p className="text-hud-text-secondary text-center p-8">Loading reports...</p>
                ) : reports.length > 0 ? (
                    <table className="min-w-full">
                        <thead className="border-b border-hud-border">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                                    Report Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                                    Date Generated
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-hud-text-secondary uppercase tracking-wider">
                                    Format
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Download</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hud-border">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-hud-border transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-hud-text-primary">{report.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">{report.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-hud-text-secondary">{report.format}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" className="text-hud-primary hover:text-hud-primary-hover">Download</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center p-8">
                        <h3 className="text-lg font-medium text-hud-text-primary">No Reports Found</h3>
                        <p className="mt-1 text-sm text-hud-text-secondary">
                            Complete a simulation to generate a new report.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ReportsPage;

