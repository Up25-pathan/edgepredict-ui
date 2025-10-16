import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const LoginPage = () => {
    // Get the login function directly from our AuthContext
    const { login } = useAuth();
    
    // Use local state to manage form inputs and submission status
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        try {
            // Call the login function from the context
            await login(email, password);
            // Navigation will happen automatically in App.js because the isAuthenticated state will change
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                 <div className="flex items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-brand-primary rounded-md mr-4 flex items-center justify-center font-bold text-4xl text-white">
                        E
                    </div>
                    <h1 className="text-4xl font-bold text-brand-text">EdgePredict</h1>
                </div>

                <div className="bg-brand-surface p-8 rounded-lg shadow-2xl">
                    <h2 className="text-2xl font-bold text-center text-brand-text mb-2">Secure Industrial Login</h2>
                    <p className="text-center text-brand-text-secondary mb-8">Access your simulation workspace.</p>
                    
                    <form onSubmit={handleSubmit}>
                        {error && <p className="bg-red-900/50 text-red-300 text-sm p-3 rounded-md mb-4">{error}</p>}
                        <div className="mb-4">
                            <label className="block text-brand-text-secondary text-sm font-bold mb-2" htmlFor="company-email">
                                Company Email
                            </label>
                            <input 
                                className="shadow appearance-none border border-brand-secondary rounded w-full py-3 px-4 bg-brand-dark text-brand-text leading-tight focus:outline-none focus:shadow-outline focus:border-brand-primary" 
                                id="company-email" 
                                type="email" 
                                placeholder="name@company.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-brand-text-secondary text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input 
                                className="shadow appearance-none border border-brand-secondary rounded w-full py-3 px-4 bg-brand-dark text-brand-text mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-primary" 
                                id="password" 
                                type="password" 
                                placeholder="******************" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button type="submit" variant="primary" className="w-full" disabled={isLoggingIn}>
                                {isLoggingIn ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </div>
                    </form>
                </div>
                 <p className="text-center text-brand-text-secondary text-xs mt-6">
                    &copy;2025 EdgePredict Industries. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

