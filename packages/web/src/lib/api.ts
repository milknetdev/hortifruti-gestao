import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hortifruti-gestao.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      try {
        // Try admin token first, then customer token
        const adminData = localStorage.getItem('hortifruti-admin');
        const authData = localStorage.getItem('hortifruti-auth');

        let token = null;

        if (adminData) {
          const parsed = JSON.parse(adminData);
          token = parsed?.state?.accessToken;
        }

        if (!token && authData) {
          const parsed = JSON.parse(authData);
          token = parsed?.state?.accessToken;
        }

        if (token && config.headers) {
          config.headers.Authorization = 'Bearer ' + token;
        }
      } catch {
        // Ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 silently
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Just reject the error - let the calling code handle it
    return Promise.reject(error);
  },
);
