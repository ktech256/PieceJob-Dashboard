"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
    Map as MapIcon,
    Plus,
    RefreshCcw,
    MapPin,
    Shield,
    Activity,
    CheckCircle2,
    XCircle,
    Edit,
    Trash2,
    ChevronRight,
    Globe
} from 'lucide-react';

export default function ZoneManagement() {
    const { countryCode } = useCountryStore();
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentZone, setCurrentZone] = useState<any>(null);

    const loadZones = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/zones?countryCode=${countryCode}`);
            setZones(res.data.data);
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
        const data = Object.fromEntries(formData.entries());

        const payload = {
            ...data,
            isActive: data.isActive === 'on',
            serviceAvailability: data.serviceAvailability === 'on',
            bookingAvailability: data.bookingAvailability === 'on',
            radius: parseFloat(data.radius as string) || 0,
            // For now, setting a default boundary if not drawing on map
            boundary: {
                type: 'Polygon',
                coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
            }
        };

        try {
            if (currentZone?._id) {
                await api.patch(`/api/admin/zones/${currentZone._id}`, payload);
            } else {
                await api.post('/api/admin/zones', payload);
            }
            setShowModal(false);
            loadZones();
        } catch (e) {
            alert('Failed to save zone');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this zone? Active bookings in this area may be affected.')) return;
        try {
            await api.delete(`/api/admin/zones/${id}`);
            loadZones();
        } catch (e) {
            alert('Delete failed');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Operational Service Zones</h1>
                    <p className="text-neutral-500 font-medium">Define and manage geographical coverage boundaries for automated service fulfillment.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadZones} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all shadow-sm"><RefreshCcw size={18} /></button>
                    <button
                        onClick={() => { setCurrentZone(null); setShowModal(true); }}
                        className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                    >
                        <Plus size={16} />
                        Define Zone
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {zones.map((zone) => (
                    <div key={zone._id} className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm group hover:border-neutral-900/10 transition-all">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-100 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-neutral-900">{zone.name}</h3>
                                        <span className="bg-neutral-50 text-neutral-400 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-neutral-100">{zone.zoneCode}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400 font-bold mt-1 uppercase tracking-widest">{zone.province}, {zone.cityName} • {zone.countryCode}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <StatusBadge label="Services" active={zone.serviceAvailability} />
                                <StatusBadge label="Bookings" active={zone.bookingAvailability} />
                                <div className="w-px h-8 bg-neutral-100 hidden lg:block mx-2"></div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setCurrentZone(zone); setShowModal(true); }} className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all border border-neutral-100 text-neutral-400 hover:text-neutral-900"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(zone._id)} className="p-3 bg-neutral-50 rounded-xl hover:bg-red-50 transition-all border border-neutral-100 text-neutral-400 hover:text-red-600"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">{currentZone ? 'Modify Zone Definition' : 'Define New Operational Zone'}</h3>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Geospatial Rule Impact: Providers & Service Availability</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><XCircle size={24} className="text-neutral-300" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <FormGroup label="Zone Name" name="name" defaultValue={currentZone?.name} required />
                                <FormGroup label="Zone Code (unique)" name="zoneCode" defaultValue={currentZone?.zoneCode} required />
                                <FormGroup label="Province/State" name="province" defaultValue={currentZone?.province} required />
                                <FormGroup label="City Name" name="cityName" defaultValue={currentZone?.cityName} required />
                                <FormGroup label="Country Code (ISO)" name="countryCode" defaultValue={currentZone?.countryCode || countryCode} required />
                                <FormGroup label="Operational Radius (KM)" name="radius" defaultValue={currentZone?.radius} type="number" />

                                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <input type="checkbox" name="isActive" defaultChecked={currentZone ? currentZone.isActive : true} className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                                    <label className="text-xs font-black text-neutral-800 uppercase">Zone Active</label>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <input type="checkbox" name="serviceAvailability" defaultChecked={currentZone ? currentZone.serviceAvailability : true} className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                                    <label className="text-xs font-black text-neutral-800 uppercase">Enable Services</label>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-neutral-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                    Commit Zone Definition
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${active ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-tight">{label}: {active ? 'ON' : 'OFF'}</span>
        </div>
    )
}

function FormGroup({ label, name, defaultValue, required, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">{label}</label>
            <input
                name={name}
                type={type}
                defaultValue={defaultValue}
                required={required}
                placeholder={placeholder}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
            />
        </div>
    );
}
