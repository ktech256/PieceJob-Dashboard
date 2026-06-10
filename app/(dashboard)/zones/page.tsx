"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Map as MapIcon,
  Layers,
  Plus,
  Target,
  MousePointer2,
  Navigation,
  Save,
  Trash2,
  Maximize2,
  Globe,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';

export default function ZoneManagement() {
  const { countryCode } = useCountryStore();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeZone, setActiveAlert] = useState<any>(null); // Reusing active selection logic

  const loadZones = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/v1/admin/zones?countryCode=${countryCode}`);
        setZones(res.data.zones || []);
    } catch (e) {
        console.error('Failed to load zones');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadZones();
  }, [countryCode]);
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Geospatial Grid Constructor</h1>
          <p className="text-neutral-500 font-medium">Define, audit, and modify regional isolation perimeters using GeoJSON polygons.</p>
        </div>
        <div className="flex gap-3">
             <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                <Globe size={20} className="animate-spin-slow" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest">Database Sync</span>
                    <span className="text-xl font-black leading-none">2dsphere Active</span>
                </div>
            </div>
            <button className="bg-neutral-900 text-white px-8 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-black/10">
                <Plus size={16} />
                Trace New Perimeter
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[750px]">
        {/* ZONE LIST SIDEBAR */}
        <div className="xl:col-span-1 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Active Workspace Polygons</h3>
                <Layers size={14} className="text-neutral-400" />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 scrollbar-hide">
                {zones.length === 0 ? (
                    <div className="p-10 text-center text-neutral-400">No zones defined.</div>
                ) : (
                    zones.map((zone, i) => (
                        <div key={i} className={`p-6 cursor-pointer transition-all hover:bg-neutral-50 group ${zone.isActive ? 'bg-white' : 'bg-neutral-50/50 opacity-40'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black tracking-tight text-neutral-800 group-hover:text-blue-600 transition-all">{zone.name}</h4>
                                {zone.isActive && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>}
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{zone.city}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="p-6 bg-neutral-50 border-t">
                <p className="text-[9px] font-black text-neutral-400 uppercase text-center tracking-[0.2em]">Regional data isolation enforced</p>
            </div>
        </div>

        {/* GEOSPATIAL EDITOR */}
        <div className="xl:col-span-3 bg-neutral-900 rounded-[40px] shadow-2xl relative overflow-hidden group">
            {/* SIMULATED MAP INTERFACE */}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/28.0473,-26.2041,12/1200x750?access_token=MOCK')] bg-cover opacity-50 grayscale contrast-125"></div>

            {/* SVG OVERLAY FOR POLYGON DRAWING */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polygon points="400,200 600,250 550,450 350,400" className="fill-blue-500/20 stroke-blue-500 stroke-2" />
                <circle cx="400" cy="200" r="4" className="fill-white stroke-blue-500 stroke-2" />
                <circle cx="600" cy="250" r="4" className="fill-white stroke-blue-500 stroke-2" />
                <circle cx="550" cy="450" r="4" className="fill-white stroke-blue-500 stroke-2" />
                <circle cx="350" cy="400" r="4" className="fill-white stroke-blue-500 stroke-2" />
            </svg>

            <div className="absolute top-8 left-8 flex gap-3">
                <div className="bg-white/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black text-neutral-400 uppercase mb-1">Editor Status</p>
                    <p className="text-sm font-black text-neutral-800">MODIFYING: SANDTON_CORE</p>
                </div>
                <div className="bg-neutral-800/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Coordinate Precision: 0.0001m</span>
                </div>
            </div>

            {/* FLOATING TOOLS */}
            <div className="absolute top-8 right-8 flex flex-col gap-2">
                <MapActionButton icon={<MousePointer2 size={18} />} active />
                <MapActionButton icon={<Plus size={18} />} />
                <MapActionButton icon={<Target size={18} />} />
                <div className="h-px bg-white/10 my-2"></div>
                <MapActionButton icon={<Maximize2 size={18} />} />
            </div>

            <div className="absolute bottom-8 right-8 flex gap-3">
                <button className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                    <Trash2 size={16} /> Discard
                </button>
                <button className="bg-blue-600 text-white px-10 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-2xl shadow-blue-600/40">
                    <Save size={16} /> Finalize Fence
                </button>
            </div>

            <div className="absolute bottom-8 left-8 bg-neutral-950/80 backdrop-blur border border-white/10 p-6 rounded-[32px] max-w-xs">
                <h4 className="text-white font-black text-xs uppercase mb-3 flex items-center gap-2">
                    <Navigation size={14} className="text-blue-500" />
                    SERVER-SIDE VALIDATION
                </h4>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                    The platform enforces strict server-side geometry validation. Cross-boundary intersections are automatically rejected to maintain workspace integrity.
                </p>
                <div className="mt-4 flex items-center gap-2 text-brand-provider-green">
                    <CheckCircle2 size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Geometry Clean</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function MapActionButton({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
    return (
        <button className={`p-4 rounded-2xl shadow-2xl border transition-all ${
            active
            ? 'bg-blue-600 border-blue-500 text-white scale-110'
            : 'bg-white/90 backdrop-blur border-white/20 text-neutral-800 hover:bg-white hover:scale-105'
        }`}>
            {icon}
        </button>
    )
}
