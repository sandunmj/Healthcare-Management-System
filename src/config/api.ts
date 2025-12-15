// API Configuration
const API_CONFIG = {
  development: {
    auth: 'http://localhost:8080/api',
    main: 'http://localhost:8081/api',
  },
  production: {
    auth: 'https://d313hjsfmeqfk9.cloudfront.net/userservice/api',
    main: 'https://d313hjsfmeqfk9.cloudfront.net/appointmentservice/api',
  },
};


const environment = 'production';
const config = API_CONFIG[environment as keyof typeof API_CONFIG] || API_CONFIG.development;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${config.auth}/auth/login`,
    SIGNUP: `${config.auth}/auth/signup`,
    VALIDATE_TOKEN: `${config.auth}/auth/validate`,
  },
  
  // Doctor endpoints
  DOCTOR: {
    ALL: `${config.auth}/doctor/all`,
    PROFILE: (id: string) => `${config.auth}/doctor/${id}`,
  },
  
  // Session endpoints
  SESSIONS: {
    AVAILABLE: (doctorId: string) => `${config.main}/sessions/available/${doctorId}`,
    CREATE: `${config.main}/sessions`,
    UPDATE: (id: string) => `${config.main}/sessions/${id}`,
  },
  
  // Appointment endpoints
  APPOINTMENTS: {
    CREATE: `${config.main}/appointments`,
    LIST: `${config.main}/appointments`,
    CANCEL: (id: string) => `${config.main}/appointments/${id}`,
  },
};

// Legacy exports for backward compatibility
export const API_BASE_URL = config.main;
export default API_BASE_URL;