import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Country {
  code: string;
  name: string;
  currency: string;
  timezone: string;
  language: string;
  locale: string;
  flagEmoji: string;
}

interface CountryState {
  countryCode: string;
  currentCountry: Country | null;
  setCountry: (country: Country | string) => void;
}

export const useCountryStore = create<CountryState>()(
  persist(
    (set) => ({
      countryCode: 'ZA',
      currentCountry: null,
      setCountry: (country) => {
        if (typeof country === 'string') {
          set({ countryCode: country, currentCountry: null });
        } else {
          set({ countryCode: country.code, currentCountry: country });
        }
      },
    }),
    {
      name: 'piecejob-workspace',
    }
  )
);
