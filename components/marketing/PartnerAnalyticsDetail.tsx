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

    const { partner, metrics, geoStats, monthlyTrend, recentReferrals } = data;

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
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase border border-green-100 tracking-widest">Enterprise Partner</span>
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

                    {/* TOP METRICS */}
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* RECENT ACQUISITIONS */}
                        <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-neutral-50 flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">Recent Acquisition Stream</h3>
                                <button className="text-[9px] font-black uppercase text-blue-600">Explore Full Feed</button>
                            </div>
                            <div className="p-2">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[9px] font-black uppercase text-neutral-400">
                                            <th className="px-6 py-4">User Signature</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Registered</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] font-bold uppercase">
                                        {recentReferrals.map((r: any) => (
                                            <tr key={r._id} className="border-b border-neutral-50 last:border-0">
                                                <td className="px-6 py-5 flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-neutral-50 rounded-lg flex items-center justify-center font-black">
                                                        {r.referredId.firstName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-neutral-900">{r.referredId.firstName} {r.referredId.lastName}</p>
                                                        <p className="text-[8px] text-neutral-400">{r.referredId.role}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${r.jobsCompletedCount > 0 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                        {r.jobsCompletedCount > 0 ? 'Qualified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* GEO HEATMAP PREVIEW */}
                        <div className="bg-neutral-900 rounded-[40px] p-10 text-white flex flex-col gap-8 relative overflow-hidden group">
                             <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Geographic Penetration</h3>
                                <p className="text-2xl font-black mt-2">Province Coverage</p>
                             </div>

                             <div className="grid grid-cols-2 gap-6 relative z-10 flex-1">
                                {geoStats.map((s: any) => (
                                    <div key={s._id} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                                        <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">{s._id || 'Unknown Cluster'}</p>
                                        <p className="text-2xl font-black mt-1">{s.count}</p>
                                    </div>
                                ))}
                             </div>

                             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-all duration-700"></div>
                        </div>
                    </div>

                    {/* GROWTH TREND */}
                    <div className="bg-white rounded-[48px] p-12 border border-neutral-100 shadow-sm space-y-10">
                         <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Financial Growth Vector</p>
                                <h3 className="text-2xl font-black mt-2">Revenue Generation Stream</h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                    <ArrowUpRight size={14} /> Peak Yield
                                </div>
                            </div>
                         </div>

                         <div className="h-64 w-full flex items-end gap-3 px-4">
                            {monthlyTrend.map((m: any, i: number) => {
                                const height = (m.amount / Math.max(...monthlyTrend.map((x: any) => x.amount))) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="w-full bg-neutral-50 rounded-2xl relative overflow-hidden flex flex-col justify-end" style={{ height: '200px' }}>
                                            <div
                                                className="bg-neutral-900 group-hover:bg-blue-600 transition-all duration-500 rounded-t-xl"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                            {/* Tooltip */}
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
