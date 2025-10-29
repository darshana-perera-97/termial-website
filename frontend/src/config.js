// Backend API Configuration
// Detect if we're in development or production (served from backend)
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Use relative paths in production (when served from same server)
// Use localhost in development (when React dev server is running)
const API_CONFIG = {
  BASE_URL: isDevelopment ? 'http://69.197.187.24:2121' : '',
  // BASE_URL: isDevelopment ? 'http://localhost:2121' : '',
  ENDPOINTS: {
    LOGIN: '/api/login',
    CHAT: '/api/chat'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  if (API_CONFIG.BASE_URL) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }
  // If BASE_URL is empty (production), return just the endpoint (relative path)
  return endpoint;
};

// Export individual endpoints for convenience
export const API_ENDPOINTS = {
  LOGIN: getApiUrl(API_CONFIG.ENDPOINTS.LOGIN),
  CHAT: getApiUrl(API_CONFIG.ENDPOINTS.CHAT)
};

export default API_CONFIG;

