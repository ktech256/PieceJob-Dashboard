"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import {
  Settings2,
  Users,
  Gift,
  ShieldAlert,
  Clock,
  Calendar,
  BarChart3,
  Search,
  Filter,
  RefreshCcw,
  Ban,
  CheckCircle2,
  XCircle,
  Copy,
  QrCode,
  Globe,
  ArrowRight,
  ChevronRight,
  Eye,
  Undo,
  RotateCcw,
  Send,
  UserPlus,
  Target,
  PlayCircle
} from 'lucide-react';

export default function ReferralManagementCentre({ countryCode, currencySymbol }: { countryCode: string, currencySymbol: string }) {
    const [activeTab, setActiveTab] = useState("analytics");
    const [settings, setSettings] = useState<any>(null);
    const [rewards, setRewards] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Filters for Oracle
    const [filters, setFilters] = useState({
        status: "",
        search: "",
        startDate: "",
        endDate: ""
    });

    const [selectedReward, setSelectedReward] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [setRes, anaRes] = await Promise.all([
                api.get(`/api/admin/settings?countryCode=${countryCode}`),
                api.get(`/api/admin/finance/referrals/analytics?countryCode=${countryCode}`)
            ]);
            setSettings(setRes.data.settings);
            setAnalytics(anaRes.data.data);
            loadRewards();
        } catch (e) {
            console.error('Failed to load referral management data');
        } finally {
            setLoading(false);
        }
    };

    const loadRewards = async () => {
        try {
            let url = `/api/admin/finance/referrals?countryCode=${countryCode}`;
            if (filters.status) url += `&status=${filters.status}`;
            if (filters.search) url += `&search=${filters.search}`;
            if (filters.startDate) url += `&startDate=${filters.startDate}`;
            if (filters.endDate) url += `&endDate=${filters.endDate}`;

            const res = await api.get(url);
            setRewards(res.data.data || []);
        } catch (e) {
            console.error("Failed to load rewards");
        }
    };

    useEffect(() => {
        if (countryCode) fetchData();
    }, [countryCode]);

    useEffect(() => {
        if (countryCode && activeTab === 'rewards') loadRewards();
    }, [filters]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await api.post(`/api/admin/settings`, { ...settings, countryCode });
            alert("Referral Protocol Optimized and Deployed.");
        } catch (e) {
            alert("Failed to deploy changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleAction = async (action: string, id: string, extra: any = {}) => {
        if (!confirm(`Execute ${action} signal for this reward?`)) return;
        try {
            await api.post(`/api/admin/finance/referrals/${action}`, { rewardId: id, ...extra });
            alert(`${action} successful`);
            loadRewards();
            if (showDetailsModal) fetchDetails(id);
        } catch (e: any) {
            alert(e.response?.data?.message || "Action failed");
        }
    };

    const [detailsData, setDetailsData] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchDetails = async (id: string) => {
        setLoadingDetails(true);
        try {
            const res = await api.get(`/api/admin/finance/referrals/${id}`);
            setDetailsData(res.data.data);
        } catch (e) {
            console.error("Failed to fetch details");
        } finally {
            setLoadingDetails(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-neutral-900">
            {/* SUB-TABS */}
            <div className="flex gap-4 border-b border-neutral-100 pb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> },
                    { id: 'rewards', label: 'Reward Oracle', icon: <Gift size={14} /> },
                    { id: 'settings', label: 'Program Control', icon: <Settings2 size={14} /> },
                    { id: 'fraud', label: 'Fraud Matrix', icon: <ShieldAlert size={14} /> },
                    { id: 'test', label: 'Test Centre', icon: <PlayCircle size={14} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab.id ? 'bg-neutral-900 text-white shadow-lg' : 'bg-white text-neutral-400 border border-neutral-200 hover:bg-neutral-50'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'analytics' && analytics && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnalyticCard label="Total Referrals" value={analytics.totalReferrals} sub="All registrations" color="blue" />
                        <AnalyticCard label="Successful" value={analytics.successfulReferrals} sub="Reward triggered" color="green" />
                        <AnalyticCard label="Pending" value={analytics.pendingReferrals} sub="In queue" color="amber" />
                        <AnalyticCard label="Rejected" value={analytics.rejectedReferrals} sub="Eligibility failed" color="red" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnalyticCard label="Fraud Attempts" value={analytics.fraudAttempts} sub="Policy violations" color="red" />
                        <AnalyticCard label="Total Value" value={`${currencySymbol}${analytics.rewardsIssued.toLocaleString()}`} sub="Paid rewards" color="indigo" />
                        <AnalyticCard label="Average Reward" value={`${currencySymbol}${analytics.averageReward.toFixed(2)}`} sub="Per success" color="purple" />
                        <AnalyticCard label="Conversion" value={`${analytics.conversionRate.toFixed(1)}%`} sub="Registration velocity" color="emerald" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-[40px] p-10">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Top Referral Entities</h3>
                            <div className="space-y-4">
                                {(analytics?.topReferrers || []).map((ref:any, i:number) => (
                                    <div key={i} className="flex justify-between items-center p-6 bg-neutral-50 rounded-3xl hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200">
                                        <div className="flex items-center gap-6">
                                            <span className="text-lg font-black text-neutral-300 w-6">0{i+1}</span>
                                            <div>
                                                <p className="font-black text-sm uppercase">{ref.name}</p>
                                                <p className="text-[10px] font-bold text-neutral-400 mt-1">{ref.role} • {ref.workspace} SECTOR</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-indigo-600">{ref.totalReferrals}</p>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Conversions</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-neutral-900 rounded-[40px] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                 <BarChart3 className="text-brand-customer-red mb-8" size={48} />
                                 <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight">Channel Segmentation</h4>
                                 <div className="space-y-6 mt-10">
                                     <div className="flex justify-between items-end">
                                         <div>
                                             <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Customer Driven</p>
                                             <p className="text-2xl font-black">{analytics.customerReferrals}</p>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Provider Driven</p>
                                             <p className="text-2xl font-black">{analytics.providerReferrals}</p>
                                         </div>
                                     </div>
                                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                         <div className="h-full bg-brand-customer-red" style={{ width: `${(analytics.customerReferrals / (analytics.totalReferrals || 1)) * 100}%` }}></div>
                                         <div className="h-full bg-brand-provider-green" style={{ width: `${(analytics.providerReferrals / (analytics.totalReferrals || 1)) * 100}%` }}></div>
                                     </div>
                                 </div>
                            </div>
                            <div className="relative z-10 mt-12">
                                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Workspace Velocity Rank</p>
                                <p className="text-xs font-bold text-white uppercase mt-2">1. {countryCode} sector</p>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-customer-red/20 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && settings && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-[#121212] rounded-[40px] p-10 text-white border border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Referral Program Master Switch</h3>
                                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-1">Workspace Node: {countryCode}</p>
                            </div>
                            <button
                                onClick={() => setSettings({...settings, referralProgramEnabled: !settings.referralProgramEnabled})}
                                className={`w-16 h-9 rounded-full transition-all relative ${settings.referralProgramEnabled ? 'bg-brand-provider-green' : 'bg-neutral-700'}`}
                            >
                                <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-md ${settings.referralProgramEnabled ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-[40px] p-10 space-y-10">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-8 border-l-4 border-neutral-900 pl-4">Economic Model</h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <InputItem label="Reward Yield" value={settings.referralRewardAmount} onChange={(v:any) => setSettings({...settings, referralRewardAmount: parseFloat(v)})} sub={currencySymbol} />
                                    <InputItem label="Reward Type" type="select" value={settings.referralRewardType} options={['CASH', 'WALLET_CREDIT', 'REFERRAL_BALANCE']} onChange={(v:any) => setSettings({...settings, referralRewardType: v})} />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-8 border-l-4 border-neutral-900 pl-4">Qualification Rules</h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <InputItem label="Min Completed Jobs" value={settings.referralMinCompletedJobs || 1} onChange={(v:any) => setSettings({...settings, referralMinCompletedJobs: parseInt(v)})} />
                                    <InputItem label="Max Rewards / User" value={settings.referralMaxRewardsPerUser || 5} onChange={(v:any) => setSettings({...settings, referralMaxRewardsPerUser: parseInt(v)})} />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-8 border-l-4 border-neutral-900 pl-4">Retention & Validity</h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <InputItem label="Payout Delay (Days)" value={settings.referralRewardDelayDays || 0} onChange={(v:any) => setSettings({...settings, referralRewardDelayDays: parseInt(v)})} icon={<Clock size={14} />} />
                                    <InputItem label="Referral Expiry (Days)" value={settings.referralExpiryDays || 0} onChange={(v:any) => setSettings({...settings, referralExpiryDays: parseInt(v)})} icon={<Calendar size={14} />} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-neutral-50 rounded-[40px] p-8 border border-neutral-200 space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-6">Discovery branding</h4>
                                <div className="space-y-4">
                                    <InputItem label="Base URL" value={settings.referralBaseUrl} onChange={(v:any) => setSettings({...settings, referralBaseUrl: v})} icon={<Globe size={14} />} />
                                    <InputItem label="QR Logo Overlay" type="select" value={settings.referralQrBranding || 'PIECEJOB'} options={['PIECEJOB', 'WORKSPACE', 'NONE']} icon={<QrCode size={14} />} onChange={(v:any) => setSettings({...settings, referralQrBranding: v})} />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="w-full bg-neutral-900 text-white py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                {saving ? 'Persisting Protocol...' : 'Deploy Global Config'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'rewards' && (
                <div className="bg-white border border-neutral-200 rounded-[40px] overflow-hidden shadow-sm">
                    <div className="p-10 border-b border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Referral Reward Oracle</h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Audit log of issued rewards and eligibility</p>
                        </div>
                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            <select
                                value={filters.status}
                                onChange={e => setFilters({...filters, status: e.target.value})}
                                className="bg-white border border-neutral-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="QUALIFIED">Qualified</option>
                                <option value="REWARDED">Rewarded</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="REVERSED">Reversed</option>
                            </select>
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search Entity..."
                                    value={filters.search}
                                    onChange={e => setFilters({...filters, search: e.target.value})}
                                    className="w-full pl-11 pr-5 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-900 transition-all shadow-inner"
                                />
                            </div>
                            <button onClick={() => loadRewards()} className="p-3 bg-white border border-neutral-200 text-neutral-400 rounded-xl hover:text-neutral-900 transition-all shadow-sm"><RefreshCcw size={16} /></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                                <tr>
                                    <th className="px-10 py-5">Referrer</th>
                                    <th className="px-10 py-5">Target Node (Referred)</th>
                                    <th className="px-10 py-5">Context</th>
                                    <th className="px-10 py-5 text-right">Yield</th>
                                    <th className="px-10 py-5 text-center">Status</th>
                                    <th className="px-10 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {rewards.map((r) => (
                                    <tr key={r._id} className="hover:bg-neutral-50/50 transition-all group">
                                        <td className="px-10 py-6">
                                            <p className="font-black text-neutral-800 text-xs uppercase">{r.referrerId?.firstName} {r.referrerId?.lastName}</p>
                                            <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase">{r.referrerId?.role}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="font-bold text-neutral-700 text-xs uppercase">{r.referredId?.firstName} {r.referredId?.lastName}</p>
                                            <p className="text-[10px] text-neutral-400 mt-1 uppercase">Node Sector: {r.referredId?.countryCode}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-xs font-bold text-blue-600 font-mono">#{r.jobId?._id?.slice(-8).toUpperCase() || 'MANUAL'}</p>
                                            <p className="text-[10px] text-neutral-400 mt-1">{r.jobId?.serviceName || 'N/A'}</p>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <p className="font-black text-neutral-900 text-sm">{currencySymbol}{r.amount.toFixed(2)}</p>
                                            <p className="text-[8px] font-black text-neutral-400 uppercase">{r.rewardType?.replace('_', ' ')}</p>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${
                                                r.status === 'REWARDED' ? 'bg-green-100 text-green-700' :
                                                r.status === 'PENDING' || r.status === 'QUALIFIED' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>{r.status}</span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setSelectedReward(r); fetchDetails(r._id); setShowDetailsModal(true); }} className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-900 hover:text-white transition-all shadow-sm"><Eye size={14} /></button>
                                                {r.status === 'QUALIFIED' && (
                                                    <button onClick={() => handleAction('approve', r._id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"><CheckCircle2 size={14} /></button>
                                                )}
                                                {r.status === 'REWARDED' && (
                                                    <button onClick={() => handleAction('reverse', r._id, { reason: 'Admin Reversal' })} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all shadow-sm" title="Reverse Payout"><Undo size={14} /></button>
                                                )}
                                                {(r.status === 'PENDING' || r.status === 'QUALIFIED') && (
                                                    <button onClick={() => handleAction('reject', r._id, { reason: 'Eligibility violation' })} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"><XCircle size={14} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'fraud' && (
                <div className="bg-white border border-neutral-200 rounded-[40px] p-12 space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><ShieldAlert size={32} /></div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Fraud Protection Matrix</h3>
                            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Multi-Layer Collision Detection Protocol</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FraudItem
                            label="Duplicate Phone detection"
                            desc="Prevents multiple accounts using same verified phone number."
                            enabled={settings.referralFraudDuplicatePhoneEnabled}
                            onToggle={() => setSettings({...settings, referralFraudDuplicatePhoneEnabled: !settings.referralFraudDuplicatePhoneEnabled})}
                        />
                        <FraudItem
                            label="Duplicate email detection"
                            desc="Flags referrals with shared or pattern-matched emails."
                            enabled={settings.referralFraudDuplicateEmailEnabled}
                            onToggle={() => setSettings({...settings, referralFraudDuplicateEmailEnabled: !settings.referralFraudDuplicateEmailEnabled})}
                        />
                        <FraudItem
                            label="Hardware signature lock"
                            desc="Blocks multiple registrations from the same physical device ID."
                            enabled={settings.referralFraudHardwareDetectionEnabled}
                            onToggle={() => setSettings({...settings, referralFraudHardwareDetectionEnabled: !settings.referralFraudHardwareDetectionEnabled})}
                        />
                        <FraudItem
                            label="Circular referral trap"
                            desc="Detects and invalidates A-B-A referral chains."
                            enabled={settings.referralFraudCircularDetectionEnabled}
                            onToggle={() => setSettings({...settings, referralFraudCircularDetectionEnabled: !settings.referralFraudCircularDetectionEnabled})}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="bg-white border border-neutral-200 rounded-[40px] overflow-hidden shadow-sm">
                    <div className="p-10 border-b border-neutral-100 bg-neutral-50/50">
                        <h3 className="text-xl font-black uppercase tracking-tight">Referral Leaderboard</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Top performing acquisition nodes in {countryCode} sector</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                                <tr>
                                    <th className="px-10 py-5">Rank</th>
                                    <th className="px-10 py-5">Node Name</th>
                                    <th className="px-10 py-5">Role</th>
                                    <th className="px-10 py-5 text-right">Total</th>
                                    <th className="px-10 py-5 text-right">Qualified</th>
                                    <th className="px-10 py-5 text-right">Pending</th>
                                    <th className="px-10 py-5 text-right">Rewards</th>
                                    <th className="px-10 py-5 text-right">Last Signal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {(analytics?.topReferrers || []).map((ref:any, i:number) => (
                                    <tr key={i} className="hover:bg-neutral-50/50 transition-all group">
                                        <td className="px-10 py-6 font-black text-neutral-300">0{i+1}</td>
                                        <td className="px-10 py-6">
                                            <p className="font-black text-neutral-800 text-xs uppercase">{ref.name}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-1 rounded-md uppercase border border-blue-100">{ref.role}</span>
                                        </td>
                                        <td className="px-10 py-6 text-right font-bold text-neutral-900">{ref.totalReferrals}</td>
                                        <td className="px-10 py-6 text-right font-bold text-green-600">{ref.qualified}</td>
                                        <td className="px-10 py-6 text-right font-bold text-amber-600">{ref.pending}</td>
                                        <td className="px-10 py-6 text-right font-black text-indigo-600">{currencySymbol}{ref.rewardsEarned.toFixed(2)}</td>
                                        <td className="px-10 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-tighter">
                                            {new Date(ref.lastReferral).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'test' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ReferralTestCentre countryCode={countryCode} currencySymbol={currencySymbol} />
                    <div className="bg-neutral-50 rounded-[40px] p-12 border border-neutral-200">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Simulation Logic</h3>
                        <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                            The Test Centre allows you to simulate entire referral lifecycles without impacting production financial records or sending real notifications to actual users. Use this to verify your Reward Yields, Payout Delays and Fraud settings before global deployment.
                        </p>
                    </div>
                </div>
            )}

            {showDetailsModal && detailsData && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-8 overflow-y-auto">
                    <div className="bg-white rounded-[56px] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-12 border-b flex justify-between items-center bg-neutral-50/50">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Referral Case Audit</h3>
                                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mt-1">Reward ID: {detailsData.reward._id}</p>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="p-4 hover:bg-neutral-100 rounded-full transition-colors"><XCircle size={32} className="text-neutral-300" /></button>
                        </div>

                        <div className="p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* PARTICIPANT OVERVIEW */}
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-6">Referrer Node</h4>
                                    <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100">
                                        <p className="font-black text-sm uppercase">{detailsData.reward.referrerId.firstName} {detailsData.reward.referrerId.lastName}</p>
                                        <p className="text-[10px] font-bold text-neutral-500 mt-1">{detailsData.reward.referrerId.email}</p>
                                        <div className="flex gap-2 mt-4">
                                            <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-1 rounded-md uppercase">{detailsData.reward.referrerId.role}</span>
                                            <span className="bg-neutral-900 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase">{detailsData.reward.record?.referralCode || detailsData.reward.referrerId.referralCode}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center py-4"><ArrowRight className="text-neutral-200" /></div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-6">Target Node (Referred)</h4>
                                    <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100">
                                        <p className="font-black text-sm uppercase text-indigo-900">{detailsData.reward.referredId.firstName} {detailsData.reward.referredId.lastName}</p>
                                        <p className="text-[10px] font-bold text-indigo-500 mt-1">{detailsData.reward.referredId.email}</p>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 mt-4 tracking-tighter">Joined: {new Date(detailsData.reward.referredId.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* LIFECYCLE & FINANCIALS */}
                            <div className="lg:col-span-2 space-y-12">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <MiniStat label="Jobs Completed" value={detailsData.record?.jobsCompletedCount || 0} />
                                    <MiniStat label="Rewards Issued" value={detailsData.record?.rewardsIssuedCount || 0} />
                                    <MiniStat label="Reward Amount" value={`${currencySymbol}${detailsData.reward.amount}`} highlight="indigo" />
                                    <MiniStat label="Status" value={detailsData.reward.status} highlight={detailsData.reward.status === 'REWARDED' ? 'green' : 'amber'} />
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest border-b pb-4">Authorized Manual Actions</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {detailsData.reward.status !== 'REWARDED' && (
                                            <ActionButton label="Approve Reward" icon={<CheckCircle2 size={14} />} color="green" onClick={() => handleAction('approve', detailsData.reward._id)} />
                                        )}
                                        {detailsData.reward.status === 'REWARDED' && (
                                            <ActionButton label="Reverse Reward" icon={<Undo size={14} />} color="orange" onClick={() => handleAction('reverse', detailsData.reward._id, { reason: 'Audit Reversal' })} />
                                        )}
                                        {(detailsData.reward.status === 'PENDING' || detailsData.reward.status === 'QUALIFIED') && (
                                            <ActionButton label="Reject Reward" icon={<XCircle size={14} />} color="red" onClick={() => handleAction('reject', detailsData.reward._id, { reason: 'Eligibility failed' })} />
                                        )}
                                        <ActionButton label="Recalculate Eligibility" icon={<RotateCcw size={14} />} color="neutral" onClick={() => handleAction('recalculate', detailsData.reward.jobId?._id)} />
                                        <ActionButton label="Generate New Code" icon={<RotateCcw size={14} />} color="neutral" onClick={() => handleAction('generate-code', detailsData.reward.referrerId._id)} />
                                        <ActionButton label="Deactivate Code" icon={<Ban size={14} />} color="red" onClick={() => handleAction('deactivate-code', detailsData.reward.referrerId._id)} />
                                        <ActionButton label="Resend Notification" icon={<Send size={14} />} color="blue" onClick={() => handleAction('resend-notification', detailsData.reward._id)} />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                     <div>
                                        <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-4">Financial Ledger Impact</h4>
                                        <div className="bg-neutral-50 rounded-3xl overflow-hidden border border-neutral-100 max-h-40 overflow-y-auto">
                                            <table className="w-full text-left text-[10px] font-bold">
                                                <thead className="bg-neutral-100 text-neutral-400 font-black uppercase border-b">
                                                    <tr>
                                                        <th className="p-3">Reference</th>
                                                        <th className="p-3">Type</th>
                                                        <th className="p-3 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {detailsData.ledgerEntries.map((l:any) => (
                                                        <tr key={l._id}>
                                                            <td className="p-3 font-mono">{l.transactionId.slice(-8)}</td>
                                                            <td className="p-3 uppercase">{l.type}</td>
                                                            <td className={`p-3 text-right ${l.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{l.amount.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                     </div>

                                     <div>
                                        <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-4">Notification Trace</h4>
                                        <div className="space-y-3">
                                            {detailsData.notifications.map((n:any) => (
                                                <div key={n._id} className="flex gap-4 items-start p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Send size={12} /></div>
                                                    <div>
                                                        <p className="font-black text-[10px] uppercase text-neutral-800">{n.title}</p>
                                                        <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed italic">"{n.body}"</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AnalyticCard({ label, value, sub, color }: any) {
    const colors: any = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      green: "bg-green-50 text-green-600 border-green-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      red: "bg-red-50 text-red-600 border-red-100",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
    };
    return (
      <div className={`p-8 rounded-[40px] border ${colors[color]} shadow-sm hover:shadow-md transition-all group`}>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
        <h3 className="text-4xl font-black mt-3 group-hover:scale-105 transition-transform origin-left">{value || '0'}</h3>
        <p className="text-[10px] font-bold uppercase mt-1 opacity-50">{sub}</p>
      </div>
    );
}

function InputItem({ label, value, sub, onChange, type = 'text', options = [], disabled = false, icon }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1 flex items-center gap-2">
                {icon} {label}
            </label>
            <div className="relative group">
                {sub && (
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 font-black text-xs z-10">{sub}</span>
                )}
                {type === 'select' ? (
                    <select
                        value={value}
                        onChange={e => onChange && onChange(e.target.value)}
                        disabled={disabled}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all appearance-none cursor-pointer"
                    >
                        {options.map((opt:string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={e => onChange && onChange(e.target.value)}
                        disabled={disabled}
                        className={`w-full bg-neutral-50 border border-neutral-100 rounded-2xl ${sub ? 'pl-10' : 'px-6'} py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all ${disabled ? 'opacity-50' : ''}`}
                    />
                )}
                {type === 'select' && (
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 rotate-90" size={14} />
                )}
            </div>
        </div>
    );
}

function FraudItem({ label, desc, enabled, onToggle }: any) {
    return (
        <div className="p-10 bg-neutral-50 rounded-[40px] border border-neutral-100 flex justify-between items-center group hover:bg-white hover:border-neutral-200 transition-all">
            <div className="space-y-2 pr-6">
                <p className="text-sm font-black uppercase text-neutral-900">{label}</p>
                <p className="text-[11px] text-neutral-400 font-bold leading-relaxed">{desc}</p>
            </div>
            <button
                onClick={onToggle}
                className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${enabled ? 'bg-neutral-900' : 'bg-neutral-300'}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${enabled ? 'right-1' : 'left-1'}`}></div>
            </button>
        </div>
    );
}

function MiniStat({ label, value, highlight }: any) {
    const colors: any = {
        indigo: "text-indigo-600",
        green: "text-green-600",
        amber: "text-amber-600",
        neutral: "text-neutral-900"
    };
    return (
        <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
            <p className={`text-xl font-black mt-2 uppercase ${colors[highlight || 'neutral']}`}>{value}</p>
        </div>
    );
}

function ActionButton({ label, icon, color, onClick }: any) {
    const colors: any = {
        green: "bg-green-600 text-white hover:bg-green-700",
        red: "bg-red-600 text-white hover:bg-red-700",
        blue: "bg-blue-600 text-white hover:bg-blue-700",
        orange: "bg-orange-600 text-white hover:bg-orange-700",
        neutral: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
    };
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${colors[color]}`}
        >
            {icon} {label}
        </button>
    );
}

function ReferralTestCentre({ countryCode, currencySymbol }: any) {
    const [referrerSearch, setReferrerSearch] = useState("");
    const [referredSearch, setReferredSearch] = useState("");
    const [referrers, setReferrers] = useState<any[]>([]);
    const [referredUsers, setReferredUsers] = useState<any[]>([]);

    const [selectedReferrer, setSelectedReferrer] = useState<any>(null);
    const [selectedReferred, setSelectedReferred] = useState<any>(null);

    const [simStage, setSimStage] = useState("REGISTRATION"); // REGISTRATION, JOB_COMPLETION
    const [simResult, setSimResult] = useState<any>(null);
    const [simulating, setSimulating] = useState(false);

    const searchUsers = async (q: string, setFn: any) => {
        if (q.length < 3) return;
        const res = await api.get(`/api/admin/users?search=${q}&countryCode=${countryCode}`);
        setFn(res.data.data || []);
    };

    const runSimulation = async () => {
        if (!selectedReferrer || !selectedReferred) return alert("Select participants");
        setSimulating(true);
        try {
            const res = await api.post(`/api/admin/finance/referrals/simulate`, {
                referrerId: selectedReferrer._id,
                referredId: selectedReferred._id,
                stage: simStage
            });
            setSimResult(res.data);
        } catch (e: any) {
            alert(e.response?.data?.message || "Simulation failed");
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-[40px] p-10 space-y-10 shadow-xl">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Target size={32} /></div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Referral Test Centre</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Protocol validation Sandbox</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase text-neutral-400">Referrer Simulation Target</label>
                    <input type="text" placeholder="Search Email/Name..." value={referrerSearch} onChange={e => { setReferrerSearch(e.target.value); searchUsers(e.target.value, setReferrers); }} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs font-black uppercase" />
                    {referrers.length > 0 && !selectedReferrer && (
                        <div className="bg-white border rounded-2xl shadow-xl max-h-40 overflow-y-auto">
                            {referrers.map(u => (
                                <button key={u._id} onClick={() => setSelectedReferrer(u)} className="w-full text-left p-3 hover:bg-neutral-50 text-[10px] font-bold border-b">{u.firstName} {u.lastName} ({u.email})</button>
                            ))}
                        </div>
                    )}
                    {selectedReferrer && (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex justify-between items-center">
                            <p className="text-[10px] font-black uppercase text-green-700">{selectedReferrer.firstName}</p>
                            <button onClick={() => setSelectedReferrer(null)} className="text-neutral-400 hover:text-red-500"><XCircle size={14} /></button>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase text-neutral-400">Referred User Simulation Target</label>
                    <input type="text" placeholder="Search Email/Name..." value={referredSearch} onChange={e => { setReferredSearch(e.target.value); searchUsers(e.target.value, setReferredUsers); }} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs font-black uppercase" />
                    {referredUsers.length > 0 && !selectedReferred && (
                        <div className="bg-white border rounded-2xl shadow-xl max-h-40 overflow-y-auto">
                            {referredUsers.map(u => (
                                <button key={u._id} onClick={() => setSelectedReferred(u)} className="w-full text-left p-3 hover:bg-neutral-50 text-[10px] font-bold border-b">{u.firstName} {u.lastName} ({u.email})</button>
                            ))}
                        </div>
                    )}
                    {selectedReferred && (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-center">
                            <p className="text-[10px] font-black uppercase text-blue-700">{selectedReferred.firstName}</p>
                            <button onClick={() => setSelectedReferred(null)} className="text-neutral-400 hover:text-red-500"><XCircle size={14} /></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 border-t pt-10">
                <button
                    onClick={() => setSimStage('REGISTRATION')}
                    className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${simStage === 'REGISTRATION' ? 'bg-neutral-900 text-white shadow-xl' : 'bg-neutral-100 text-neutral-400'}`}
                >
                    Simulate Registration
                </button>
                <button
                    onClick={() => setSimStage('JOB_COMPLETION')}
                    className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${simStage === 'JOB_COMPLETION' ? 'bg-neutral-900 text-white shadow-xl' : 'bg-neutral-100 text-neutral-400'}`}
                >
                    Simulate Job Completion
                </button>
            </div>

            <button
                onClick={runSimulation}
                disabled={simulating || !selectedReferrer || !selectedReferred}
                className="w-full bg-brand-customer-red text-white py-6 rounded-[32px] text-[12px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-red-900/20 disabled:opacity-50"
            >
                {simulating ? 'Synchronizing Cryptographic Logic...' : 'Initiate Simulation Authorized'}
            </button>

            {simResult && (
                <div className="p-8 bg-neutral-900 rounded-[32px] border border-white/5 animate-in slide-in-from-top-4">
                    <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-6 flex items-center gap-3">
                        <CheckCircle2 size={14} className="text-brand-provider-green" />
                        Simulation result: {simResult.success ? 'OPTIMAL' : 'REJECTED'}
                    </p>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs font-bold text-white leading-relaxed italic">"{simResult.message}"</p>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                            <p className="text-[8px] font-black uppercase text-neutral-500">Wallet Impact</p>
                            <p className="text-xs font-black text-emerald-400 mt-1">{simResult.qualificationCheck !== false ? 'Positive' : 'None'}</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                            <p className="text-[8px] font-black uppercase text-neutral-500">Ledger Entry</p>
                            <p className="text-xs font-black text-indigo-400 mt-1">{simResult.qualificationCheck !== false ? 'Generated' : 'None'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
