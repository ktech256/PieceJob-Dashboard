"use client";

import React, { useMemo, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Badge } from "../ui/badge";
import { useGoogleMaps } from '@/components/shared/GoogleMapsProvider';
import { Users, User, Maximize2, Minimize2, Filter, Info } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -26.2041,
  lng: 28.0473
};

interface LiveOpsMapProps {
  providers: any[];
  activeJobs: any[];
}

type ProviderFilter = 'ALL' | 'ONLINE' | 'OFFLINE';
type CustomerFilter = 'ALL' | 'ACTIVE_JOB';

export const LiveOpsMap: React.FC<LiveOpsMapProps> = ({ providers, activeJobs }) => {
  const { isLoaded } = useGoogleMaps();
  const [selected, setSelected] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('ALL');
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('ALL');

  const { filteredProviders, filteredJobs } = useMemo(() => {
    let p = providers;
    if (providerFilter === 'ONLINE') p = providers.filter(x => x.isOnline);
    if (providerFilter === 'OFFLINE') p = providers.filter(x => !x.isOnline);

    let j = activeJobs;
    // For Dashboard, Customers are represented by Active Jobs
    if (customerFilter === 'ACTIVE_JOB') j = activeJobs;

    return { filteredProviders: p, filteredJobs: j };
  }, [providers, activeJobs, providerFilter, customerFilter]);

  const center = useMemo(() => {
    if (filteredProviders.length > 0 && filteredProviders[0].location?.coordinates) {
        return {
            lat: filteredProviders[0].location.coordinates[1],
            lng: filteredProviders[0].location.coordinates[0]
        };
    }
    return defaultCenter;
  }, [filteredProviders]);

  // Marker Style Helper
  const getMarkerIcon = (type: 'PROVIDER' | 'CUSTOMER', data: any) => {
      if (typeof google === 'undefined') return undefined;

      let color = "#777777"; // Default Gray
      let glow = false;

      if (type === 'PROVIDER') {
          if (data.isOnline) {
              color = "#22c55e"; // Green
              // Check if provider has an ongoing job (based on activeJobs list)
              const hasJob = activeJobs.some(job => job.providerId?._id === data._id || job.providerId === data._id);
              if (hasJob) glow = true;
          } else {
              color = "#ef4444"; // Red (Offline)
          }
      } else {
          // CUSTOMER (Represented by job markers)
          color = "#eab308"; // Yellow (Active Customer)
          // Always glow for Active Job/Customer on this map
          glow = true;
      }

      return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: glow ? 4 : 2,
          strokeColor: glow ? "#ffffff" : "#ffffff",
          scale: glow ? 10 : 7,
          // Simulated glowing effect via strokeWeight + anchor tweak if needed
      };
  };

  if (!isLoaded) return <div className="h-[500px] w-full bg-neutral-900 animate-pulse flex items-center justify-center text-white font-black uppercase">Initialising Geospatial Grid...</div>;

  return (
    <div className={`relative transition-all duration-500 ease-in-out ${isFullscreen ? 'fixed inset-0 z-[100] bg-white' : 'h-[500px] w-full'}`}>

      {/* MAP CONTROLS OVERLAY */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-3 bg-white/90 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-2xl hover:bg-white transition-all text-neutral-900"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        <div className="bg-white/90 backdrop-blur-xl border border-neutral-200 p-4 rounded-3xl shadow-2xl space-y-4 min-w-[220px]">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Map Legend</span>
                </div>
            </div>

            {/* LEGEND CONTENT */}
            <div className="space-y-2 pb-2 border-b border-neutral-100">
                <LegendItem color="#22c55e" label="Provider Online" />
                <LegendItem color="#22c55e" label="Provider w/ Job" glow />
                <LegendItem color="#ef4444" label="Provider Offline" />
                <LegendItem color="#eab308" label="Customer w/ Job" glow />
            </div>

            <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-neutral-500 flex items-center gap-2">
                    <Users size={12} /> Providers
                </label>
                <div className="grid grid-cols-1 gap-1">
                    {(['ALL', 'ONLINE', 'OFFLINE'] as ProviderFilter[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setProviderFilter(f)}
                            className={`text-left px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${providerFilter === f ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}
                        >
                            {f === 'ALL' ? 'Show All' : f === 'ONLINE' ? 'Online Only' : 'Offline Only'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

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
            disableDefaultUI: true,
            zoomControl: true,
        }}
      >
        {/* Providers */}
        {filteredProviders.map((p) => (
          p.location?.coordinates && (
              <Marker
                key={p._id}
                position={{ lat: p.location.coordinates[1], lng: p.location.coordinates[0] }}
                onClick={() => setSelected({ type: 'PROVIDER', ...p })}
                icon={getMarkerIcon('PROVIDER', p)}
              />
          )
        ))}

        {/* Active Jobs (Customers) */}
        {filteredJobs.map((j) => (
          j.location?.coordinates && (
              <Marker
                key={j._id}
                position={{ lat: j.location.coordinates[1], lng: j.location.coordinates[0] }}
                onClick={() => setSelected({ type: 'JOB', ...j })}
                icon={getMarkerIcon('CUSTOMER', j)}
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
                  {selected.type === 'PROVIDER' ? 'Provider Info' : 'Active Engagement'}
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
    </div>
  );
};

function LegendItem({ color, label, glow }: { color: string, label: string, glow?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${glow ? 'animate-pulse ring-4 ring-white/30' : ''}`}
                style={{ backgroundColor: color }}
            ></div>
            <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-tight">{label}</span>
        </div>
    );
}
