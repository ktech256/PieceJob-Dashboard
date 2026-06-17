"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useGoogleMapsConfig } from '@/hooks/useGoogleMapsConfig';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

const libraries: ("places" | "drawing" | "visualization")[] = ["places", "visualization", "drawing"];

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  const { config, loading: configLoading } = useGoogleMapsConfig();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-global',
    googleMapsApiKey: config?.mapsJavascriptApiKey || "",
    libraries: libraries
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded: isLoaded && !configLoading, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};
