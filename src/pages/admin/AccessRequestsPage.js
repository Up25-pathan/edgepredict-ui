import React, { useEffect, useState } from 'react';
import { Check, X, Clock, Mail, Building, User } from 'lucide-react';
import api from '../../services/api';
import CreateUserModal from '../../components/admin/CreateUserModal'; // Import the modal

const AccessRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- NEW STATE FOR MODAL ---
    const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await api.adminGetAccessRequests();
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // 1. Triggered when you click the GREEN CHECK
    const initiateApproval = (request) => {
        setSelectedRequest(request);
        setIsProvisionModalOpen(true);
    };

    // 2. Triggered AFTER the user is successfully created in the modal
    const handleUserProvisioned = async () => {
        if (selectedRequest) {
            try {
                // Automatically mark the request as APPROVED
                await api.adminUpdateAccessRequestStatus(selectedRequest.id, 'APPROVED');
                fetchRequests(); // Refresh the list
            } catch (error) {
                console.error("User created, but failed to update request status", error);
            }
        }
        setIsProvisionModalOpen(false);
        setSelectedRequest(null);
    };

    // 3. Triggered when you click RED X (Reject)
    const handleReject = async (id) => {
        try {
            await api.adminUpdateAccessRequestStatus(id, 'REJECTED');
            fetchRequests();
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Access Requests</h1>
                <p className="text-gray-400">Review and approve new account requests.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-950 text-gray-400 text-xs uppercase font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Applicant</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading requests...</td>
                            </tr>
                        ) : requests.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No pending requests.</td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                            {req.name}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center mt-1">
                                            <Mail className="w-3 h-3 mr-1" />
                                            {req.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        <div className="flex items-center">
                                            <Building className="w-4 h-4 mr-2 text-gray-500" />
                                            {req.company}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {formatDate(req.request_date)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.status === 'PENDING' && (
                                            <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-xs font-bold">PENDING</span>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-bold">APPROVED</span>
                                        )}
                                        {req.status === 'REJECTED' && (
                                            <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-bold">REJECTED</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'PENDING' && (
                                            <div className="flex justify-end gap-2">
                                                {/* APPROVE BUTTON */}
                                                <button 
                                                    onClick={() => initiateApproval(req)}
                                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                                                    title="Approve & Provision"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                {/* REJECT BUTTON */}
                                                <button 
                                                    onClick={() => handleReject(req.id)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Provisioning Modal linked to Request */}
            <CreateUserModal 
                isOpen={isProvisionModalOpen} 
                onClose={() => setIsProvisionModalOpen(false)} 
                onUserCreated={handleUserProvisioned} // This triggers the status update
                initialEmail={selectedRequest?.email}  // Auto-fill email
            />
        </div>
    );
};

export default AccessRequestsPage;