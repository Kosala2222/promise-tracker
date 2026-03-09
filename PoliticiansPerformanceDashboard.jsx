import Constants from 'expo-constants';

// Read API_BASE_URL from Expo config (set in app.config.js), with a safe fallback
export const API_BASE_URL = (Constants?.expoConfig?.extra?.API_BASE_URL) || 'http://172.19.81.174:3000/api';
export const API_BASE_ROOT = API_BASE_URL.replace(/\/api\/?$/, '');
