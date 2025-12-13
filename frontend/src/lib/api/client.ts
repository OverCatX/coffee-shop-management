import axios, { AxiosError } from 'axios';
import { tokenStorage } from './auth';
import toast from 'react-hot-toast';

// Get API URL from environment variable (must start with NEXT_PUBLIC_ for client-side access)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Log API URL in development for debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('[API Config] Backend URL:', API_BASE_URL);
  // Note: Token check is done in request interceptor to avoid circular dependency
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increase timeout to 30 seconds for slower connections
  withCredentials: false, // CORS handles credentials via headers
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Request] Token attached:', token.substring(0, 20) + '...');
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[API Request] No token found');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      const errorMessage = errorData?.detail || errorData?.message || 'An error occurred';

      // Handle 401 Unauthorized - clear token and redirect to login
      if (status === 401) {
        // Only redirect if not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          tokenStorage.remove();
          // Don't show toast if it's during initial load (to avoid spam)
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
          }
          // Use router.push instead of window.location.href for better UX
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // Don't show toast for 403 on login page (handled by ProtectedRoute)
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          toast.error('You do not have permission to perform this action.');
        }
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status === 422) {
        // Validation errors - show first error
        const validationError = Array.isArray(errorData?.detail) 
          ? errorData.detail[0]?.msg || errorData.detail[0] || errorMessage
          : errorMessage;
        toast.error(validationError);
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        // Other client errors (400, etc.)
        toast.error(errorMessage);
      }

      console.error('[API Error]', error.response.data);
    } else if (error.request) {
      // Network error - check if backend is reachable
      const backendUrl = API_BASE_URL;
      const requestUrl = error.config?.baseURL && error.config?.url 
        ? error.config.baseURL + error.config.url 
        : 'Unknown URL';
      const errorMessage = `Unable to connect to server at ${backendUrl}. Please ensure the backend is running.`;
      
      // Only show toast if not on login page (to avoid spam)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        toast.error(errorMessage, {
          duration: 6000, // Show longer for connection errors
        });
      }
      
      console.error('[API Error]', 'No response received');
      console.error('[API Error]', 'Backend URL:', backendUrl);
      console.error('[API Error]', 'Full Request URL:', requestUrl);
      console.error('[API Error]', 'Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
      });
      
      // Additional debugging info
      if (error.code === 'ECONNREFUSED') {
        console.error('[API Error]', 'Connection refused - backend may not be running');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('[API Error]', 'Request timeout - backend may be slow or unreachable');
      } else if (error.code) {
        console.error('[API Error]', 'Error code:', error.code);
      }
    } else {
      // Request setup error
      toast.error('Request failed. Please try again.');
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

