import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('hortifruti-auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          const token = parsed?.state?.accessToken;
          if (token && config.headers) {
            config.headers.Authorization = 'Bearer ' + token;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = 'Bearer ' + token;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authData = localStorage.getItem('hortifruti-auth');
        if (!authData) throw new Error('No auth data');

        const parsed = JSON.parse(authData);
        const refreshToken = parsed?.state?.refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(API_URL + '/auth/refresh', { refreshToken });

        if (data?.data?.accessToken) {
          const newToken = data.data.accessToken;
          const newRefresh = data.data.refreshToken;

          // Update stored tokens
          const newState = { ...parsed, state: { ...parsed.state, accessToken: newToken, refreshToken: newRefresh || refreshToken } };
          localStorage.setItem('hortifruti-auth', JSON.stringify(newState));

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = 'Bearer ' + newToken;
          }

          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth and redirect to login
        localStorage.removeItem('hortifruti-auth');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export { api };
