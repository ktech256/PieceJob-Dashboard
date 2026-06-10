"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  ShieldAlert,
  Zap,
  Eye,
  MapPin,
  Smartphone,
  MessageSquareWarning,
  AlertTriangle,
  RefreshCcw
} from 'lucide-react';

export default function FraudIntelligence() {
  const [activeTab, setActiveTab] = useState("telemetry");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">FraudSense Intelligence</h1>
          <p className="text-neutral-500 font-medium">Autonomous anti-fraud telemetry and behavior screening.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <TabButton active={activeTab === "telemetry"} onClick={() => setActiveTab("telemetry")} label="AI Telemetry" />
            <TabButton active={activeTab === "integrity"} onClick={() => setActiveTab("integrity")} label="Integrity" />
        </div>
      </div>

      {activeTab === "telemetry" && <FraudTelemetry />}
      {activeTab === "integrity" && <IntegrityTracker />}
    </div>
  );
}

function FraudTelemetry() {
    const { countryCode } = useCountryStore();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/admin/fraud/alerts?countryCode=${countryCode}`);
            setAlerts(res.data.alerts || []);
        } catch (e) {
            console.error('Failed to load fraud alerts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadAlerts();
    }, [countryCode]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b flex justify-between items-center bg-red-50/30">
                        <div>
                            <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-600" />
                                High Risk Review Queue
                            </h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Escrow Release Monitoring (Section 327)</p>
                        </div>
                        <button onClick={loadAlerts} className="p-2 bg-white border rounded-xl hover:bg-red-50 transition-all"><RefreshCcw size={16} /></button>
                    </div>
                    <div className="divide-y divide-neutral-50">
                        {loading ? (
                            <div className="p-10 text-center text-xs font-bold text-neutral-300 uppercase tracking-widest">Scanning logs...</div>
                        ) : alerts.length === 0 ? (
                            <div className="p-10 text-center text-neutral-400">No high-risk activity detected in {countryCode}.</div>
                        ) : (
                            alerts.map((alert, i) => (
                                <div key={i} className="p-6 flex justify-between items-center hover:bg-neutral-50/50 transition-all group">
                                    <div className="flex gap-6 items-start">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-neutral-100 text-red-600 group-hover:scale-110 transition-all shrink-0">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-black text-xs uppercase tracking-widest text-neutral-400">SUSPICIOUS_CANCELLATION</p>
                                                <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                                <p className="text-[10px] font-bold text-neutral-300 uppercase">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                            <p className="font-black text-neutral-800 tracking-tight">Job ID: {alert._id.slice(-6)}</p>
                                            <p className="text-xs text-neutral-400 font-medium mt-1">Customer: {alert.customerId?.firstName || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">Audit</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-[#0A0A0A] rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_#410200_0%,_transparent_60%)]"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                             <div className="p-4 bg-brand-customer-red rounded-[24px] text-white">
                                <Zap size={24} />
                             </div>
                             <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">FraudSense Pulse</h3>
                                <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-[9px] mt-2">Workspace Behavior Performance</p>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <TelemetryCard label="Flagged" value={alerts.length.toString()} sub="Events" color="text-red-500" />
                            <TelemetryCard label="Bans" value="0" sub="Active" color="text-yellow-500" />
                            <TelemetryCard label="Isolation" value="Verified" sub={countryCode} color="text-green-500" />
                            <TelemetryCard label="Engine" value="Production" sub="V3.1" color="text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function IntegrityTracker() {
    return (
        <div className="bg-white border border-neutral-200 rounded-[40px] p-12 shadow-sm flex flex-col items-center justify-center h-[600px] relative overflow-hidden">
            <div className="absolute inset-0 bg-neutral-50 opacity-20"></div>
            <div className="relative z-10 text-center max-w-lg">
                <Smartphone size={48} className="mx-auto text-neutral-200 mb-6" />
                <h3 className="text-2xl font-black uppercase text-neutral-800 mb-4">Device Binding Matrix</h3>
                <p className="text-neutral-400 font-medium mb-12">Tracking hardware IDs to enforce strict 1:1 account integrity.</p>
                <div className="bg-neutral-100 border-2 border-dashed border-neutral-200 rounded-3xl p-12">
                    <p className="text-xs font-black uppercase text-neutral-400">Production Device IDs Syncing...</p>
                </div>
            </div>
        </div>
    )
}

function TelemetryCard({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) {
    return (
        <div>
            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-[9px] font-bold text-neutral-500 uppercase mt-1">{sub}</p>
        </div>
    )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase transition-all tracking-widest ${
                active ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-400 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}
