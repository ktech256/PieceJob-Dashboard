"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Map as MapIcon,
  Filter,
  RefreshCcw,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, HeatmapLayer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -26.2041,
  lng: 28.0473
};

export default function ServiceDemandHeatmap() {
  const { countryCode } = useCountryStore();
  const [loading, setLoading] = useState(true);
  const [densityData, setDensityData] = useState<any[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/analytics/heatmap?countryCode=${countryCode}`);
        setDensityData(res.data.density);
    } catch (e) {
        console.error('Heatmap load failed');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) fetchData();
  }, [countryCode]);

  const heatmapPoints = isLoaded ? densityData.map(d => ({
      location: new google.maps.LatLng(d.lat, d.lng),
      weight: d.weight
  })) : [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Service Demand Heatmap</h1>
          <p className="text-neutral-500 font-medium">Visualizing spatial request density and surge requirements for {countryCode}.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchData} className="bg-white border border-neutral-200 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-neutral-50 transition-all flex items-center gap-2">
                <RefreshCcw size={14} /> Sync Density
            </button>
            <button className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase hover:scale-105 transition-all shadow-lg">Export Layer</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[700px]">
        {/* HEATMAP CONTROL PANEL */}
        <div className="xl:col-span-1 bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-8">
                <div>
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Density Analysis</h3>
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-neutral-500">Active Clusters</span>
                            <span className="text-xs font-black text-red-600">{densityData.length} Points</span>
                         </div>
                         <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-red-600"></div>
                         </div>
                    </div>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                    <div className="flex items-center gap-2 text-neutral-800 mb-4">
                        <TrendingUp size={16} />
                        <span className="text-xs font-black uppercase tracking-tight">Growth Trend</span>
                    </div>
                    <p className="text-2xl font-black text-neutral-900">+12.4%</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Request volume vs last week</p>
                </div>
            </div>

            <div className="bg-[#0A0A0A] rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Zap size={40} /></div>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Surge Recommendation</p>
                <p className="text-lg font-black">1.2x Multiplier</p>
                <button className="w-full mt-4 bg-white text-black py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all">Apply to Zone</button>
            </div>
        </div>

        {/* MAP VISUALIZATION */}
        <div className="xl:col-span-3 bg-neutral-900 rounded-[40px] shadow-2xl relative overflow-hidden">
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
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
                    <HeatmapLayer
                        data={heatmapPoints}
                        options={{
                            radius: 20,
                            opacity: 0.8
                        }}
                    />
                </GoogleMap>
            ) : (
                <div className="flex items-center justify-center h-full text-white font-black uppercase animate-pulse">Initializing Geospatial Grid...</div>
            )}

            <div className="absolute top-8 left-8 bg-neutral-800/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Demand Heat Layer</span>
            </div>

            <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-xl border border-neutral-200 p-6 rounded-3xl shadow-2xl">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Legend</h4>
                <div className="flex flex-col gap-3">
                    <LegendItem color="bg-red-600" label="Extreme Demand" />
                    <LegendItem color="bg-orange-500" label="High Volume" />
                    <LegendItem color="bg-blue-500" label="Steady Flow" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-tight">{label}</span>
        </div>
    )
}
