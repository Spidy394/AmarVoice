import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },  (error) => {
    console.error('API Error:', error.message);
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth state and redirect to login
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          localStorage.removeItem('auth-storage');
        }
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }
    }
    
    if (error.response?.status === 403) {
      // Handle forbidden
      console.error('Access forbidden');
    }
    
    if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;