"use client";

import { useEffect, useState, useRef } from 'react';
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
  RefreshCcw,
  X,
  Edit,
  Power,
  AlertTriangle
} from 'lucide-react';

export default function ZoneManagement() {
  const { countryCode } = useCountryStore();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentZone, setCurrentService] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const loadZones = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/zones?countryCode=${countryCode}`);
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());

      // Structural GeoJSON format
      const payload = {
          name: data.name,
          zoneCode: data.zoneCode,
          cityName: data.cityName,
          isActive: data.isActive === 'on',
          boundary: {
              type: "Polygon",
              coordinates: [[
                  [28.0473, -26.2041], // Simulated Jo'burg points
                  [28.0483, -26.2051],
                  [28.0493, -26.2061],
                  [28.0473, -26.2041]
              ]]
          }
      };

      try {
          if (currentZone?._id) {
              await api.patch(`/api/admin/zones/${currentZone._id}`, payload);
          } else {
              await api.post('/api/admin/zones', payload);
          }
          setShowForm(false);
          loadZones();
      } catch (e: any) {
          alert(e.response?.data?.message || 'Save failed');
      }
  };

  const handleToggle = async (id: string, active: boolean) => {
      try {
          await api.patch(`/api/admin/zones/${id}/toggle`, { isActive: !active });
          loadZones();
      } catch (e) {
          alert('Toggle failed');
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm('Are you sure? This might affect pricing rules.')) return;
      try {
          await api.delete(`/api/admin/zones/${id}`);
          loadZones();
      } catch (e: any) {
          alert(e.response?.data?.message || 'Delete failed');
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Geo-Fence Grid Constructor</h1>
          <p className="text-neutral-500 font-medium">Define regional isolation perimeters for Pricing, Matching, and Surcharges.</p>
        </div>
        <div className="flex gap-3">
            <button
                onClick={() => { setCurrentService(null); setShowForm(true); }}
                className="bg-neutral-900 text-white px-8 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
            >
                <Plus size={16} />
                Trace New Perimeter
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[750px]">
        {/* ZONE LIST SIDEBAR */}
        <div className="xl:col-span-1 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Regional Polygons</h3>
                <button onClick={loadZones} className="text-neutral-400 hover:text-neutral-900 transition-all"><RefreshCcw size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 scrollbar-hide">
                {loading ? (
                    <div className="p-10 text-center text-xs font-bold text-neutral-300 uppercase tracking-widest animate-pulse">Syncing 2dsphere...</div>
                ) : zones.length === 0 ? (
                    <div className="p-10 text-center text-neutral-400">No zones defined.</div>
                ) : (
                    zones.map((zone) => (
                        <div
                            key={zone._id}
                            className={`p-6 transition-all group ${currentZone?._id === zone._id ? 'bg-neutral-900 text-white shadow-2xl' : 'hover:bg-neutral-50 bg-white'}`}
                            onClick={() => setCurrentService(zone)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black tracking-tight uppercase text-sm">{zone.name}</h4>
                                <div className={`w-1.5 h-1.5 rounded-full ${zone.isActive ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-neutral-300'}`}></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${currentZone?._id === zone._id ? 'text-neutral-400' : 'text-neutral-400'}`}>{zone.cityName} • {zone.zoneCode}</p>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={(e) => { e.stopPropagation(); setCurrentService(zone); setShowForm(true); }} className="p-1.5 bg-white text-neutral-900 rounded-lg shadow-sm border border-neutral-200"><Edit size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleToggle(zone._id, zone.isActive); }} className={`p-1.5 rounded-lg shadow-sm border ${zone.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}><Power size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(zone._id); }} className="p-1.5 bg-red-50 text-red-600 rounded-lg shadow-sm border border-red-100"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="p-6 bg-neutral-50 border-t">
                <p className="text-[9px] font-black text-neutral-400 uppercase text-center tracking-[0.2em]">Data isolation: {countryCode}</p>
            </div>
        </div>

        {/* MAP VIEW */}
        <div className="xl:col-span-3 bg-[#0A0A0A] rounded-[40px] shadow-2xl relative overflow-hidden group">
            {/* Real Map would go here */}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/28.0473,-26.2041,11/1200x750?access_token=MAPBOX_TOKEN')] bg-cover opacity-60"></div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {/* Simulated Zone Path */}
            {currentZone && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[300px] h-[200px] border-4 border-blue-500 bg-blue-500/20 backdrop-blur-sm rounded-[40px] animate-pulse flex items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white rounded-full border-4 border-blue-500"></div>
                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full border-4 border-blue-500"></div>
                        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full border-4 border-blue-500"></div>
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full border-4 border-blue-500"></div>
                        <p className="text-white font-black uppercase text-[10px] tracking-widest">{currentZone.name}</p>
                    </div>
                </div>
            )}

            <div className="absolute top-8 left-8 flex gap-3">
                <div className="bg-white/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                    <div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase mb-1">Active Coordinates</p>
                        <p className="text-sm font-black text-neutral-800 tracking-tighter">-26.2041, 28.0473</p>
                    </div>
                    <div className="w-px h-8 bg-neutral-200"></div>
                    <div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase mb-1">Status</p>
                        <p className="text-sm font-black text-blue-600">EDITOR_READY</p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-neutral-900/90 backdrop-blur border border-white/10 p-6 rounded-[32px] max-w-sm">
                <h4 className="text-white font-black text-xs uppercase mb-3 flex items-center gap-2">
                    <Navigation size={14} className="text-blue-500" />
                    Geometry Enforcement
                </h4>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                    Polygons are validated server-side. Self-intersections are automatically corrected or rejected. Regional boundaries are enforced at the point of persistence.
                </p>
            </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">{currentZone ? 'Edit regional boundary' : 'Define new geo-fence'}</h3>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Spatial data will propagate to Matching Engine.</p>
                      </div>
                      <button onClick={() => setShowForm(false)} className="p-3 hover:bg-white rounded-2xl transition-all"><X size={24} className="text-neutral-300" /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-10 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2 space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Zone Name</label>
                              <input name="name" defaultValue={currentZone?.name} required className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-1 focus:ring-neutral-900 transition-all" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Zone Code</label>
                              <input name="zoneCode" defaultValue={currentZone?.zoneCode} required placeholder="e.g. JHB-CENTRAL" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">City Name</label>
                              <input name="cityName" defaultValue={currentZone?.cityName} required className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none" />
                          </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <input type="checkbox" name="isActive" defaultChecked={currentZone ? currentZone.isActive : true} className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                            <label className="text-xs font-black text-neutral-800 uppercase tracking-widest">Zone Active for Matching</label>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4">
                          <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                          <p className="text-[10px] text-yellow-800 font-bold leading-relaxed uppercase">Manual coordinates injection active for constructor session. Draw tool requires active Mapbox clearance.</p>
                      </div>

                      <div className="pt-4">
                          <button type="submit" className="w-full bg-neutral-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Save size={18} />
                            Save Geospatial Entity
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
