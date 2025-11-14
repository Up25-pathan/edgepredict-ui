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

  // --- Access Requests (Public & Admin) ---
  submitAccessRequest: (requestData) => {
    return apiClient.post('/request-access', requestData);
  },
  adminGetAccessRequests: () => {
    return apiClient.get('/admin/access-requests');
  },
  adminUpdateAccessRequestStatus: (requestId, status) => {
    return apiClient.patch(`/admin/access-requests/${requestId}?status=${status}`);
  },

  // --- Admin Functions ---
  adminGetUsers: () => {
    return apiClient.get('/admin/users/');
  },
  adminCreateUser: (userData) => {
    return apiClient.post('/admin/users/', userData);
  },
  adminUpdateUser: (userId, updateData) => {
    return apiClient.patch(`/admin/users/${userId}`, updateData);
  },
  adminResetUserPassword: (userId, newPassword) => {
    return apiClient.post(`/admin/users/${userId}/reset-password`, { new_password: newPassword });
  },
  adminDeleteUser: (userId) => {
    return apiClient.delete(`/admin/users/${userId}`);
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
    // --- NEW: Delete Simulation ---
    deleteSimulation: (id) => {
        return apiClient.delete(`/simulations/${id}`);
    },
    // ------------------------------
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
  // NEW: Delete Material
  deleteMaterial: (materialId) => {
    return apiClient.delete(`/materials/${materialId}`);
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
  // NEW: Delete Tool
  deleteTool: (toolId) => {
    return apiClient.delete(`/tools/${toolId}`);
  },
};

export default api;