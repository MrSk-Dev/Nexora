import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every outgoing request automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If the token is invalid/expired, auto-logout and redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
            if (error.response && error.response.status === 401) {
            console.log('401 INTERCEPTOR FIRED, url was:', error.config?.url);
            sessionStorage.removeItem('token');
            if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
              window.location.href = '/';
            }
          }
    return Promise.reject(error);
  }
);

export default axiosInstance;