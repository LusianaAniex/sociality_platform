import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://social-media-be-400174736012.asia-southeast2.run.app/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    // Don't attach token to auth endpoints (login/register)
    const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
