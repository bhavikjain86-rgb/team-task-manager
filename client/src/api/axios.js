import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // For cross-origin cookies if ever needed
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 404) {
      window.location.href = '/projects';
      return Promise.reject(error);
    }

    if (status === 403) {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('Access Denied: You do not have permission for this action.');
      });
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, {
          refreshToken
        });

        if (res.status === 200) {
          localStorage.setItem('accessToken', res.data.accessToken);
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token is expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
