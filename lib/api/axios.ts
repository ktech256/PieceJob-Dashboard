import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL,
});

// For debugging in console
if (typeof window !== 'undefined') {
    (window as any)._PIECEJOB_API_BASE = baseURL;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Inject countryCode from persisted store
  const stored = localStorage.getItem('piecejob-workspace');
  if (stored) {
      try {
          const parsed = JSON.parse(stored);
          const countryCode = parsed.state?.countryCode;
          if (countryCode) {
              config.headers['x-country-code'] = countryCode;
          }
      } catch (e) {
          console.error('Failed to parse workspace storage');
      }
  }

  return config;
});

export default api;
