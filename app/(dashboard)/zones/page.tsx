"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import { useGoogleMaps } from '@/components/shared/GoogleMapsProvider';
import {
  GoogleMap,
  DrawingManager,
  Polygon,
  Autocomplete,
} from '@react-google-maps/api';
import {
  Map as MapIcon,
  Plus,
  Navigation,
  Save,
  Trash2,
  Globe,
  RefreshCcw,
  X,
  Edit,
  Power,
  Search,
  Users,
  Briefcase,
  Layers,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -26.2041,
  lng: 28.0473
};

export default function ZoneManagement() {
  const { countryCode, currentCountry } = useCountryStore();
  const { isLoaded } = useGoogleMaps();
  const [mounted, setMounted] = useState(false);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [zoneStats, setZoneStats] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
      name: '',
      zoneCode: '',
      cityName: '',
      province: '',
      isActive: true
  });

  // Drawing state
  const [drawingMode, setDrawingManagerMode] = useState<any>(null);
  const [tempPolygon, setTempPolygon] = useState<any>(null);
  const drawingManagerRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
      setMounted(true);
  }, []);

  const loadZones = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/zones?countryCode=${countryCode}`);
        setZones(res.data?.data || res.data?.zones || []);
    } catch (e) {
        console.error('Failed to load zones');
    } finally {
        setLoading(false);
    }
  };

  const loadZoneStats = async (id: string) => {
      try {
          const res = await api.get(`/api/admin/zones/${id}/stats`);
          setZoneStats(res.data?.data || null);
      } catch (e) {
          setZoneStats(null);
      }
  };

  useEffect(() => {
    if (countryCode && mounted) loadZones();
  }, [countryCode, mounted]);

  useEffect(() => {
      if (currentZone?._id) {
          loadZoneStats(currentZone._id);
      } else {
          setZoneStats(null);
      }
  }, [currentZone]);

  const onPolygonComplete = (polygon: any) => {
      if (typeof polygon.getPath !== 'function') return;

      const path = polygon.getPath();
      const coords = [];
      for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coords.push([point.lng(), point.lat()]);
      }
      // Close the polygon
      if (coords.length > 0) {
          coords.push(coords[0]);
      }

      setTempPolygon(coords);
      setDrawingManagerMode(null);
      polygon.setMap(null);
  };

  const handlePlaceChanged = () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.geometry?.location) return;

      map?.panTo(place.geometry.location);
      map?.setZoom(13);

      const addressComponents = place.address_components || [];
      const province = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name || '';
      const city = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name ||
                   addressComponents.find((c: any) => c.types.includes('postal_town'))?.long_name || '';

      setFormData(prev => ({
          ...prev,
          name: prev.name || place.name || '',
          cityName: city,
          province: province
      }));
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!tempPolygon && !currentZone?.boundary) {
          alert('Please draw a zone on the map first.');
          return;
      }

      const payload = {
          ...formData,
          countryCode: countryCode,
          countryName: currentCountry?.name || 'Unknown',
          boundary: {
              type: "Polygon",
              coordinates: [tempPolygon || currentZone.boundary.coordinates[0]]
          }
      };

      try {
          if (currentZone?._id) {
              await api.patch(`/api/admin/zones/${currentZone._id}`, payload);
          } else {
              await api.post('/api/admin/zones', payload);
          }
          setShowForm(false);
          setTempPolygon(null);
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
          if (currentZone?._id === id) setCurrentZone(null);
          loadZones();
      } catch (e: any) {
          alert(e.response?.data?.message || 'Delete failed');
      }
  };

  const getPolygonPath = (zone: any) => {
      if (!zone?.boundary?.coordinates?.[0]) return [];
      return zone.boundary.coordinates[0].map((coord: any) => ({
          lat: coord[1],
          lng: coord[0]
      }));
  };

  const tempPolygonPath = tempPolygon ? tempPolygon.map((coord: any) => ({
      lat: coord[1],
      lng: coord[0]
  })) : [];

  if (!mounted) {
      return (
          <div className="flex h-full items-center justify-center min-h-[400px]">
              <RefreshCcw className="animate-spin text-neutral-300" size={32} />
          </div>
      );
  }

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Geo-Fence Grid Constructor</h1>
          <p className="text-neutral-500 font-medium">Define regional isolation perimeters for Pricing, Matching, and Surcharges.</p>
        </div>
        <div className="flex gap-3">
            <button
                onClick={() => {
                    setCurrentZone(null);
                    setTempPolygon(null);
                    setFormData({ name: '', zoneCode: '', cityName: '', province: '', isActive: true });
                    setShowForm(true);
                }}
                className="bg-neutral-900 text-white px-8 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
            >
                <Plus size={16} />
                Trace New Perimeter
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
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
                            className={`p-6 transition-all group cursor-pointer ${currentZone?._id === zone._id ? 'bg-neutral-900 text-white shadow-2xl' : 'hover:bg-neutral-50 bg-white'}`}
                            onClick={() => {
                                setCurrentZone(zone);
                                if (zone.boundary?.coordinates?.[0]?.[0]) {
                                    map?.panTo({ lat: zone.boundary.coordinates[0][0][1], lng: zone.boundary.coordinates[0][0][0] });
                                }
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black tracking-tight uppercase text-sm">{zone.name}</h4>
                                <div className={`w-1.5 h-1.5 rounded-full ${zone.isActive ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-neutral-300'}`}></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${currentZone?._id === zone._id ? 'text-neutral-400' : 'text-neutral-400'}`}>{zone.cityName} • {zone.zoneCode}</p>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentZone(zone);
                                            setFormData({
                                                name: zone.name,
                                                zoneCode: zone.zoneCode,
                                                cityName: zone.cityName,
                                                province: zone.province,
                                                isActive: zone.isActive
                                            });
                                            setShowForm(true);
                                        }}
                                        className="p-1.5 bg-white text-neutral-900 rounded-lg shadow-sm border border-neutral-200"
                                    >
                                        <Edit size={12} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleToggle(zone._id, zone.isActive); }} className={`p-1.5 rounded-lg shadow-sm border ${zone.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}><Power size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(zone._id); }} className="p-1.5 bg-red-50 text-red-600 rounded-lg shadow-sm border border-red-100"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ZONE STATS */}
            {currentZone && zoneStats && (
                <div className="p-6 bg-neutral-900 text-white border-t border-white/10 space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Live Zone Metrics</h5>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <Users size={14} className="text-blue-400 mb-2" />
                            <p className="text-lg font-black leading-none">{zoneStats.onlineProviders}</p>
                            <p className="text-[8px] font-bold text-neutral-500 uppercase mt-1">Online</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <Layers size={14} className="text-green-400 mb-2" />
                            <p className="text-lg font-black leading-none">{zoneStats.servicesAvailable}</p>
                            <p className="text-[8px] font-bold text-neutral-500 uppercase mt-1">Services</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <Briefcase size={14} className="text-purple-400 mb-2" />
                            <p className="text-lg font-black leading-none">{zoneStats.completedJobs}</p>
                            <p className="text-[8px] font-bold text-neutral-500 uppercase mt-1">Jobs</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 bg-neutral-50 border-t">
                <p className="text-[9px] font-black text-neutral-400 uppercase text-center tracking-[0.2em]">Data isolation: {countryCode}</p>
            </div>
        </div>

        {/* MAP VIEW */}
        <div className="xl:col-span-3 bg-[#0A0A0A] rounded-[40px] shadow-2xl relative overflow-hidden group border border-neutral-800">
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={defaultCenter}
                    zoom={11}
                    onLoad={setMap}
                    options={{
                        styles: darkMapStyle,
                        disableDefaultUI: true,
                        zoomControl: true,
                    }}
                >
                    <DrawingManager
                        onLoad={dm => drawingManagerRef.current = dm}
                        onPolygonComplete={onPolygonComplete}
                        drawingMode={drawingMode}
                        options={{
                            drawingControl: false,
                            polygonOptions: {
                                fillColor: '#3b82f6',
                                fillOpacity: 0.3,
                                strokeColor: '#3b82f6',
                                strokeWeight: 2,
                                clickable: false,
                                editable: false,
                                zIndex: 1
                            }
                        }}
                    />

                    {zones.map(zone => (
                        <Polygon
                            key={zone._id}
                            paths={getPolygonPath(zone)}
                            options={{
                                fillColor: currentZone?._id === zone._id ? '#ef4444' : '#525252',
                                fillOpacity: currentZone?._id === zone._id ? 0.4 : 0.2,
                                strokeColor: currentZone?._id === zone._id ? '#ef4444' : '#737373',
                                strokeWeight: 2,
                            }}
                            onClick={() => setCurrentZone(zone)}
                        />
                    ))}

                    {tempPolygon && (
                        <Polygon
                            paths={tempPolygonPath}
                            options={{
                                fillColor: '#3b82f6',
                                fillOpacity: 0.5,
                                strokeColor: '#3b82f6',
                                strokeWeight: 3,
                            }}
                        />
                    )}
                </GoogleMap>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Map Engine...</div>
            )}

            {/* MAP CONTROLS */}
            <div className="absolute top-8 left-8 flex flex-col gap-4">
                {isLoaded && (
                    <div className="w-80 relative group">
                        <Autocomplete
                            onLoad={ac => autocompleteRef.current = ac}
                            onPlaceChanged={handlePlaceChanged}
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search Area / City..."
                                    className="w-full bg-white/90 backdrop-blur-xl border border-white/20 pl-12 pr-4 py-4 rounded-2xl shadow-2xl text-sm font-bold text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                            </div>
                        </Autocomplete>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => setDrawingManagerMode(drawingMode === 'polygon' ? null : 'polygon')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl ${drawingMode === 'polygon' ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-white text-neutral-900 hover:bg-neutral-50'}`}
                    >
                        <Edit size={14} />
                        {drawingMode === 'polygon' ? 'STOP DRAWING' : 'DRAW POLYGON'}
                    </button>
                    {tempPolygon && (
                        <button
                            onClick={() => setTempPolygon(null)}
                            className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:bg-red-700"
                        >
                            Clear Drawing
                        </button>
                    )}
                </div>
            </div>

            <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3">
                <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] shadow-2xl flex flex-col items-end">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Matching Precision</p>
                    <p className="text-xs font-black text-white italic">2DSPHERE_INDEXED</p>
                </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-neutral-900/90 backdrop-blur border border-white/10 p-6 rounded-[32px] max-w-sm shadow-2xl">
                <h4 className="text-white font-black text-xs uppercase mb-3 flex items-center gap-2">
                    <Navigation size={14} className="text-blue-500" />
                    Geometry Enforcement
                </h4>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                    Polygons are validated server-side. Point-in-polygon resolution determines service availability for customers and broadcasting targets for providers.
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
                        <h3 className="text-2xl font-black uppercase tracking-tighter">{currentZone?._id ? 'Edit regional boundary' : 'Define new geo-fence'}</h3>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Spatial data will propagate to Matching Engine.</p>
                      </div>
                      <button onClick={() => setShowForm(false)} className="p-3 hover:bg-white rounded-2xl transition-all"><X size={24} className="text-neutral-300" /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-10 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2 space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Zone Name</label>
                              <input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                placeholder="e.g. Sandton Business District"
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-1 focus:ring-neutral-900 transition-all"
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Zone Code</label>
                              <input
                                value={formData.zoneCode}
                                onChange={(e) => setFormData({...formData, zoneCode: e.target.value})}
                                required
                                placeholder="e.g. JHB-CENTRAL"
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none"
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">City / Municipality</label>
                              <input
                                value={formData.cityName}
                                onChange={(e) => setFormData({...formData, cityName: e.target.value})}
                                required
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none"
                              />
                          </div>
                          <div className="col-span-2 space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Province / State</label>
                              <input
                                value={formData.province}
                                onChange={(e) => setFormData({...formData, province: e.target.value})}
                                required
                                placeholder="e.g. Gauteng"
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none"
                              />
                          </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            <label className="text-xs font-black text-neutral-800 uppercase tracking-widest">Zone Active for Matching</label>
                      </div>

                      {(!tempPolygon && !currentZone?.boundary) && (
                          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-4 items-center">
                              <X className="text-red-600 shrink-0" size={20} />
                              <p className="text-[10px] text-red-800 font-bold leading-relaxed uppercase">Polygon coordinates missing. Draw boundary on map before saving.</p>
                          </div>
                      )}

                      <div className="pt-4">
                          <button type="submit" className="w-full bg-neutral-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Save size={18} />
                            Commit Geofence Entity
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "administrative.land_parcel",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#181818" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1b1b1b" }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#373737" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3c3c3c" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [{ color: "#4e4e4e" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "transit",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3d3d3d" }],
    },
  ];
