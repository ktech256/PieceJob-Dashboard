"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Badge } from "../ui/badge";
import { useGoogleMaps } from '@/components/shared/GoogleMapsProvider';
import { Users, User, Maximize2, Minimize2, Filter, ChevronDown, ChevronUp } from 'lucide-react';

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

type ProviderFilter = 'ALL' | 'ONLINE' | 'OFFLINE' | 'ACTIVE';
type CustomerFilter = 'ALL' | 'ACTIVE';

export const LiveOpsMap: React.FC<LiveOpsMapProps> = ({ providers, activeJobs }) => {
  const { isLoaded } = useGoogleMaps();
  const [selected, setSelected] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Filters
  const [showProviders, setShowProviders] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('ALL');
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('ALL');

  const { filteredProviders, filteredJobs } = useMemo(() => {
    let p = showProviders ? providers : [];
    if (providerFilter === 'ONLINE') p = p.filter(x => x.isOnline);
    if (providerFilter === 'OFFLINE') p = p.filter(x => !x.isOnline);
    if (providerFilter === 'ACTIVE') {
        p = p.filter(x => activeJobs.some(job => job.providerId?._id === x.userId?._id || job.providerId === x.userId?._id));
    }

    let j = showCustomers ? activeJobs : [];
    // Note: In current system, "Active Jobs" markers represent Customers presence with jobs
    // To support "Online Customer" vs "Offline Customer" we would need a list of all users.
    // For now, we use activeJobs to represent active customers.
    if (customerFilter === 'ACTIVE') j = activeJobs;

    return { filteredProviders: p, filteredJobs: j };
  }, [providers, activeJobs, providerFilter, customerFilter, showProviders, showCustomers]);

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

      let color = "#777777";
      let glow = false;

      if (type === 'PROVIDER') {
          if (data.isOnline) {
              color = "#22c55e"; // Green
              const hasJob = activeJobs.some(job => job.providerId?._id === data.userId?._id || job.providerId === data.userId?._id);
              if (hasJob) glow = true;
          } else {
              color = "#ef4444"; // Red
          }
      } else {
          // CUSTOMER
          color = "#eab308"; // Yellow
          const hasProvider = !!data.providerId;
          if (hasProvider) glow = true;
      }

      return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: glow ? 4 : 2,
          strokeColor: "#ffffff",
          scale: glow ? 12 : 8,
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

        <div className="bg-white/90 backdrop-blur-xl border border-neutral-200 p-4 rounded-3xl shadow-2xl space-y-4 min-w-[240px]">
            {/* Legend Header */}
            <button
                onClick={() => setIsLegendOpen(!isLegendOpen)}
                className="flex items-center justify-between w-full mb-2"
            >
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Operations Control</span>
                </div>
                {isLegendOpen ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
            </button>

            {isLegendOpen && (
                <>
                    {/* Legend Content */}
                    <div className="space-y-2 pb-4 border-b border-neutral-100">
                        <LegendItem color="#22c55e" label="Online Provider" />
                        <LegendItem color="#22c55e" label="Provider on Job" glow />
                        <LegendItem color="#ef4444" label="Offline Provider" />
                        <LegendItem color="#eab308" label="Online Customer" />
                        <LegendItem color="#eab308" label="Customer w/ Job" glow />
                        <LegendItem color="#3b82f6" label="Offline Customer" />
                    </div>

                    {/* Filter Switches */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-neutral-500">Providers</span>
                            <input type="checkbox" checked={showProviders} onChange={e => setShowProviders(e.target.checked)} className="w-4 h-4 rounded border-neutral-300" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-neutral-500">Customers</span>
                            <input type="checkbox" checked={showCustomers} onChange={e => setShowCustomers(e.target.checked)} className="w-4 h-4 rounded border-neutral-300" />
                        </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* Sub-Filters */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-neutral-400">Provider Status</label>
                            <div className="flex flex-wrap gap-1">
                                {(['ALL', 'ONLINE', 'OFFLINE', 'ACTIVE'] as ProviderFilter[]).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setProviderFilter(f)}
                                        className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${providerFilter === f ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-neutral-400">Customer Focus</label>
                            <div className="flex flex-wrap gap-1">
                                {(['ALL', 'ACTIVE'] as CustomerFilter[]).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setCustomerFilter(f)}
                                        className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${customerFilter === f ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
                                    >
                                        {f === 'ALL' ? 'Show All' : 'Active Only'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
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
              <p className="font-black uppercase text-xs tracking-tight text-neutral-900">
                  {selected.type === 'PROVIDER' ? 'Provider Portal' : 'Service Engagement'}
              </p>
              <div className="h-px bg-neutral-100" />
              {selected.type === 'PROVIDER' ? (
                  <>
                      <p className="text-sm font-bold text-neutral-800">{selected.userId?.firstName} {selected.userId?.lastName}</p>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">{selected.userId?._id.slice(-6)}</p>
                      <Badge className={selected.isOnline ? 'bg-brand-provider-green' : 'bg-brand-customer-red'}>
                          {selected.isOnline ? 'ONLINE_SIGNAL' : 'LOST_SIGNAL'}
                      </Badge>
                  </>
              ) : (
                  <>
                      <p className="text-sm font-bold text-neutral-800">Job: {selected.serviceCode}</p>
                      <p className="text-[10px] text-neutral-500 uppercase font-black">{selected.status}</p>
                      <p className="text-[10px] font-black text-brand-customer-red">{selected._id.slice(-6).toUpperCase()}</p>
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
            <span className="text-[9px] font-black text-neutral-700 uppercase tracking-tight">{label}</span>
        </div>
    );
}
