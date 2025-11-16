import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { PlusIcon } from '../assets/icons';
import { Trash2 } from 'lucide-react'; // New Icon

const DashboardPage = () => {
  const [recentSimulations, setRecentSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentSimulations = async () => {
    setLoading(true);
    try {
      const response = await api.getSimulations();
      // Sort by ID descending (newest first)
      const sorted = response.data.sort((a, b) => b.id - a.id);
      setRecentSimulations(sorted);
    } catch (error) {
      console.error("Failed to fetch simulations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSimulations();
  }, []);

  // --- NEW: Delete Handler ---
  const handleDelete = async (e, id, name) => {
    e.preventDefault(); // Prevent clicking the card link
    if (window.confirm(`Are you sure you want to delete simulation "${name}"? This cannot be undone.`)) {
        try {
            await api.deleteSimulation(id);
            // Optimistic update: Remove from list immediately
            setRecentSimulations(prev => prev.filter(sim => sim.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete simulation.");
        }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
              <Card key={sim.id} className="group relative hover:border-indigo-500 transition-all">
                {/* DELETE BUTTON (Top Right) */}
                <button
                    onClick={(e) => handleDelete(e, sim.id, sim.name)}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Delete Simulation"
                >
                    <Trash2 className="w-5 h-5" />
                </button>

                <div className="p-5">
                  <h5 className="text-xl font-bold text-white mb-2 pr-8">{sim.name}</h5>
                  <p className="text-gray-400 mb-4 text-sm line-clamp-2">{sim.description}</p>
                   <div className="flex justify-between items-center mt-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                        sim.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        sim.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                    }`}>
                        {sim.status}
                    </span>
                    <Link to={`/simulation/${sim.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center">
                      View Results <span className="ml-1">→</span>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
            <p className="text-gray-500">No simulations found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;