import React, { useEffect, useState } from 'react';
import { Plus, Search, Shield, Clock, RefreshCw, Edit2, Key, Trash2 } from 'lucide-react';
import api from '../../services/api';
import CreateUserModal from '../../components/admin/CreateUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import ResetPasswordModal from '../../components/admin/ResetPasswordModal';
import DeleteUserModal from '../../components/admin/DeleteUserModal';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.adminGetUsers();
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = (user, action) => {
        setSelectedUser(user);
        if (action === 'edit') setIsEditModalOpen(true);
        if (action === 'reset') setIsResetModalOpen(true);
        if (action === 'delete') setIsDeleteModalOpen(true);
    };

    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    const isExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-gray-400">Manage access, subscriptions, and user roles.</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
                    <Plus className="w-5 h-5 mr-2" /> Provision User
                </button>
            </div>

            <div className="flex justify-between items-center mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
                </div>
                <button onClick={fetchUsers} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-950 text-gray-400 text-xs uppercase font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">User / Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Subscription Expiry</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {isLoading ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{user.email}</div>
                                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_admin ? 
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"><Shield className="w-3 h-3 mr-1" /> Admin</span> : 
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">User</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> {formatDate(user.subscription_expiry)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isExpired(user.subscription_expiry) && !user.is_admin ? 
                                            <span className="text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">EXPIRED</span> : 
                                            <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">ACTIVE</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleAction(user, 'edit')} className="p-2 bg-gray-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-gray-400 rounded-lg transition-colors" title="Edit User"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleAction(user, 'reset')} className="p-2 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg transition-colors" title="Reset Password"><Key className="w-4 h-4" /></button>
                                            <button onClick={() => handleAction(user, 'delete')} className="p-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors" title="Delete User"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onUserCreated={fetchUsers} />
            <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUserUpdated={fetchUsers} user={selectedUser} />
            <ResetPasswordModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onPasswordReset={() => {}} user={selectedUser} />
            <DeleteUserModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onUserDeleted={fetchUsers} user={selectedUser} />
        </div>
    );
};

export default UserManagementPage;