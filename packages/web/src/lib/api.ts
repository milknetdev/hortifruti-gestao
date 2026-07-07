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
        const url = config.url || '';
        
        // For customer-specific endpoints, prioritize customer token
        const isCustomerEndpoint = url.includes('/favorites') || 
          url.includes('/customer/') || 
          url.includes('/addresses') ||
          url.includes('/orders/my') ||
          (url.includes('/orders') && !url.includes('/orders/my') && config.method === 'post');
        
        let token = null;
        
        if (isCustomerEndpoint) {
          // Try customer token first for customer endpoints
          const authData = localStorage.getItem('hortifruti-auth');
          if (authData) {
            const parsed = JSON.parse(authData);
            token = parsed?.state?.accessToken;
          }
          // Fallback to admin token if no customer token
          if (!token) {
            const adminData = localStorage.getItem('hortifruti-admin');
            if (adminData) {
              const parsed = JSON.parse(adminData);
              token = parsed?.state?.accessToken;
            }
          }
        } else {
          // For admin endpoints, try admin token first
          const adminData = localStorage.getItem('hortifruti-admin');
          if (adminData) {
            const parsed = JSON.parse(adminData);
            token = parsed?.state?.accessToken;
          }
          // Fallback to customer token
          if (!token) {
            const authData = localStorage.getItem('hortifruti-auth');
            if (authData) {
              const parsed = JSON.parse(authData);
              token = parsed?.state?.accessToken;
            }
          }
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
