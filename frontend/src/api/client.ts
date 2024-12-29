// src/api/client.ts
import axios from 'axios';
import { API_BASE_URL, API_CONFIG } from './config';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    ...API_CONFIG
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    response => response,
    error => {
        // Handle common errors here
        if (error.response?.status === 404) {
            console.error('Resource not found:', error.config.url);
        }
        return Promise.reject(error);
    }
);