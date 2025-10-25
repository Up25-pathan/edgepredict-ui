import axios from 'axios';

// The base URL of our FastAPI backend
const API_URL = 'http://127.0.0.1:8000';

// Create a configured instance of axios to communicate with the backend
const apiClient = axios.create({
  baseURL: API_URL,
});

// --- NEW: Axios Request Interceptor ---
// This function will run before every request is sent
apiClient.interceptors.request.use(
  (config) => {
    // Try to get the token from localStorage (or sessionStorage)
    const token = localStorage.getItem('accessToken'); // We'll save the token here after login

    if (token) {
      // If the token exists, add the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // Continue with the modified request config
  },
  (error) => {
    // Handle request configuration errors
    return Promise.reject(error);
  }
);
// --- END Interceptor ---

/**
 * A collection of functions to interact with the backend API.
 */
const api = {
  // --- NEW: Authentication Functions ---
  /**
   * Logs in a user.
   * @param {string} email The user's email.
   * @param {string} password The user's password.
   * @returns {Promise<Object>} A promise resolving to the login response (containing the token).
   */
  login: (email, password) => {
    // FastAPI's OAuth2PasswordRequestForm expects form data
    const formData = new FormData();
    formData.append('username', email); // IMPORTANT: it expects 'username', not 'email'
    formData.append('password', password);

    return apiClient.post('/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  /**
  * Fetches the details of the currently logged-in user.
  * Requires a valid token to be sent via the interceptor.
  * @returns {Promise<Object>} A promise resolving to the user data.
  */
  getCurrentUser: () => {
    return apiClient.get('/users/me/');
  },
  // --- END Authentication Functions ---

  // --- Simulation Functions ---
  getSimulations: () => {
    return apiClient.get('/simulations/');
  },
  getSimulationById: (simulationId) => {
    return apiClient.get(`/simulations/${simulationId}`);
  },
  createSimulation: (formData) => {
    return apiClient.post('/simulations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // --- Material Library Functions ---
  getMaterials: () => {
    return apiClient.get('/materials/');
  },
  createMaterial: (materialData) => {
    return apiClient.post('/materials/', materialData);
  },
  deleteMaterial: (materialId) => {
    // NOTE: You might need to add delete endpoints in your backend
    return apiClient.delete(`/materials/${materialId}`);
  },

  // --- Tool Library Functions ---
  getTools: () => {
    return apiClient.get('/tools/');
  },
  createTool: (formData) => {
    return apiClient.post('/tools/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteTool: (toolId) => {
    // NOTE: You might need to add delete endpoints in your backend
    return apiClient.delete(`/tools/${toolId}`);
  },
  getToolFileById: (toolId) => {
    return apiClient.get(`/tool-file/${toolId}`, {
      responseType: 'blob',
    });
  },
};

export default api;