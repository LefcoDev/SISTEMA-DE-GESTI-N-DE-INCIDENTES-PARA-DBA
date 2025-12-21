import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if 401 comes from a protected route, not from login itself
    // Also exclude /auth/me because AuthContext handles that initialization error gracefully
    if (
      error.response && 
      error.response.status === 401 && 
      !error.config.url.includes('/auth/login') && 
      !error.config.url.includes('/auth/me')
    ) {
      localStorage.removeItem('token');
      if (window.location.hash !== '#/login') {
        // If the app uses HashRouter (recommended for Electron), update the hash
        // to navigate without causing the renderer to try loading file:/// paths.
        try {
          window.location.hash = '#/login';
        } catch (e) {
          // Fallback to href if hash is not available for some reason
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
