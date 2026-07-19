"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  Activity,
  Award,
  AlertTriangle,
  RotateCcw,
  Search,
  User,
  ExternalLink
} from 'lucide-react';

export default function ProviderPerformance() {
  const { countryCode } = useCountryStore();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProviders = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/performance/list?countryCode=${countryCode}`);
        setProviders(res.data.providers || []);
    } catch (e) {
        console.error('Failed to load performance data');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadProviders();
  }, [countryCode]);

  const filtered = providers.filter(p =>
      `${p.userId?.firstName} ${p.userId?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Fleet Performance Monitor</h1>
          <p className="text-neutral-500 font-medium">Real-time tracking of provider tiers, acceptance rates, and lifecycle states.</p>
        </div>
        <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                    type="text"
                    placeholder="Search providers..."
                    className="bg-white border border-neutral-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-neutral-900"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button onClick={loadProviders} className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                <RotateCcw size={16} />
                Refresh Engine
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Elite Fleet" value={providers.filter(p => p.tier === 'ELITE').length} icon={<Award className="text-yellow-600" />} />
          <StatCard label="Avg. Health Score" value={`${(providers.reduce((acc, p) => acc + (p.performance?.healthScore || 100), 0) / (providers.length || 1)).toFixed(0)}%`} icon={<ShieldCheck className="text-blue-600" />} />
          <StatCard label="Active Online" value={providers.filter(p => p.isOnline).length} icon={<Activity className="text-brand-provider-green" />} />
          <StatCard label="At Risk" value={providers.filter(p => (p.performance?.healthScore || 100) < 60).length} icon={<AlertTriangle className="text-red-600" />} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                  <tr>
                      <th className="px-8 py-5">Provider</th>
                      <th className="px-8 py-5">Tier</th>
                      <th className="px-8 py-5">Health</th>
                      <th className="px-8 py-5">Reliability</th>
                      <th className="px-8 py-5">Cancellation</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                  {loading ? (
                      <tr><td colSpan={7} className="py-20 text-center text-neutral-400 uppercase tracking-widest text-xs">Syncing Performance Data...</td></tr>
                  ) : filtered.map(p => (
                      <tr key={p._id} className="hover:bg-neutral-50/50 transition-all group">
                          <td className="px-8 py-5 flex items-center gap-4">
                              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                                  <User size={20} />
                              </div>
                              <div>
                                  <p className="text-neutral-900">{p.userId?.firstName} {p.userId?.lastName}</p>
                                  <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">ID: {p._id.slice(-6)}</p>
                              </div>
                          </td>
                          <td className="px-8 py-5">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  p.tier === 'ELITE' ? 'bg-neutral-900 text-white' :
                                  p.tier === 'PLATINUM' ? 'bg-blue-100 text-blue-700' :
                                  p.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-neutral-100 text-neutral-500'
                              }`}>{p.tier}</span>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <span className={`text-xs font-black ${
                                    (p.performance?.healthScore || 100) >= 90 ? 'text-green-600' :
                                    (p.performance?.healthScore || 100) >= 70 ? 'text-yellow-600' : 'text-red-600'
                                }`}>{(p.performance?.healthScore || 100).toFixed(0)}%</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-xs text-neutral-500">{(p.performance?.reliabilityScore || 100).toFixed(0)}%</td>
                          <td className="px-8 py-5 text-xs text-neutral-500">{(p.performance?.cancellationScore || 100).toFixed(0)}%</td>
                          <td className="px-8 py-5">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                  p.lifecycleState === 'SUSPENDED' ? 'bg-red-50 text-red-600' :
                                  p.lifecycleState === 'ACTIVE' ? 'bg-green-50 text-green-600' :
                                  'bg-blue-50 text-blue-600'
                              }`}>{p.lifecycleState}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                              <button className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-900 hover:text-white transition-all">
                                  <ExternalLink size={14} />
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neutral-50 rounded-xl">{icon}</div>
                <div className="text-[9px] font-black text-neutral-400 border border-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Live</div>
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-neutral-900">{value}</p>
        </div>
    )
}
