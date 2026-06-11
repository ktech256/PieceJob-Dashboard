"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api/axios';
import { useCountryStore } from '../../../lib/store/countryStore';
import {
  Activity,
  Heart,
  Trophy,
  MapPin,
  UserCheck,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCcw
} from 'lucide-react';

export default function ProvidersManagement() {
  const [activeTab, setActiveTab] = useState("monitor");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Provider Force Command</h1>
          <p className="text-neutral-500 font-medium">Monitor live connectivity, performance metrics, and tier-based benefits.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <TabButton active={activeTab === "monitor"} onClick={() => setActiveTab("monitor")} label="Live Monitor" />
            <TabButton active={activeTab === "performance"} onClick={() => setActiveTab("performance")} label="Performance" />
            <TabButton active={activeTab === "lifecycle"} onClick={() => setActiveTab("lifecycle")} label="Lifecycle" />
        </div>
      </div>

      {activeTab === "monitor" && <LiveMonitor />}
      {activeTab === "performance" && <PerformanceEngine />}
      {activeTab === "lifecycle" && <LifecycleTracker />}
    </div>
  );
}

function LiveMonitor() {
    const { countryCode } = useCountryStore();
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMonitor = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/providers/monitor?countryCode=${countryCode}`);
            setProviders(res.data.providers || []);
        } catch (e) {
            console.error('Failed to load monitor data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadMonitor();
    }, [countryCode]);

    const onlineCount = providers.filter(p => p.isOnline).length;
    const offlineCount = providers.length - onlineCount;

    return (
        <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Online/Offline Truth System</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">60s Heartbeat Monitoring (Section 250)</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-lg font-black text-brand-provider-green">{onlineCount}</p>
                            <p className="text-[8px] font-bold text-neutral-400 uppercase">Healthy</p>
                        </div>
                        <div className="w-px h-8 bg-neutral-200"></div>
                        <div className="text-center">
                            <p className="text-lg font-black text-red-500">{offlineCount}</p>
                            <p className="text-[8px] font-bold text-neutral-400 uppercase">Ghost Offline</p>
                        </div>
                        <button onClick={loadMonitor} className="ml-4 p-2 bg-white border rounded-xl hover:bg-neutral-50 transition-all"><RefreshCcw size={16} /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                            <tr>
                                <th className="px-8 py-4">Provider</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Last Heartbeat</th>
                                <th className="px-8 py-4">Signal Integrity</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 text-sm">
                            {providers.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">No providers found in this workspace.</td></tr>
                            ) : (
                                providers.map((p, i) => (
                                    <tr key={i} className="hover:bg-neutral-50/50 transition-all">
                                        <td className="px-8 py-5 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-neutral-100 rounded-full border border-neutral-200 flex items-center justify-center font-black text-neutral-400 uppercase">{p.userId?.firstName?.charAt(0)}</div>
                                            <div>
                                                <p className="font-black text-neutral-800 tracking-tight">{p.userId?.firstName} {p.userId?.lastName}</p>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase">{p.userId?.phoneNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${p.isOnline ? 'bg-brand-provider-green' : 'bg-red-500 animate-pulse'}`}></div>
                                                <span className="text-[10px] font-black uppercase text-neutral-700 tracking-tighter">{p.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-mono text-[10px] font-bold text-neutral-500">{new Date(p.updatedAt).toLocaleTimeString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${p.isOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{p.isOnline ? 'OPTIMAL' : 'LOST'}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-neutral-400 hover:text-neutral-900 transition-all"><MoreHorizontal size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function PerformanceEngine() {
    const { countryCode } = useCountryStore();
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPerformance = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/providers/performance?countryCode=${countryCode}`);
            setProviders(res.data.providers || []);
        } catch (e) {
            console.error('Performance load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadPerformance();
    }, [countryCode]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight mb-8">Behavioral Analytics Engine</h3>
                <div className="space-y-4">
                    {providers.length === 0 ? (
                        <div className="py-10 text-center text-neutral-400">No performance data.</div>
                    ) : (
                        providers.map((p, i) => (
                            <div key={i} className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 flex items-center justify-between group hover:border-brand-provider-green/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="text-center w-12">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase mb-1">Tier</p>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${p.tier === 'ELITE' ? 'bg-brand-provider-green/10 text-brand-provider-green border-brand-provider-green/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{p.tier}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-neutral-800 tracking-tight">{p.userId?.firstName} {p.userId?.lastName}</p>
                                        <p className="text-xs font-bold text-orange-500 uppercase">⭐ {p.rating?.toFixed(1) || '0.0'} / 5.0</p>
                                    </div>
                                </div>

                                <div className="flex gap-12 items-center">
                                    <MetricItem label="Acceptance" value={`${p.acceptanceRate || 0}%`} color="bg-green-500" width={p.acceptanceRate || 0} />
                                    <MetricItem label="Completion" value={`${p.completionRate || 0}%`} color="bg-blue-500" width={p.completionRate || 0} />
                                    <button className="p-3 bg-white rounded-2xl shadow-sm border border-neutral-100 hover:border-brand-provider-green transition-all"><ExternalLink size={18} className="text-neutral-400 group-hover:text-brand-provider-green transition-all" /></button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
            <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white shadow-2xl">
                <h3 className="font-black text-sm uppercase tracking-widest text-neutral-500 mb-8">Tier Matrix Benefits</h3>
                <div className="space-y-8">
                    <BenefitRow tier="Elite" benefit="5s Lead Time" />
                    <BenefitRow tier="Platinum" benefit="3s Lead Time" />
                    <BenefitRow tier="Gold" benefit="Standard Broadcast" />
                    <div className="h-px bg-white/10 mt-8"></div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mt-8">
                        <p className="text-[10px] text-neutral-400 font-bold leading-relaxed">System automates tier promotion every 30 days based on rolling metrics (Section 261).</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LifecycleTracker() {
    return (
        <div className="bg-white border border-neutral-200 rounded-[40px] p-12 shadow-sm flex flex-col items-center justify-center h-[600px] relative overflow-hidden">
            <div className="absolute inset-0 bg-neutral-50 opacity-20"></div>
            <div className="relative z-10 text-center max-w-2xl">
                <Activity size={48} className="mx-auto text-neutral-200 mb-6" />
                <h3 className="text-2xl font-black uppercase text-neutral-800 mb-4">Milestone State Tracker</h3>
                <p className="text-neutral-400 font-medium mb-12">Visualizing provider journeys from Registration through to Elite status and automated suspension recovery.</p>
                <div className="flex items-center gap-4 w-full">
                    <LifecycleStep label="Registration" active />
                    <LifecycleDivider />
                    <LifecycleStep label="Verification" active />
                    <LifecycleDivider />
                    <LifecycleStep label="Approval" />
                    <LifecycleDivider />
                    <LifecycleStep label="Operations" />
                </div>
            </div>
        </div>
    )
}

function MetricItem({ label, value, color, width }: { label: string, value: string, color: string, width: number }) {
    return (
        <div className="text-center w-24">
            <p className="text-[10px] font-black text-neutral-400 uppercase mb-2">{label}</p>
            <p className="text-lg font-black text-neutral-900 mb-2">{value}</p>
            <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div className={`${color} h-full rounded-full`} style={{ width: `${width}%` }}></div>
            </div>
        </div>
    )
}

function BenefitRow({ tier, benefit }: { tier: string, benefit: string }) {
    return (
        <div className="flex justify-between items-center">
            <p className="text-xs font-black uppercase tracking-tighter">{tier}</p>
            <span className="text-[10px] font-bold text-brand-provider-green bg-brand-provider-green/10 px-3 py-1 rounded-full border border-brand-provider-green/20">{benefit}</span>
        </div>
    )
}

function LifecycleStep({ label, active }: { label: string, active?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-4 h-4 rounded-full border-2 ${active ? 'bg-brand-provider-green border-brand-provider-green shadow-[0_0_10px_#006400]' : 'border-neutral-200'}`}></div>
            <p className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'text-neutral-800' : 'text-neutral-300'}`}>{label}</p>
        </div>
    )
}

function LifecycleDivider() {
    return <div className="flex-1 h-0.5 bg-neutral-100 rounded-full mb-6"></div>
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
