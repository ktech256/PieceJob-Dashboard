"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  ShieldAlert,
  Zap,
  MapPin,
  Smartphone,
  MessageSquareWarning,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  TrendingUp,
  Download,
  Filter,
  Eye,
  Activity,
  Gavel
} from 'lucide-react';

export default function FraudMonitoring() {
  const { countryCode } = useCountryStore();
  const [activeTab, setActiveTab] = useState("queue");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/fraud/alerts?countryCode=${countryCode}`);
        setAlerts(res.data.alerts || []);

        const analyticsRes = await api.get(`/api/admin/fraud/analytics?countryCode=${countryCode}`);
        setStats(analyticsRes.data.analytics);
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Fraud & Integrity Hub</h1>
          <p className="text-neutral-500 font-medium text-sm">Monitor platform abuse, GPS violations, and suspicious completion patterns.</p>
        </div>
        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-2xl border border-neutral-200 shadow-inner">
            <TabButton active={activeTab === "queue"} onClick={() => setActiveTab("queue")} label="Fake Completion" />
            <TabButton active={activeTab === "feed"} onClick={() => setActiveTab("feed")} label="FraudSense Feed" />
            <TabButton active={activeTab === "quali"} onClick={() => setActiveTab("quali")} label="QualiCheck NLP" />
            <TabButton active={activeTab === "gps"} onClick={() => setActiveTab("gps")} label="GPS Integrity" />
            <TabButton active={activeTab === "device"} onClick={() => setActiveTab("device")} label="Device Health" />
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Critical Alerts" value={stats?.criticalAlerts || 0} icon={<AlertTriangle className="text-red-600" />} color="border-red-100" />
          <StatCard label="Escrow On Hold" value={alerts.filter(a => a.riskType === 'FAKE_COMPLETION' && a.status === 'PENDING').length} icon={<Activity className="text-orange-600" />} color="border-orange-100" />
          <StatCard label="Confirmed Fraud" value={alerts.filter(a => a.status === 'APPROVED').length} icon={<Gavel className="text-neutral-900" />} color="border-neutral-200" />
          <StatCard label="Total Audit Events" value={stats?.totalAlerts || 0} icon={<History className="text-green-600" />} color="border-green-100" />
      </div>

      {activeTab === "queue" && <FakeCompletionQueue alerts={alerts.filter(a => a.riskType === 'FAKE_COMPLETION')} onRefresh={loadAlerts} />}
      {activeTab === "feed" && <FraudSenseFeed alerts={alerts} />}
      {activeTab === "quali" && <GenericFraudList alerts={alerts.filter(a => a.riskType.startsWith('QUALICHECK'))} title="QualiCheck NLP Violations" />}
      {activeTab === "gps" && <GenericFraudList alerts={alerts.filter(a => ['GPS_INTEGRITY', 'MOCK_GPS', 'IMPOSSIBLE_MOVEMENT'].includes(a.riskType))} title="GPS Integrity Monitor" />}
      {activeTab === "device" && <DeviceSecuritySettings />}
    </div>
  );
}

function DeviceSecuritySettings() {
    const { countryCode } = useCountryStore();
    const [settings, setSettings] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    const loadSettings = async () => {
        try {
            const res = await api.get('/api/admin/settings');
            setSettings(res.data.settings);
        } catch (e) {
            console.error('Failed to load settings');
        }
    };

    const toggleDeviceLock = async () => {
        setUpdating(true);
        try {
            const newVal = !settings.deviceLockEnabled;
            await api.post('/api/admin/settings', { deviceLockEnabled: newVal });
            setSettings({ ...settings, deviceLockEnabled: newVal });
        } catch (e) {
            alert('Failed to update security settings');
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, [countryCode]);

    return (
        <div className="space-y-8">
            <div className="bg-white border border-neutral-200 rounded-[32px] p-10 shadow-sm">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-800">Device Security Engine</h3>
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs mt-1">Hardware Binding & Multi-Account Prevention (Section 15.1)</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${settings?.deviceLockEnabled ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} font-black text-[10px] uppercase tracking-widest border border-current/10`}>
                        Status: {settings?.deviceLockEnabled ? 'Enforced' : 'Disabled'}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-[24px] border border-neutral-100">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-white rounded-xl shadow-sm"><Smartphone size={20} className="text-neutral-400" /></div>
                                <div>
                                    <p className="text-sm font-black text-neutral-800 uppercase tracking-tight">One-Device-Per-Account</p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">Strict Hardware Binding</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleDeviceLock}
                                disabled={updating}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings?.deviceLockEnabled ? 'bg-brand-customer-red' : 'bg-neutral-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.deviceLockEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <p className="text-xs text-neutral-400 font-medium leading-relaxed px-2">
                            When enabled, the platform automatically logs the Hardware ID and prevents providers from registering multiple accounts on the same physical phone.
                            <br/><br/>
                            <span className="text-amber-600 font-bold uppercase tracking-tighter italic">Warning: Disabling this check increases the risk of referral fraud and provider ghost accounts.</span>
                        </p>
                    </div>

                    <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert size={120} /></div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-neutral-500 mb-6">Security Context</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                                <span className="text-neutral-500">Hardware ID Spoof Detection</span>
                                <span className="text-green-500">Active</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase">
                                <span className="text-neutral-500">Root/Jailbreak Guard</span>
                                <span className="text-green-500">Active</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase">
                                <span className="text-neutral-500">VPN/Proxy Shadow Ban</span>
                                <span className="text-brand-customer-red animate-pulse">Enabled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function GenericFraudList({ alerts, title }: { alerts: any[], title: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-8 border-b bg-neutral-50/50">
                <h3 className="font-black text-lg uppercase tracking-tight">{title}</h3>
            </div>
            <div className="divide-y divide-neutral-50 font-bold">
                {alerts.length === 0 ? (
                    <div className="p-20 text-center text-neutral-300 uppercase text-xs">No incidents detected in this category.</div>
                ) : alerts.map(a => (
                    <div key={a._id} className="p-6 flex justify-between items-center hover:bg-neutral-50/50 transition-all group">
                         <div className="flex gap-6 items-center">
                            <div className={`p-4 rounded-2xl ${a.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-neutral-100'} ${a.severity === 'CRITICAL' ? 'text-white' : 'text-neutral-400'}`}>
                                {a.riskType.includes('GPS') ? <MapPin size={20} /> : a.riskType.includes('QUALI') ? <MessageSquareWarning size={20} /> : <Smartphone size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase text-neutral-900">{a.riskType.replace(/_/g, ' ')}</p>
                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">Ref: {a.fraudEventId} • Score: {a.riskScore}</p>
                                {a.riskType === 'IMPOSSIBLE_MOVEMENT' && <span className="text-[8px] font-black text-red-600 border border-red-100 px-2 py-0.5 rounded-full mt-1 inline-block uppercase tracking-tighter">Automatic Shadow Ban: 1h</span>}
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                            <div>
                                <p className="text-xs text-neutral-900">{new Date(a.createdAt).toLocaleDateString()}</p>
                                <p className="text-[10px] text-neutral-400 uppercase">{new Date(a.createdAt).toLocaleTimeString()}</p>
                            </div>
                            <button className="p-2 bg-neutral-900 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                <Eye size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function FakeCompletionQueue({ alerts, onRefresh }: { alerts: any[], onRefresh: () => void }) {
    const handleResolve = async (id: string, status: string) => {
        try {
            await api.patch(`/api/admin/fraud/alerts/${id}/resolve`, { status });
            onRefresh();
        } catch (e) {
            alert('Failed to resolve alert');
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-8 border-b bg-neutral-50/50 flex justify-between items-center">
                <div>
                    <h3 className="font-black text-lg uppercase tracking-tight">Suspicious Completion Queue</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Jobs completed under 50% of historical average</p>
                </div>
                <button onClick={onRefresh} className="p-2 hover:bg-white rounded-xl transition-all"><RefreshCcw size={16} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Incident / Job</th>
                            <th className="px-8 py-4">Provider</th>
                            <th className="px-8 py-4 text-center">Duration (Act/Exp)</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                        {alerts.length === 0 ? (
                            <tr><td colSpan={5} className="py-20 text-center text-neutral-300 uppercase text-xs">No pending completions to audit.</td></tr>
                        ) : alerts.map(a => (
                            <tr key={a._id} className="hover:bg-neutral-50/50 transition-all">
                                <td className="px-8 py-5">
                                    <p className="text-neutral-900">{a.fraudEventId}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">Job: {a.jobId?._id?.slice(-6)}</p>
                                </td>
                                <td className="px-8 py-5 text-neutral-600">
                                    {a.providerId?.userId?.firstName} {a.providerId?.userId?.lastName}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-red-600">{Math.round(a.evidence?.actualDurationMin)}m</span>
                                        <span className="text-[10px] text-neutral-400">vs {Math.round(a.evidence?.expectedDurationMin)}m</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${a.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{a.status}</span>
                                </td>
                                <td className="px-8 py-5 text-right space-x-2">
                                    {a.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleResolve(a._id, 'REJECTED')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] uppercase font-black hover:bg-green-700 transition-all shadow-lg shadow-green-600/20">Release Escrow</button>
                                            <button onClick={() => handleResolve(a._id, 'APPROVED')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] uppercase font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Confirm Fraud</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function FraudSenseFeed({ alerts }: { alerts: any[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#0A0A0A] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_#410200_0%,_transparent_60%)]"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Zap className="text-brand-customer-red" />
                            Live FraudSense™ Stream
                        </h3>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-white/10 rounded-xl transition-all"><Filter size={16} /></button>
                            <button className="p-2 hover:bg-white/10 rounded-xl transition-all"><Download size={16} /></button>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {alerts.map(a => (
                            <div key={a._id} className="bg-white/5 border border-white/10 p-6 rounded-[32px] hover:bg-white/10 transition-all flex items-center justify-between group">
                                <div className="flex gap-6 items-center">
                                    <div className={`p-4 rounded-2xl ${a.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-neutral-800'} text-white`}>
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-widest text-neutral-300">{a.riskType.replace(/_/g, ' ')}</p>
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1">
                                            {a.providerId ? `Provider: ${a.providerId.userId?.firstName} ${a.providerId.userId?.lastName}` : `User: ${a.userId?.firstName} ${a.userId?.lastName}`}
                                        </p>
                                        <p className="text-[10px] text-neutral-600 italic">"{a.evidence?.reason || a.evidence?.text || 'Telemetry violation'}"</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-white mb-1">{new Date(a.createdAt).toLocaleTimeString()}</p>
                                    <button className="opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black uppercase text-brand-customer-red flex items-center gap-1 ml-auto">
                                        Audit Case <Eye size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                        <TrendingUp size={14} /> Risk Distribution
                    </h4>
                    <div className="space-y-6">
                        <RiskBar label="Acceptance Integrity" score={92} />
                        <RiskBar label="GPS Fidelity" score={78} />
                        <RiskBar label="Financial Honesty" score={95} />
                        <RiskBar label="Referral Purity" score={64} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function RiskBar({ label, score }: { label: string, score: number }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-neutral-400">{label}</span>
                <span className={score > 80 ? 'text-green-600' : score > 50 ? 'text-orange-600' : 'text-red-600'}>{score}%</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${
                active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className={`bg-white p-6 rounded-[24px] border ${color} shadow-sm`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neutral-50 rounded-xl">{icon}</div>
                <div className="text-[9px] font-black text-neutral-400 border border-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Global</div>
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-neutral-900">{value}</p>
        </div>
    )
}
