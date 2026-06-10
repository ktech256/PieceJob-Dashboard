"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Bell,
  MapPin,
  Mic,
  ShieldAlert,
  Users,
  Navigation,
  Clock,
  CheckCircle2,
  MoreVertical,
  Activity,
  Phone,
  RefreshCcw
} from 'lucide-react';

export default function SOSHub() {
  const { countryCode } = useCountryStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
        const res = await api.get('/api/v1/sos/active');
        const data = res.data.alerts || [];
        setAlerts(data);
        if (data.length > 0 && !activeAlert) {
            setActiveAlert(data[0]);
        }
    } catch (e) {
        console.error('Failed to load SOS alerts');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const isCrisisActive = alerts.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">SOS Emergency Command</h1>
          <p className="text-neutral-500 font-medium">Crisis response terminal. Real-time intercept of stealth threat triggers.</p>
        </div>

        <div className={`flex items-center gap-6 px-10 py-4 rounded-[32px] border-4 transition-all ${
            isCrisisActive ? 'bg-red-600 border-red-800 text-white animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.3)]' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
            <Bell size={28} className={isCrisisActive ? 'animate-bounce' : ''} />
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 block mb-1">Response System Status</span>
                <span className="text-2xl font-black uppercase tracking-tighter">
                    {isCrisisActive ? 'CRITICAL ALERT ACTIVE' : 'ALL SYSTEMS SECURE'}
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[750px]">
        {/* SOS ACTIVE QUEUE */}
        <div className="xl:col-span-1 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Live Crisis Queue</h3>
                <Activity size={14} className="text-red-500 animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 scrollbar-hide">
                {alerts.length === 0 ? (
                    <div className="p-10 text-center text-neutral-400 font-bold uppercase text-[10px] tracking-widest">No active threats.</div>
                ) : (
                    alerts.map((s, i) => (
                        <div key={s._id} onClick={() => setActiveAlert(s)} className={`p-8 relative overflow-hidden group cursor-pointer shadow-2xl transition-all ${activeAlert?._id === s._id ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-50'}`}>
                            <div className={`absolute top-0 left-0 bottom-0 w-2 ${activeAlert?._id === s._id ? 'bg-red-600' : 'bg-neutral-200'}`}></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Urgent</span>
                                    <span className={`text-[10px] font-mono ${activeAlert?._id === s._id ? 'text-neutral-500' : 'text-neutral-400'}`}>{new Date(s.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <h4 className={`text-xl font-black tracking-tight mb-1 ${activeAlert?._id === s._id ? 'text-white' : 'text-neutral-800'}`}>{s.userId?.firstName} {s.userId?.lastName}</h4>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">SOS • {s._id.slice(-6)}</p>
                                <div className="flex items-center gap-2 text-xs font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl w-fit">
                                    <MapPin size={12} />
                                    {s.location?.coordinates?.join(', ')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* EVIDENCE MANIFEST PANEL */}
        <div className="xl:col-span-3 space-y-8 flex flex-col">
            {activeAlert ? (
                <div className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm flex-1 relative overflow-hidden flex flex-col gap-8">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-6 items-center">
                            <div className="w-16 h-16 bg-neutral-900 rounded-[24px] flex items-center justify-center text-white relative shadow-2xl border-4 border-red-600">
                                 <span className="text-2xl font-black">{activeAlert.userId?.firstName?.charAt(0)}</span>
                                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-4 border-white"><Activity size={10} /></div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-800">Crisis Evidence Manifest</h3>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-1">Intercepting {activeAlert.userId?.firstName} | Job ID: {activeAlert.jobId?._id || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-green-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-green-600/20 hover:scale-105 transition-all">Mark Resolved</button>
                            <button className="bg-neutral-100 text-neutral-400 p-3 rounded-2xl hover:bg-neutral-200 transition-all"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1">
                        {/* 1. Live GPS Stream */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Navigation size={12} className="text-red-600" />
                                Live High-Freq GPS
                            </h4>
                            <div className="bg-neutral-100 rounded-3xl h-[280px] border-2 border-dashed border-neutral-200 flex items-center justify-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/28.0473,-26.2041,16/400x280?access_token=YOUR_REAL_TOKEN')] bg-cover opacity-60"></div>
                                 <div className="relative z-10 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white animate-ping shadow-[0_0_20px_#dc2626]">
                                    <MapPin size={16} />
                                 </div>
                                 <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border shadow-sm">
                                    <p className="text-[8px] font-black text-neutral-400 uppercase">Coordinates</p>
                                    <p className="text-[10px] font-mono font-bold">{activeAlert.location?.coordinates?.join(', ')}</p>
                                 </div>
                            </div>
                        </div>

                        {/* 2. Audio Intercept */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Mic size={12} className="text-red-600" />
                                Active Audio Stream
                            </h4>
                            <div className="bg-neutral-900 rounded-3xl h-[280px] p-6 flex flex-col justify-between shadow-2xl">
                                <div className="flex justify-between items-start">
                                    <span className="bg-brand-customer-red text-white text-[8px] font-black px-2 py-0.5 rounded animate-pulse">RECORDING</span>
                                    <span className="text-[10px] font-mono text-neutral-500 tracking-tighter">00:12:45</span>
                                </div>
                                <div className="flex items-center gap-1 h-20">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={`flex-1 bg-brand-customer-red rounded-full animate-bounce`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 100}ms` }}></div>
                                    ))}
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase py-2.5 rounded-xl border border-white/10 transition-all">Play Back Loop</button>
                            </div>
                        </div>

                        {/* 3. Emergency Contacts */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Users size={12} className="text-red-600" />
                                Dispatch Protocols
                            </h4>
                            <div className="space-y-3">
                                <ProtocolAction label="Notify Nearest 5 Pros" active />
                                <ProtocolAction label="SMS to Emerg. Contacts" active />
                                <ProtocolAction label="Local Police Broadcast" />
                                <ProtocolAction label="Lock Job State" active />
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-100 rounded-[32px] p-8 flex justify-between items-center">
                        <div className="flex gap-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Phone size={14} className="text-neutral-400" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Regional Hub</p>
                                    <p className="text-sm font-black text-neutral-800">South Africa (ZA)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-red-600 bg-red-50 px-4 py-2 rounded-2xl border border-red-100">
                                 <ShieldAlert size={14} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Escalated to Support Admin</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] animate-pulse">Waiting for Responder Action...</p>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed rounded-[40px] text-neutral-300 font-black uppercase text-sm">Select a ticket to begin mediation</div>
            )}
        </div>
      </div>
    </div>
  );
}

function ProtocolAction({ label, active }: { label: string, active?: boolean }) {
    return (
        <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${active ? 'bg-green-50 border-green-100' : 'bg-neutral-50 border-neutral-100 opacity-60'}`}>
            <span className={`text-[11px] font-black uppercase tracking-tighter ${active ? 'text-green-700' : 'text-neutral-400'}`}>{label}</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-green-600 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                {active ? <CheckCircle2 size={12} /> : <Clock size={10} />}
            </div>
        </div>
    )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}
