import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    // Get login function and authError state from the context
    const { login, authError } = useAuth(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Call the login function from AuthContext
        const success = await login(email, password); 
        
        setIsLoading(false);
        
        if (success) {
            navigate('/'); // Redirect to dashboard on successful login
        } 
        // If login fails, the authError state in AuthContext will be set,
        // and the error message will be displayed below.
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white">EdgePredict Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="********"
                        />
                    </div>
                    
                    {/* Display authentication errors from AuthContext */}
                    {authError && (
                        <p className="text-sm text-center text-red-500">{authError}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
                {/* Optional: Add a link to a registration page if you have one */}
                {/* <p className="text-sm text-center text-gray-400">
                    Don't have an account? <Link to="/register" className="text-indigo-400 hover:underline">Sign up</Link>
                </p> */}
            </div>
        </div>
    );
};

export default LoginPage;