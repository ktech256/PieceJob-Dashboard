import api from './axios';

export const fetchCountries = async () => {
  const res = await api.get('/api/admin/countries');
  return res.data.countries;
};
