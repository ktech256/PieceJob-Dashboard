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

/**
 * Global provider for Google Maps.
 * It handles fetching the configuration first, then initializes the Maps script
 * ONLY when a valid API key is available. This prevents the "Loader called multiple times" error.
 */
export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  const { config, loading: configLoading } = useGoogleMapsConfig();

  // 1. While loading config OR if no key is found, provide a "not loaded" state
  // and DO NOT render the script loader component.
  if (configLoading || !config?.mapsJavascriptApiKey) {
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: undefined }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  // 2. Once the API key is ready, render the internal loader.
  // This ensures useJsApiLoader is called exactly once with the final key.
  return (
    <GoogleMapsScriptLoader apiKey={config.mapsJavascriptApiKey}>
      {children}
    </GoogleMapsScriptLoader>
  );
};

/**
 * Internal component that actually calls useJsApiLoader.
 * Separated to ensure the hook is only called when we have a stable API key.
 */
const GoogleMapsScriptLoader = ({ apiKey, children }: { apiKey: string, children: ReactNode }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-global',
    googleMapsApiKey: apiKey,
    libraries: libraries
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
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
