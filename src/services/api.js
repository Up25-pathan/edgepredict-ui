import axios from 'axios';

// The base URL of our FastAPI backend
const API_URL = 'http://127.0.0.1:8000';

// Create a configured instance of axios to communicate with the backend
const apiClient = axios.create({
  baseURL: API_URL,
});

/**
 * A collection of functions to interact with the backend API.
 */
const api = {
  // --- Simulation Functions ---

  /**
   * Fetches a list of all simulations.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  getSimulations: () => {
    return apiClient.get('/simulations/');
  },

  /**
   * Fetches a single simulation by its ID.
   * @param {number} simulationId The ID of the simulation to fetch.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  getSimulationById: (simulationId) => {
    return apiClient.get(`/simulations/${simulationId}`);
  },

  /**
   * Creates a new simulation.
   * @param {FormData} formData The simulation data, including the tool file.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  createSimulation: (formData) => {
    return apiClient.post('/simulations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // --- Material Library Functions ---

  /**
   * Fetches all materials from the library.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  getMaterials: () => {
    return apiClient.get('/materials/');
  },

  /**
   * Creates a new material in the library.
   * @param {Object} materialData The material's name and properties in a JSON object.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  createMaterial: (materialData) => {
    return apiClient.post('/materials/', materialData);
  },

  /**
   * Deletes a material from the library by its ID.
   * @param {number} materialId The ID of the material to delete.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  deleteMaterial: (materialId) => {
    return apiClient.delete(`/materials/${materialId}`);
  },

  // --- Tool Library Functions ---

  /**
   * Fetches all tools from the library.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  getTools: () => {
    return apiClient.get('/tools/');
  },

  /**
   * Creates a new tool in the library by uploading a file.
   * @param {FormData} formData The tool's name and the .stl file.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  createTool: (formData) => {
    return apiClient.post('/tools/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Deletes a tool from the library by its ID.
   * @param {number} toolId The ID of the tool to delete.
   * @returns {Promise<Object>} A promise that resolves to the API response.
   */
  deleteTool: (toolId) => {
    return apiClient.delete(`/tools/${toolId}`);
  },
};

export default api;