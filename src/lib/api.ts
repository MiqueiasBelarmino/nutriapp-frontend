import axios from 'axios';

// Configure axios with base URL (update this to your backend URL)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Change this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
