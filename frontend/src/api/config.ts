// config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_CONFIG = {
    headers: {
        'Content-Type': 'application/json',
    },
};