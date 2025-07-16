// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ✅ Points to your backend server
  withCredentials: true, // Optional, only if using cookies/sessions
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Get token from local storage
        if (token) {
            
            config.headers['Authorization'] = `Bearer ${token}`; // If your backend uses Bearer token
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;