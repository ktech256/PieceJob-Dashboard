import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

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
