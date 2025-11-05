import axios from 'axios';

const apiClient = axios.create({
  // --- FIX: Remove the /api prefix ---
  baseURL: 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Service Definitions ---

const api = {
  // --- Auth ---
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    // Login uses a different content type
    return apiClient.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  getCurrentUser: () => {
    return apiClient.get('/users/me/');
  },
  
  // Note: You will need a /users/ endpoint on the backend for this
  // (which you have)
  register: (email, password) => {
    return apiClient.post('/users/', { email, password });
  },

  // --- Simulations ---
  createSimulation: (formData) => {
    // FormData requires a different content type
    return apiClient.post('/simulations/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getSimulations: () => {
    return apiClient.get('/simulations/');
  },

  getSimulationById: (id) => {
    return apiClient.get(`/simulations/${id}`);
  },

  // --- Materials ---
  getMaterials: () => {
    return apiClient.get('/materials/');
  },
  
  createMaterial: (materialData) => {
    return apiClient.post('/materials/', materialData);
  },

  // --- Tools ---
  getTools: () => {
    return apiClient.get('/tools/');
  },

  createTool: (formData) => {
    // FormData for file upload
    return apiClient.post('/tools/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getToolFileById: (toolId) => {
    return apiClient.get(`/tool-file/${toolId}`, {
      responseType: 'blob', // Important for file downloads
    });
  },
  
  // Add this if you want to delete tools
  deleteTool: (toolId) => {
    return apiClient.delete(`/tools/${toolId}`);
  },

};

export default api;