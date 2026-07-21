"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import {
    X,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    MapPin,
    ShieldCheck,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Target
} from 'lucide-react';

export default function PartnerAnalyticsDetail({ partnerId, onClose }: { partnerId: string; onClose: () => void }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('performance');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/api/v1/affiliate/admin/${partnerId}/analytics`);
                setData(res.data.data);
            } catch (e) {
                console.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [partnerId]);

    if (loading) return (
        <div className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-[110] flex items-center justify-center p-8">
            <div className="bg-white rounded-[48px] w-full max-w-6xl h-[85vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-neutral-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Decrypting Performance Stream...</p>
            </div>
        </div>
    );

    if (!data) return null;

    const { partner, metrics, geoStats, monthlyTrend, referrals, recentTransactions } = data;

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 md:p-8 overflow-hidden animate-in fade-in duration-300">
            <div className="bg-[#F8F9FA] rounded-[40px] md:rounded-[56px] w-full max-w-7xl h-[95vh] md:h-[90vh] flex flex-col shadow-2xl border border-white/20 overflow-hidden text-neutral-900">

                {/* HEADER */}
                <div className="p-8 md:p-12 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-neutral-100">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-900 rounded-[28px] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-neutral-200">
                            {partner.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-900">{partner.name}</h2>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${partner.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {partner.status} Partner
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={12} /> ID: {partner._id.slice(-8).toUpperCase()}
                                </p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2 border-l border-neutral-200 pl-4">
                                    <Calendar size={12} /> Joined {new Date(partner.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2 border-l border-neutral-200 pl-4">
                                    <MapPin size={12} /> {partner.countryCode} • {partner.type}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                        <nav className="flex bg-neutral-100 p-1.5 rounded-2xl">
                           <button onClick={() => setActiveTab('performance')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'performance' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>Performance</button>
                           <button onClick={() => setActiveTab('referrals')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'referrals' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>Referral Ledger</button>
                        </nav>
                        <div className="flex gap-2">
                            <button className="p-4 bg-neutral-50 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all border border-neutral-100"><Download size={20} /></button>
                            <button onClick={onClose} className="p-4 bg-neutral-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg"><X size={20} /></button>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">

                    {activeTab === 'performance' && (
                        <>
                            {/* TOP METRICS MATRIX */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MetricCard
                                    title="Acquisition Volume"
                                    value={metrics.totalReferrals}
                                    sub="Total Referrals Generated"
                                    icon={<Users className="text-blue-600" />}
                                    trend="+12%"
                                />
                                <MetricCard
                                    title="Protocol Yield"
                                    value={`${metrics.earnings.total.toFixed(2)} R`}
                                    sub="Lifetime Earnings"
                                    icon={<DollarSign className="text-green-600" />}
                                    trend="+24%"
                                />
                                <MetricCard
                                    title="Conversion Delta"
                                    value={`${metrics.conversionRate.toFixed(1)}%`}
                                    sub="Lead Activation Success"
                                    icon={<Target className="text-brand-customer-red" />}
                                    trend="-2%"
                                />
                                <MetricCard
                                    title="Outstanding Balance"
                                    value={`${metrics.earnings.available.toFixed(2)} R`}
                                    sub="Ready for Settlement"
                                    icon={<TrendingUp className="text-orange-600" />}
                                    trend="Neutral"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* GROWTH TREND */}
                                <div className="lg:col-span-2 bg-white rounded-[48px] p-12 border border-neutral-100 shadow-sm space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Yield Velocity</p>
                                            <h3 className="text-2xl font-black mt-2">Revenue Trend</h3>
                                        </div>
                                    </div>

                                    <div className="h-64 w-full flex items-end gap-3 px-4">
                                        {monthlyTrend.map((m: any, i: number) => {
                                            const max = Math.max(...monthlyTrend.map((x: any) => x.amount), 1);
                                            const height = (m.amount / max) * 100;
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                                    <div className="w-full bg-neutral-50 rounded-2xl relative overflow-hidden flex flex-col justify-end" style={{ height: '200px' }}>
                                                        <div
                                                            className="bg-neutral-900 group-hover:bg-blue-600 transition-all duration-500 rounded-t-xl"
                                                            style={{ height: `${height}%` }}
                                                        ></div>
                                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[8px] font-black px-2 py-1 rounded">
                                                            {m.amount}R
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase text-neutral-400">{m._id.month}/{m._id.year.toString().slice(-2)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* GEO PENETRATION */}
                                <div className="bg-neutral-900 rounded-[40px] p-10 text-white flex flex-col gap-8 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 italic">Geographic Oracle</h3>
                                        <p className="text-2xl font-black mt-2">Province Coverage</p>
                                    </div>

                                    <div className="space-y-4 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                        {geoStats.map((s: any) => {
                                            const percent = (s.count / metrics.totalReferrals) * 100;
                                            return (
                                                <div key={s._id} className="space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                                        <span className="text-white/60">{s._id || 'Unassigned Cluster'}</span>
                                                        <span>{s.count} Leads</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-all duration-700"></div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'referrals' && (
                        <div className="bg-white rounded-[48px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/30">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900 italic">Enterprise Referral performance Ledger</h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase border border-blue-100">
                                        <Users size={12} /> {referrals.length} Total Signals
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[9px] font-black uppercase text-neutral-400 bg-neutral-50/50">
                                            <th className="px-10 py-6">Referred Participant</th>
                                            <th className="px-10 py-6">Lifecycle Metrics</th>
                                            <th className="px-10 py-6">Revenue Attribution</th>
                                            <th className="px-10 py-6">Commission Yield</th>
                                            <th className="px-10 py-6 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] font-bold uppercase">
                                        {referrals.map((r: any) => {
                                            const ageDays = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                                            return (
                                                <tr key={r.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/30 transition-colors">
                                                    <td className="px-10 py-6 flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-black text-base shadow-lg">
                                                            {r.user.firstName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-neutral-900 text-xs font-black">{r.user.firstName} {r.user.lastName}</p>
                                                            <p className="text-[8px] text-neutral-400 lowercase">{r.user.role} • Joined {ageDays}d ago</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="space-y-1">
                                                            <p className="text-neutral-900">{r.completedJobs} Jobs Completed</p>
                                                            <p className="text-[8px] text-neutral-400">{r.rewardedJobs} Rewards Claimed</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="space-y-1">
                                                            <p className="text-green-600 font-black">{r.commission.toFixed(2)} R Paid</p>
                                                            <p className="text-[8px] text-neutral-400">{Math.max(0, (r.maxRewards || 5) - r.rewardedJobs)} Rewards Remaining</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="space-y-1">
                                                            <p className="text-blue-600 font-black">{r.revenue.toFixed(2)} R</p>
                                                            <p className="text-[8px] text-neutral-400 uppercase">Platform Revenue</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black ${r.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, sub, icon, trend }: any) {
    return (
        <div className="bg-white p-8 rounded-[36px] border border-neutral-100 shadow-sm flex flex-col gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${trend.includes('+') ? 'text-green-600' : 'text-neutral-400'}`}>
                    {trend} {trend.includes('+') ? <ArrowUpRight size={12} /> : ''}
                </div>
            </div>
            <div>
                <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">{title}</p>
                <p className="text-2xl font-black text-neutral-900 mt-1">{value}</p>
                <p className="text-[8px] text-neutral-400 font-bold uppercase mt-2">{sub}</p>
            </div>
        </div>
    )
}
