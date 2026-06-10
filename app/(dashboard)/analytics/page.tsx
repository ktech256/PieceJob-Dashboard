"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  Briefcase,
  MapPin,
  Clock,
  Zap,
  Activity
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { countryCode } = useCountryStore();
  const [stats, setStats] = useState<any>({
    revenue: { totalRevenue: 0, revenueToday: 0 },
    jobs: { totalJobs: 0, jobsCompleted: 0, jobsCancelled: 0 },
    users: { totalCustomers: 0, totalProviders: 0 },
    providers: { onlineProviders: 0 },
    avgCompletionMinutes: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/analytics/summary?countryCode=${countryCode}`);
        setStats(res.data.stats || res.data);
    } catch (e) {
        console.error('Failed to load analytics');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) fetchStats();
  }, [countryCode]);

  // Fallback chart data (In production this would come from a /trends endpoint)
  const chartData = [
    { name: 'Mon', jobs: 45, demand: 80 },
    { name: 'Tue', jobs: 52, demand: 85 },
    { name: 'Wed', jobs: 48, demand: 75 },
    { name: 'Thu', jobs: 61, demand: 90 },
    { name: 'Fri', jobs: 55, demand: 95 },
    { name: 'Sat', jobs: 70, demand: 110 },
    { name: 'Sun', jobs: 65, demand: 100 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Operational Insights</h1>
          <p className="text-neutral-500 font-medium">Real-time performance metrics for {countryCode}.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchStats} className="bg-white border border-neutral-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">Refresh</button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Daily Revenue"
          value={`$${(stats.business?.revenue?.revenueToday || 0).toLocaleString()}`}
          icon={<Zap size={20} className="text-brand-customer-red" />}
          trend="+15.4%"
          color="bg-brand-customer-red/5"
        />
        <StatCard
          title="Active Providers"
          value={(stats.operations?.providers?.onlineProviders || 0).toString()}
          icon={<Users size={20} className="text-brand-provider-green" />}
          trend="+2.1%"
          color="bg-brand-provider-green/5"
        />
        <StatCard
          title="Total Customers"
          value={(stats.operations?.users?.totalCustomers || 0).toString()}
          icon={<Activity size={20} className="text-blue-600" />}
          trend="+4.5%"
          color="bg-blue-50"
        />
        <StatCard
          title="Total Jobs"
          value={(stats.business?.jobs?.totalJobs || 0).toString()}
          icon={<Briefcase size={20} className="text-orange-600" />}
          trend="+12%"
          color="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-neutral-900 rounded-[32px] overflow-hidden relative group shadow-2xl h-[500px]">
            <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/28.0473,-26.2041,11/800x500?access_token=YOUR_TOKEN')] bg-cover"></div>
            <div className="absolute top-6 left-6 bg-neutral-800/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-xs font-black text-white uppercase tracking-widest">Live Operations Map</span>
            </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-8">Efficiency Matrix</h3>
                <div className="space-y-8">
                    <EfficiencyItem
                        icon={<Clock size={16} />}
                        label="Avg. Completion"
                        value={`${stats.operations?.avgCompletionMinutes || 0}m`}
                        subValue="Target: < 45m"
                        percent={85}
                        color="bg-brand-provider-green"
                    />
                    <EfficiencyItem
                        icon={<MapPin size={16} />}
                        label="Success Rate"
                        value={`${Math.round(((stats.business?.jobs?.jobsCompleted || 0) / (stats.business?.jobs?.totalJobs || 1)) * 100)}%`}
                        subValue="Completion Ratio"
                        percent={92}
                        color="bg-blue-600"
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm">
            <h3 className="font-black text-lg uppercase tracking-tight text-neutral-800 mb-8">Weekly Job Volume</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip />
                        <Bar dataKey="jobs" fill="#410200" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm">
            <h3 className="font-black text-lg uppercase tracking-tight text-neutral-800 mb-8">Service Demand Heat</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#410200" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#410200" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="demand" stroke="#410200" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string, value: string, icon: React.ReactNode, trend: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{trend}</span>
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
                    <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400">{icon}</div>
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
