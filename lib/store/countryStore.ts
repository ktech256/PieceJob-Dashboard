import { create } from 'zustand';

interface CountryState {
  countryCode: string;
  setCountryCode: (code: string) => void;
}

export const useCountryStore = create<CountryState>((set) => ({
  countryCode: 'ZA',
  setCountryCode: (code) => set({ countryCode: code }),
}));
