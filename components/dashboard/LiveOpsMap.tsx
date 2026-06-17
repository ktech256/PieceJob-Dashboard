"use client";

import React, { useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Badge } from "../ui/badge";
import { useGoogleMaps } from '@/components/shared/GoogleMapsProvider';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: -26.2041,
  lng: 28.0473
};

interface LiveOpsMapProps {
  providers: any[];
  activeJobs: any[];
}

export const LiveOpsMap: React.FC<LiveOpsMapProps> = ({ providers, activeJobs }) => {
  const { isLoaded } = useGoogleMaps();

  const [selected, setSelected] = React.useState<any>(null);

  const center = useMemo(() => {
    if (providers.length > 0 && providers[0].location?.coordinates) {
        return {
            lat: providers[0].location.coordinates[1],
            lng: providers[0].location.coordinates[0]
        };
    }
    return defaultCenter;
  }, [providers]);

  if (!isLoaded) return <div className="h-[500px] w-full bg-neutral-900 animate-pulse flex items-center justify-center text-white font-black uppercase">Initialising Geospatial Grid...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={11}
      options={{
          styles: [
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          ],
          disableDefaultUI: true
      }}
    >
      {providers.map((p) => (
        p.location?.coordinates && (
            <Marker
              key={p._id}
              position={{ lat: p.location.coordinates[1], lng: p.location.coordinates[0] }}
              onClick={() => setSelected({ type: 'PROVIDER', ...p })}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                fillColor: p.isOnline ? "#22c55e" : "#ef4444",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#ffffff",
                scale: 1.5,
                anchor: typeof google !== 'undefined' ? new google.maps.Point(12, 22) : undefined
              }}
            />
        )
      ))}

      {activeJobs.map((j) => (
        j.location?.coordinates && (
            <Marker
              key={j._id}
              position={{ lat: j.location.coordinates[1], lng: j.location.coordinates[0] }}
              onClick={() => setSelected({ type: 'JOB', ...j })}
              icon={{
                path: typeof google !== 'undefined' ? google.maps.SymbolPath.CIRCLE : 0,
                fillColor: "#3b82f6",
                fillOpacity: 0.6,
                strokeWeight: 2,
                strokeColor: "#ffffff",
                scale: 8
              }}
            />
        )
      ))}

      {selected && selected.location?.coordinates && (
        <InfoWindow
          position={{
              lat: selected.location.coordinates[1],
              lng: selected.location.coordinates[0]
          }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="p-2 space-y-2 max-w-[200px]">
            <p className="font-black uppercase text-xs tracking-tight">
                {selected.type === 'PROVIDER' ? 'Provider Info' : 'Active Job'}
            </p>
            <div className="h-px bg-neutral-100" />
            {selected.type === 'PROVIDER' ? (
                <>
                    <p className="text-sm font-bold">{selected.userId?.firstName} {selected.userId?.lastName}</p>
                    <p className="text-[10px] text-neutral-500">{selected._id}</p>
                    <Badge className={selected.isOnline ? 'bg-green-500' : 'bg-red-500'}>
                        {selected.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                </>
            ) : (
                <>
                    <p className="text-sm font-bold">Service: {selected.serviceCode}</p>
                    <p className="text-[10px] text-neutral-500">Status: {selected.status}</p>
                    <p className="text-[10px] font-black uppercase text-blue-600">{selected._id.slice(-6)}</p>
                </>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};
