import axios from 'axios';

// 1. Use environment variable for production, fallback to localhost for dev
const API = axios.create({ 
    baseURL: import.meta.env.VITE_BACKEND_URL || 'https://leaflens-2qjk.onrender.com/api' 
});

// Middleware to attach JWT token to every request
API.interceptors.request.use((req) => {
    // Keep your existing localStorage key logic
    const user = JSON.parse(localStorage.getItem('plantz_user'));
    if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

// Auth Routes
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// Diagnosis Routes
export const diagnosePlant = (formData) => API.post('/diagnose', formData, {
    headers: { 
        'Content-Type': 'multipart/form-data' 
    }
});

// User Stats
export const fetchDashboard = () => API.get('/dashboard/summary');

export default API;