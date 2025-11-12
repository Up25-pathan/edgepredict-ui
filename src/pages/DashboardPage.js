import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Correctly imports our api service
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { PlusIcon } from '../assets/icons';

const DashboardPage = () => {
  const [recentSimulations, setRecentSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSimulations = async () => {
      try {
        // FIX: Changed getReports() to getSimulations()
        const response = await api.getSimulations();
        // Sort by ID descending to get the most recent ones and take the top 3
        const sorted = response.data.sort((a, b) => b.id - a.id).slice(0, 3);
        setRecentSimulations(sorted);
      } catch (error) {
        console.error("Failed to fetch recent simulations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSimulations();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
      <p className="text-gray-400 mb-8">Welcome back! Here's a summary of your recent activity.</p>

      <div className="mb-8">
        <Card>
          <div className="p-5 flex items-center justify-between">
            <div>
              <h5 className="text-xl font-bold text-white">Start a New Simulation</h5>
              <p className="text-gray-400">Ready to run a new analysis? Click here to set up your parameters.</p>
            </div>
            <Link to="/simulation-setup">
              <Button>
                <PlusIcon className="h-5 w-5 mr-2" />
                New Simulation
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">Recent Simulations</h2>
        {loading ? (
          <p className="text-gray-400">Loading recent simulations...</p>
        ) : recentSimulations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSimulations.map(sim => (
              <Card key={sim.id}>
                <div className="p-5">
                  <h5 className="text-xl font-bold text-white mb-2">{sim.name}</h5>
                  <p className="text-gray-400 mb-4">{sim.description}</p>
                   <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        sim.status === 'COMPLETED' ? 'bg-green-600 text-white' :
                        sim.status === 'FAILED' ? 'bg-red-600 text-white' :
                        'bg-yellow-500 text-black'
                    }`}>
                        {sim.status}
                    </span>
                    <Link to={`/simulation/${sim.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No recent simulations to display.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;