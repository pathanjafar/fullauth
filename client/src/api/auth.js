import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API = axios.create({ baseURL: API_URL });

// Attach token to every request if present
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const register        = (data) => API.post('/auth/register', data);
export const login           = (data) => API.post('/auth/login', data);
export const sendOTP        = (data) => API.post('/auth/send-otp', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword  = (data) => API.post('/auth/reset-password', data);
export const getMe          = ()     => API.get('/auth/me');
