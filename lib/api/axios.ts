import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Strip /api/v1 from baseURL to allow absolute paths from root to work consistently
const domainOrigin = baseURL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: domainOrigin,
});

// For debugging in console
if (typeof window !== 'undefined') {
    (window as any)._PIECEJOB_API_BASE = baseURL;
}

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

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
          // Ensure we don't send undefined/null strings
          if (countryCode && countryCode !== 'undefined' && countryCode !== 'null') {
              config.headers['x-country-code'] = countryCode;
          }
      } catch (e) {
          // Silent catch
      }
  }

  return config;
});

export default api;
