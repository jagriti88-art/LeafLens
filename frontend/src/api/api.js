import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Middleware to attach JWT token to every request
API.interceptors.request.use((req) => {
    // We changed the app name to LeafLens, but let's stick to your 
    // localStorage key for now to avoid breaking existing logins.
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