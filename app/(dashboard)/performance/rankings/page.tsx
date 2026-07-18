"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Star,
  ShieldCheck,
  User,
  ArrowUpRight
} from 'lucide-react';

export default function PerformanceRankings() {
  const { countryCode } = useCountryStore();
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRankings = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/performance/rankings?countryCode=${countryCode}`);
        setRankings(res.data.data || []);
    } catch (e) {
        console.error('Failed to load rankings');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadRankings();
  }, [countryCode]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase italic">Elite Leaderboard</h1>
          <p className="text-neutral-500 font-medium">Top performing providers ranked by reliability, rating, and consistency.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
          {rankings.slice(0, 3).map((p, idx) => (
              <div key={p.id} className={`relative p-8 rounded-[40px] border-4 ${
                  idx === 0 ? 'bg-neutral-900 border-neutral-900 text-white' :
                  idx === 1 ? 'bg-white border-neutral-200' : 'bg-white border-neutral-100'
              }`}>
                  {idx === 0 && <Crown className="absolute -top-4 -right-4 text-yellow-500 fill-yellow-500 rotate-12" size={48} />}
                  <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100">
                          {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-neutral-400" />}
                      </div>
                      <div className={`text-4xl font-black italic opacity-20 ${idx === 0 ? 'text-white' : 'text-neutral-900'}`}>#0{idx + 1}</div>
                  </div>
                  <h3 className="text-xl font-black uppercase mb-1">{p.name}</h3>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${idx === 0 ? 'text-neutral-400' : 'text-neutral-500'}`}>{p.location}</p>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                      <div>
                          <p className="text-[9px] font-black uppercase opacity-60 mb-1">Reliability</p>
                          <p className="text-lg font-black">{p.reliability}%</p>
                      </div>
                      <div>
                          <p className="text-[9px] font-black uppercase opacity-60 mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                              <Star size={12} className="fill-yellow-500 text-yellow-500" />
                              <p className="text-lg font-black">{p.rating.toFixed(1)}</p>
                          </div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
            <tr>
              <th className="px-8 py-5">Rank</th>
              <th className="px-8 py-5">Provider</th>
              <th className="px-8 py-5">Reliability</th>
              <th className="px-8 py-5">Rating</th>
              <th className="px-8 py-5">Total Jobs</th>
              <th className="px-8 py-5">Tier</th>
              <th className="px-8 py-5 text-right">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 text-sm font-bold">
            {loading ? (
              <tr><td colSpan={7} className="py-20 text-center text-neutral-400 uppercase tracking-widest text-xs">Calculating Rankings...</td></tr>
            ) : rankings.slice(3).map(p => (
              <tr key={p.id} className="hover:bg-neutral-50/50 transition-all">
                <td className="px-8 py-5 text-neutral-400 italic">#{p.rank}</td>
                <td className="px-8 py-5 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-100">
                    {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <User size={16} className="m-auto text-neutral-400 h-full" />}
                  </div>
                  <p className="text-neutral-900">{p.name}</p>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-provider-green" style={{ width: `${p.reliability}%` }}></div>
                      </div>
                      <span className="text-xs">{p.reliability}%</span>
                   </div>
                </td>
                <td className="px-8 py-5 flex items-center gap-1">
                   <Star size={12} className="fill-yellow-500 text-yellow-500" />
                   {p.rating.toFixed(1)}
                </td>
                <td className="px-8 py-5 text-neutral-500">{p.jobs}</td>
                <td className="px-8 py-5">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-neutral-100 rounded">{p.tier}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-neutral-400 hover:text-neutral-900">
                    <ArrowUpRight size={16} />
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
