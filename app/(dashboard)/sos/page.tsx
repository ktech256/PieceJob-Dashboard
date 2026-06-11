"use client";

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  AlertCircle,
  ShieldAlert,
  Activity,
  Clock,
  MapPin,
  ChevronRight,
  User,
  History,
  Lock,
  Camera,
  Mic,
  Search,
  RefreshCcw,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Archive,
  AlertTriangle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function SOSHub() {
  const { countryCode } = useCountryStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSiren, setActiveSiren] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const socketRef = useRef<Socket | null>(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/sos/incidents?countryCode=${countryCode}&status=${activeTab}`);
        setIncidents(res.data.incidents || []);
    } catch (e) {
        console.error('Failed to load incidents');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) {
        loadIncidents();

        // Connect Socket for SOS updates
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        socket.emit('join_admin');

        socket.on('sos_siren_trigger', (data) => {
            if (data.countryCode === countryCode || countryCode === 'GLOBAL') {
                setActiveSiren(data);
                loadIncidents();
            }
        });

        socket.on('sos_siren_stop', (data) => {
            if (activeSiren?._id === data._id) {
                setActiveSiren(null);
            }
            loadIncidents();
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }
  }, [countryCode, activeTab]);

  return (
    <div className="space-y-8 relative">
      {/* SIREN OVERLAY */}
      {activeSiren && (
          <div className="fixed inset-0 z-[200] bg-red-600/20 backdrop-blur-md flex items-center justify-center p-8 animate-pulse pointer-events-none">
              <div className="bg-white rounded-[48px] p-12 shadow-[0_0_100px_rgba(220,38,38,0.5)] border-8 border-red-600 max-w-2xl w-full pointer-events-auto animate-in zoom-in-95">
                  <div className="flex flex-col items-center text-center gap-6">
                      <div className="p-8 bg-red-600 rounded-full text-white">
                          <ShieldAlert size={80} className="animate-bounce" />
                      </div>
                      <div>
                          <h2 className="text-5xl font-black uppercase tracking-tighter text-red-600 mb-2">Active SOS Incident</h2>
                          <p className="text-xl font-bold text-neutral-900 uppercase">Emergency Dispatch Required</p>
                      </div>
                      <div className="w-full bg-neutral-50 p-6 rounded-3xl border border-neutral-100 flex justify-between items-center mt-4">
                          <div className="text-left">
                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Incident ID</p>
                              <p className="text-lg font-black text-neutral-900">{activeSiren.incidentId}</p>
                          </div>
                          <div className="text-right text-red-600 font-black uppercase text-sm">
                              {activeSiren.userType} • {activeSiren.countryCode}
                          </div>
                      </div>
                      <button
                        onClick={() => { setActiveIncident(activeSiren); setActiveSiren(null); }}
                        className="w-full bg-red-600 text-white py-6 rounded-[32px] text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-600/30"
                      >
                        Enter Command Center
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Global SOS Hub</h1>
          <p className="text-neutral-500 font-medium text-sm">Centralized incident response and evidence management.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            {['NEW', 'ACTIVE', 'RESOLVED', 'ARCHIVED'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        activeTab === tab ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* INCIDENT QUEUE */}
          <div className="lg:col-span-4 space-y-4 h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                  <div className="py-20 text-center uppercase font-black text-xs tracking-widest text-neutral-300">Synchronizing Emergency Data...</div>
              ) : incidents.length === 0 ? (
                  <div className="py-20 text-center text-neutral-300 uppercase font-black text-xs">No {activeTab.toLowerCase()} incidents.</div>
              ) : incidents.map(inc => (
                  <IncidentCard
                    key={inc._id}
                    incident={inc}
                    active={activeIncident?._id === inc._id}
                    onClick={() => setActiveIncident(inc)}
                  />
              ))}
          </div>

          {/* INCIDENT COMMAND CENTER */}
          <div className="lg:col-span-8">
              {activeIncident ? (
                  <IncidentCommand incidentId={activeIncident._id} />
              ) : (
                  <div className="h-full flex flex-col items-center justify-center border-4 border-dashed rounded-[48px] text-neutral-300 gap-4">
                      <Activity size={64} className="opacity-20" />
                      <p className="font-black uppercase text-sm tracking-widest">Select Incident to Open Command Panel</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}

function IncidentCard({ incident, active, onClick }: any) {
    const isCritical = incident.status === 'NEW' || incident.status === 'ACTIVE';
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer p-6 rounded-[32px] border transition-all ${
                active ? 'bg-neutral-900 text-white shadow-2xl border-neutral-900' : 'bg-white border-neutral-100 hover:border-red-200'
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    isCritical ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-100 text-neutral-600'
                }`}>{incident.status}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-neutral-500' : 'text-neutral-400'}`}>{incident.incidentId}</span>
            </div>
            <h4 className={`text-lg font-black uppercase tracking-tight mb-1 ${active ? 'text-white' : 'text-neutral-900'}`}>
                {incident.userId?.firstName} {incident.userId?.lastName}
            </h4>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {incident.userType} • {incident.countryCode}
            </p>
            <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center opacity-60">
                <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span className="text-[10px] font-black uppercase">{new Date(incident.activatedAt).toLocaleTimeString()}</span>
                </div>
                <ChevronRight size={16} />
            </div>
        </div>
    )
}

