import React, { useState, useEffect } from 'react'; // Import useEffect
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

// Add initialEmail prop
const CreateUserModal = ({ isOpen, onClose, onUserCreated, initialEmail = '' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [subscriptionDays, setSubscriptionDays] = useState(30);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- NEW: Auto-fill email if provided ---
    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
        } else {
            setEmail(''); // Reset if no initial email
        }
    }, [initialEmail, isOpen]); // Re-run when modal opens
    // ----------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await api.adminCreateUser({
                email,
                password,
                subscription_days: parseInt(subscriptionDays),
                is_admin: isAdmin
            });
            setSuccess('User created successfully!');
            setTimeout(() => {
                onUserCreated(); // Refresh the list
                onClose();       // Close modal
                // Reset form
                setEmail('');
                setPassword('');
                setSuccess('');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create user.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Provision New Account">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* ... (The rest of your JSX remains exactly the same) ... */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded text-emerald-400 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" /> {success}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Temporary Password</label>
                    <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="Set a temp password..."
                    />
                    <p className="text-xs text-gray-500 mt-1">You must share this password with the user manually.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Subscription Duration (Days)</label>
                    <select
                        value={subscriptionDays}
                        onChange={(e) => setSubscriptionDays(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="7">7 Days (Trial)</option>
                        <option value="30">30 Days (Standard)</option>
                        <option value="90">3 Months</option>
                        <option value="365">1 Year</option>
                        <option value="3650">Unlimited (Admin)</option>
                    </select>
                </div>

                <div className="flex items-center mt-4">
                    <input
                        type="checkbox"
                        id="isAdmin"
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isAdmin" className="ml-2 text-sm text-gray-300">
                        Grant Admin Privileges
                    </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create & Approve
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateUserModal;