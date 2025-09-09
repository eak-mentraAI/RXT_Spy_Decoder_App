// Configuration for API endpoints
const config = {
    // Check if running in Docker or local development
    API_BASE_URL: window.location.hostname === 'localhost' && window.location.port === '8888' 
        ? 'http://localhost:3002/api'  // Local development
        : window.location.port === '80' || !window.location.port
        ? `http://${window.location.hostname}:3002/api`  // Docker production
        : 'http://localhost:3002/api'  // Fallback
};

// Export for use in other modules
window.APP_CONFIG = config;