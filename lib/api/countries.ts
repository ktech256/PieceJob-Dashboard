import api from './axios';

export const fetchCountries = async () => {
  const res = await api.get('admin/countries');
  return res.data.countries;
};
