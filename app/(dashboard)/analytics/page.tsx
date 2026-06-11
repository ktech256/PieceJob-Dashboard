"use client";

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import { useSocket } from '@/hooks/useSocket';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, MapPin, Clock, Zap, Activity, Globe, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LiveOpsMap } from '@/components/dashboard/LiveOpsMap';

export default function AnalyticsDashboard() {
  const { countryCode, currentCountry } = useCountryStore();
  const [stats, setStats] = useState<any>(null);
  const [liveOps, setLiveOps] = useState<any>({ providers: [], activeJobs: [] });
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isGlobal = countryCode === 'GLOBAL';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const [statsRes, liveRes] = await Promise.all([
            api.get(`/api/admin/analytics/summary?countryCode=${countryCode}`),
            api.get(`/api/admin/analytics/live-ops?countryCode=${countryCode}`)
        ]);
        setStats(statsRes.data.stats);
        setLiveOps(liveRes.data.data);

        if (isGlobal) {
            const breakdownRes = await api.get('/api/admin/analytics/global-breakdown');
            setBreakdown(breakdownRes.data.breakdown);
        }
    } catch (e: any) {
        console.error('Data Fetch Failed:', e.response?.data || e.message);
        setError(`Neural Link Failure: ${e.response?.data?.message || e.message}. Ensure the backend is reachable at ${api.defaults.baseURL}`);
    } finally {
        setLoading(false);
    }
  }, [countryCode, isGlobal]);

  useEffect(() => {
    if (countryCode) fetchData();
  }, [fetchData, countryCode]);

  useSocket((event, data) => {
      console.log(`Live Event: ${event}`, data);
      if (event === 'live_gps_update') {
          setLiveOps((prev: any) => ({
              ...prev,
              providers: prev.providers.map((p: any) =>
                  p.userId?._id === data.userId ? { ...p, location: { coordinates: data.coordinates } } : p
              )
          }));
      } else {
          fetchData();
      }
  });

  if (loading) return <div className="py-20 text-center text-xs font-black uppercase animate-pulse">Establishing Neural Link with Global Datacentres...</div>;

  if (error) return (
      <div className="py-20 text-center space-y-4">
          <p className="text-red-500 font-black uppercase text-xs">{error}</p>
          <button onClick={fetchData} className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase">Retry Connection</button>
      </div>
  );

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">
            {isGlobal ? 'Global Ecosystem Pulse' : 'Operational Insights'}
          </h1>
          <p className="text-neutral-500 font-medium">
            {isGlobal ? 'Consolidated performance across all workspaces (USD)' : `Real-time performance metrics for ${currentCountry?.name}.`}
          </p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchData} className="bg-white border border-neutral-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all flex items-center gap-2">
                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                Manual Sync
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(stats.financials?.grossRevenue || 0, stats.currency)}
          trend={`${stats.growth?.userGrowth?.percentage.toFixed(1)}%`}
          isPositive={stats.growth?.userGrowth?.percentage >= 0}
          icon={<Zap size={20} className="text-brand-customer-red" />}
          color="bg-brand-customer-red/5"
        />
        <StatCard
          title="Online Providers"
          value={stats.operations?.providers?.onlineProviders.toString()}
          trend="+2.1%"
          isPositive={true}
          icon={<Users size={20} className="text-brand-provider-green" />}
          color="bg-brand-provider-green/5"
        />
        <StatCard
          title="Efficiency Score"
          value={`${stats.efficiency?.avgCompletionMinutes || 0}m`}
          trend="-4.5%"
          isPositive={true}
          icon={<Activity size={20} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Total Jobs"
          value={stats.business?.jobs?.totalJobs.toString()}
          trend="+12%"
          isPositive={true}
          icon={<Briefcase size={20} className="text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm">
          <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-10">Revenue Performance Trend ({stats.currency})</h3>
          <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueTrends}>
                      <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="amount" stroke="#FF3B30" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={4} />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-neutral-900 rounded-[40px] overflow-hidden relative group shadow-2xl border-4 border-neutral-800">
            <LiveOpsMap providers={liveOps.providers} activeJobs={liveOps.activeJobs} />
            <div className="absolute top-6 left-6 bg-neutral-800/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-xs font-black text-white uppercase tracking-widest">Live Operations Control</span>
            </div>
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <div className="bg-neutral-800/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Workspace Health</p>
                    <div className="flex gap-4 text-white">
                        <div className="text-center">
                            <p className="text-lg font-black">{liveOps.providers.length}</p>
                            <p className="text-[8px] font-bold text-neutral-400 uppercase">Online</p>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-lg font-black text-brand-customer-red">{liveOps.activeJobs.length}</p>
                            <p className="text-[8px] font-bold text-neutral-400 uppercase">Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-8 border-l-4 border-neutral-900 pl-4">Efficiency Matrix</h3>
                <div className="space-y-10">
                    <EfficiencyItem
                        icon={<Clock size={16} />}
                        label="Avg. Acceptance"
                        value={`${stats.efficiency?.avgAcceptanceMinutes || 0}m`}
                        subValue="Target: < 2m"
                        percent={Math.min(100, Math.max(0, 100 - ((stats.efficiency?.avgAcceptanceMinutes || 0) / 5) * 100))}
                        color="bg-brand-provider-green"
                    />
                    <EfficiencyItem
                        icon={<MapPin size={16} />}
                        label="Avg. Arrival"
                        value={`${stats.efficiency?.avgArrivalMinutes || 0}m`}
                        subValue="Target: < 15m"
                        percent={Math.min(100, Math.max(0, 100 - ((stats.efficiency?.avgArrivalMinutes || 0) / 30) * 100))}
                        color="bg-blue-600"
                    />
                    <EfficiencyItem
                        icon={<Zap size={16} />}
                        label="Success Rate"
                        value={`${Math.round(stats.efficiency?.wavePerformance?.broadcastSuccessRate || 0)}%`}
                        subValue="Broadcast Success"
                        percent={Math.round(stats.efficiency?.wavePerformance?.broadcastSuccessRate || 0)}
                        color="bg-orange-500"
                    />
                </div>
            </div>
        </div>
      </div>

      {isGlobal && breakdown && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
              <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm">
                  <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-10">Regional Revenue Breakdown (USD)</h3>
                  <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={breakdown.byCountry}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                              <XAxis dataKey="countryCode" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                              <Tooltip cursor={{ fill: '#F5F5F5' }} />
                              <Bar dataKey="totalUsd" fill="#FF3B30" radius={[8, 8, 0, 0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-[#0A0A0A] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-customer-red blur-3xl opacity-20"></div>
                   <div>
                       <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-8">Profitability Report</h3>
                       <div className="space-y-6">
                           <ProfitRow label="Net Profit" value={formatCurrency(stats.financials?.netProfit || 0, stats.currency)} highlight />
                           <ProfitRow label="Gross Margin" value={`${stats.financials?.margin?.toFixed(1)}%`} />
                           <ProfitRow label="Payouts" value={formatCurrency(stats.financials?.payouts || 0, stats.currency)} />
                       </div>
                   </div>
                   <div className="pt-8 border-t border-white/5">
                        <p className="text-[10px] text-neutral-500 font-bold uppercase leading-relaxed">Aggregated from {breakdown.byCountry?.length || 0} active workspaces using live exchange rates.</p>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
}

function ProfitRow({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-400 uppercase">{label}</span>
            <span className={`text-xl font-black ${highlight ? 'text-brand-provider-green' : 'text-white'}`}>{value}</span>
        </div>
    )
}

function StatCard({ title, value, icon, trend, isPositive, color }: { title: string, value: string, icon: React.ReactNode, trend: string, isPositive: boolean, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm hover:translate-y-[-4px] transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
        </div>
      </div>
      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-neutral-900 mt-1">{value}</p>
    </div>
  );
}

function EfficiencyItem({ icon, label, value, subValue, percent, color }: { icon: React.ReactNode, label: string, value: string, subValue: string, percent: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400 border border-neutral-100">{icon}</div>
                    <div>
                        <p className="text-xs font-black text-neutral-800 uppercase tracking-tighter">{label}</p>
                        <p className="text-[10px] font-bold text-neutral-400">{subValue}</p>
                    </div>
                </div>
                <p className="text-2xl font-black text-neutral-900">{value}</p>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    )
}
