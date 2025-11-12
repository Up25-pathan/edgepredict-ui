import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost for dev
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const api = {
  // --- Auth ---
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return apiClient.post('/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  getCurrentUser: () => {
    return apiClient.get('/users/me/');
  },
  register: (email, password) => {
    return apiClient.post('/users/', { email, password });
  },

  // --- Simulations ---
  createSimulation: (formData) => {
    return apiClient.post('/simulations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getSimulations: () => {
    return apiClient.get('/simulations/');
  },
  getSimulationById: (id) => {
    return apiClient.get(`/simulations/${id}`);
  },
  // AI Report Generation
  generateReport: (simulationId) => {
    return apiClient.post(`/simulations/${simulationId}/analyze`);
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
    return apiClient.post('/tools/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getToolFileById: (toolId) => {
    return apiClient.get(`/tool-file/${toolId}`, {
      responseType: 'blob',
    });
  },
  deleteTool: (toolId) => {
    return apiClient.delete(`/tools/${toolId}`);
  },
};

export default api;