function IncidentCommand({ incidentId }: { incidentId: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/sos/incidents/${incidentId}`);
            setData(res.data);
        } catch (e) {
            console.error('Load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetail();

        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        socket.emit('join_sos', incidentId);

        socket.on('sos_live_gps', (ping) => {
            setData((prev: any) => ({
                ...prev,
                evidence: {
                    ...prev.evidence,
                    gpsStream: [...(prev.evidence?.gpsStream || []), ping]
                }
            }));
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, [incidentId]);

    const handleStatusUpdate = async (status: string) => {
        const reason = prompt(`Enter notes for status change to ${status}:`);
        if (!reason) return;
        try {
            await api.patch(`/api/admin/sos/incidents/${incidentId}/status`, { status, reason });
            loadDetail();
        } catch (e) {
            alert('Status update failed');
        }
    };

    if (loading) return <div className="py-20 text-center uppercase font-black text-xs tracking-widest text-neutral-300">Establishing Data Link...</div>;
    if (!data) return <div>Data not found</div>;

    const { incident, evidence, timeline } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* ACTION BAR */}
            <div className="bg-white border border-neutral-200 rounded-[32px] p-6 shadow-sm flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                    {incident.status === 'NEW' && (
                        <button onClick={() => handleStatusUpdate('ACKNOWLEDGED')} className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Acknowledge</button>
                    )}
                    <button onClick={() => handleStatusUpdate('INVESTIGATING')} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Investigate</button>
                    <button onClick={() => handleStatusUpdate('ESCALATED')} className="bg-orange-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Escalate</button>
                    {incident.status === 'RESOLVED' && (
                        <button onClick={() => handleStatusUpdate('ARCHIVED')} className="bg-neutral-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Archive Evidence</button>
                    )}
                </div>
                {incident.status !== 'RESOLVED' && (
                    <button onClick={() => handleStatusUpdate('RESOLVED')} className="bg-green-600 text-white px-10 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20">Resolve & Stop Siren</button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* GPS MONITOR */}
                <div className="bg-[#1A1A1A] rounded-[48px] h-[500px] relative overflow-hidden shadow-2xl border-4 border-white">
                    <div className="absolute top-8 left-8 z-10">
                        <div className="bg-black/50 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest">Live GPS Feed</p>
                            </div>
                            <p className="text-xs font-bold text-neutral-400">Pings: {evidence?.gpsStream?.length || 0}</p>
                        </div>
                    </div>
                    {/* Map Placeholder */}
                    <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s-a+ff0000(28.0473,-26.2041)/28.0473,-26.2041,13,0/600x600?access_token=YOUR_TOKEN')] bg-cover flex items-center justify-center">
                        <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">High Frequency Tracking Active</p>
                    </div>
                </div>

                {/* TIMELINE */}
                <div className="bg-white border border-neutral-200 rounded-[48px] p-10 shadow-sm flex flex-col h-[500px]">
                    <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-8 flex items-center gap-2">
                        <History size={14} /> Incident Timeline
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                        {timeline?.events?.map((ev: any, i: number) => (
                            <div key={i} className="flex gap-4 relative">
                                <div className="w-1 h-full absolute left-[7px] top-4 bg-neutral-50 -z-10"></div>
                                <div className="w-4 h-4 rounded-full bg-neutral-900 border-4 border-white shrink-0 mt-1 shadow-sm"></div>
                                <div>
                                    <p className="text-[11px] font-black text-neutral-900 uppercase tracking-tight">{ev.action.replace(/_/g, ' ')}</p>
                                    <p className="text-[9px] text-neutral-400 font-bold uppercase">{new Date(ev.timestamp).toLocaleString()}</p>
                                    {ev.metadata?.reason && <p className="mt-2 text-[10px] text-neutral-500 italic">"{ev.metadata.reason}"</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* EVIDENCE VAULT */}
            <div className="bg-white border border-neutral-200 rounded-[48px] p-10 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Lock size={14} className="text-brand-customer-red" /> Immutable Evidence Manifest
                    </h3>
                    <div className="flex gap-4">
                        <EvidCount icon={<Camera size={14} />} count={evidence?.photos?.length || 0} label="Photos" />
                        <EvidCount icon={<Mic size={14} />} count={evidence?.audioStream?.length || 0} label="Audio" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Audio Stream</h4>
                        <div className="space-y-2">
                            {evidence?.audioStream?.map((a: any, i: number) => (
                                <div key={i} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3 text-neutral-900">
                                        <Volume2 size={16} />
                                        <span className="text-xs font-black uppercase">Segment {i+1}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-400">{a.duration}s</span>
                                </div>
                            ))}
                            {(!evidence?.audioStream || evidence.audioStream.length === 0) && (
                                <div className="py-10 text-center border-2 border-dashed rounded-3xl text-neutral-300 uppercase text-[10px] font-black">No Audio Logs</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Photo Manifest</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {evidence?.photos?.map((p: any, i: number) => (
                                <div key={i} className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden relative group">
                                    <img src={p.url} className="w-full h-full object-cover" alt="Evidence" />
                                    <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"><Maximize2 size={20} /></button>
                                </div>
                            ))}
                            {(!evidence?.photos || evidence.photos.length === 0) && (
                                <div className="col-span-2 py-10 text-center border-2 border-dashed rounded-3xl text-neutral-300 uppercase text-[10px] font-black">No Visual Evidence</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Chat Snapshot</h4>
                        <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 h-[250px] overflow-y-auto space-y-4 custom-scrollbar">
                            {evidence?.chatHistorySnapshot?.map((m: any, i: number) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-[8px] font-black uppercase text-neutral-400">{m.senderId?.role || 'SYSTEM'} • {new Date(m.createdAt).toLocaleTimeString()}</p>
                                    <p className="text-xs font-medium text-neutral-700">{m.text}</p>
                                </div>
                            ))}
                            {(!evidence?.chatHistorySnapshot || evidence.chatHistorySnapshot.length === 0) && (
                                <div className="h-full flex items-center justify-center text-neutral-300 uppercase text-[10px] font-black">No Chat Locked</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EvidCount({ icon, count, label }: any) {
    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-full border border-neutral-100">
            <span className="text-neutral-400">{icon}</span>
            <span className="text-[10px] font-black text-neutral-900 uppercase">{count} {label}</span>
        </div>
    )
}
