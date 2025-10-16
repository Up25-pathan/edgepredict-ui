// This service makes REAL API calls to the Python backend for all features.

const API_BASE_URL = "http://localhost:8000";

// --- AUTHENTICATION ---
const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    if (!response.ok) throw new Error("Invalid credentials");

    const data = await response.json();
    const user = { name: "Demo User", email: email, initials: "DU" };
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
};

const logout = () => {
    return new Promise((resolve) => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        resolve();
    });
};

const checkAuth = () => {
    return new Promise((resolve) => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        if (token && user) {
            resolve({ isAuthenticated: true, user: JSON.parse(user) });
        } else {
            resolve({ isAuthenticated: false, user: null });
        }
    });
};


// --- REPORTS ---
const getReports = async () => {
    const response = await fetch(`${API_BASE_URL}/reports/`);
    if (!response.ok) {
        throw new Error("Failed to fetch reports");
    }
    return await response.json();
};

const addReport = async (newReportData) => {
    const response = await fetch(`${API_BASE_URL}/reports/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            simulation_id: newReportData.id,
            name: newReportData.name,
            date: newReportData.date,
            format: newReportData.format,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to save report");
    }
    return await response.json();
};

// --- LIBRARIES ---
const getMaterials = async () => {
    const response = await fetch(`${API_BASE_URL}/library/materials/`);
    if (!response.ok) throw new Error("Failed to fetch materials");
    return await response.json();
};

const addMaterial = async (materialData) => {
    const response = await fetch(`${API_BASE_URL}/library/materials/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData),
    });
    if (!response.ok) throw new Error("Failed to add material");
    return await response.json();
};

const getTools = async () => {
    const response = await fetch(`${API_BASE_URL}/library/tools/`);
    if (!response.ok) throw new Error("Failed to fetch tools");
    return await response.json();
};

const addTool = async (toolData) => {
    const response = await fetch(`${API_BASE_URL}/library/tools/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData),
    });
    if (!response.ok) throw new Error("Failed to add tool");
    return await response.json();
};

// --- SIMULATION ---
const runSimulation = async (simulationData) => {
    const response = await fetch(`${API_BASE_URL}/simulations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulationData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to start simulation");
    }
    return await response.json();
};


export const api = {
    login,
    logout,
    checkAuth,
    getReports,
    addReport,
    getMaterials,
    addMaterial,
    getTools,
    addTool,
    runSimulation,
};

