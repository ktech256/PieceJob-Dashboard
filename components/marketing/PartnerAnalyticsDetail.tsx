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

    const { partner, metrics, geoStats, monthlyTrend, recentReferrals, recentTransactions } = data;

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 md:p-8 overflow-hidden animate-in fade-in duration-300">
            <div className="bg-[#F8F9FA] rounded-[40px] md:rounded-[56px] w-full max-w-7xl h-[95vh] md:h-[90vh] flex flex-col shadow-2xl border border-white/20 overflow-hidden">

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

                    <div className="flex gap-4 self-end md:self-auto">
                        <button className="p-4 bg-neutral-50 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all border border-neutral-100"><Download size={20} /></button>
                        <button onClick={onClose} className="p-4 bg-neutral-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg"><X size={20} /></button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">

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
                        {/* RECENT ACQUISITIONS (Stream) */}
                        <div className="lg:col-span-2 bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/30">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">Real-time Acquisition Stream</h3>
                                <button className="text-[9px] font-black uppercase text-blue-600 hover:underline">Explore Full Log</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[9px] font-black uppercase text-neutral-400 bg-neutral-50/50">
                                            <th className="px-8 py-5">User Signature</th>
                                            <th className="px-8 py-5">Activity Metrics</th>
                                            <th className="px-8 py-5">Commission Yield</th>
                                            <th className="px-8 py-5 text-right">Referral age</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] font-bold uppercase">
                                        {recentReferrals.map((r: any) => {
                                            const ageDays = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                                            return (
                                                <tr key={r._id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/30 transition-colors">
                                                    <td className="px-8 py-5 flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-black">
                                                            {r.referredId.firstName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-neutral-900">{r.referredId.firstName} {r.referredId.lastName}</p>
                                                            <p className="text-[8px] text-neutral-400 lowercase">{r.referredId.role} • {r.referredId.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="space-y-1">
                                                            <p className="text-neutral-900">{r.jobsCompletedCount} Jobs Completed</p>
                                                            <p className="text-[8px] text-neutral-400">Total Spend: {r.totalSpend?.toFixed(2) || 0} R</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="space-y-1">
                                                            <p className="text-green-600">{r.totalCommissionGenerated?.toFixed(2) || 0} R</p>
                                                            <p className="text-[8px] text-neutral-400">{r.rewardsIssuedCount} Rewards • {Math.max(0, 5 - r.rewardsIssuedCount)} Remaining</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <p className="text-neutral-900">{ageDays} Days</p>
                                                        <p className="text-[8px] text-neutral-400 uppercase">Registered {new Date(r.createdAt).toLocaleDateString()}</p>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
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

                    {/* GROWTH TREND & PAYOUT HISTORY */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="bg-white rounded-[48px] p-12 border border-neutral-100 shadow-sm space-y-10">
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

                         <div className="bg-white rounded-[48px] p-12 border border-neutral-100 shadow-sm flex flex-col">
                             <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Settlement Ledger</p>
                                    <h3 className="text-2xl font-black mt-2">Recent Payouts</h3>
                                </div>
                                <button className="p-4 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">History</button>
                             </div>

                             <div className="flex-1 space-y-6 overflow-y-auto max-h-[250px] pr-4 custom-scrollbar">
                                {recentTransactions.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-neutral-300 gap-4">
                                        <PieChart size={40} strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase">No settlement history found</p>
                                    </div>
                                ) : (
                                    recentTransactions.map((t: any) => (
                                        <div key={t._id} className="flex justify-between items-center p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
                                                    <ArrowUpRight size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-neutral-900">COMMISSION YIELD</p>
                                                    <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-green-600">+{t.amount.toFixed(2)} R</p>
                                        </div>
                                    ))
                                )}
                             </div>
                         </div>
                    </div>

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
