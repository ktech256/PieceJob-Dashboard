"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Clock,
  Filter,
  RefreshCcw,
  Search
} from 'lucide-react';

export default function PerformanceAdjustments() {
  const { countryCode } = useCountryStore();
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdjustments = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/performance/adjustments?countryCode=${countryCode}`);
        setAdjustments(res.data.data || []);
    } catch (e) {
        console.error('Failed to load adjustments');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadAdjustments();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Penalty & Score History</h1>
          <p className="text-neutral-500 font-medium">Complete audit trail of all manual and automated performance score modifications.</p>
        </div>
        <div className="flex gap-3">
             <button onClick={loadAdjustments} className="p-3 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all">
                <RefreshCcw size={18} className="text-neutral-600" />
             </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
            <tr>
              <th className="px-8 py-5">Event</th>
              <th className="px-8 py-5">Provider</th>
              <th className="px-8 py-5">Type</th>
              <th className="px-8 py-5">Adjustment</th>
              <th className="px-8 py-5">Score Range</th>
              <th className="px-8 py-5">Timestamp</th>
              <th className="px-8 py-5 text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 text-sm font-bold">
            {loading ? (
              <tr><td colSpan={7} className="py-20 text-center text-neutral-400 uppercase tracking-widest text-xs">Syncing Audit Logs...</td></tr>
            ) : adjustments.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-neutral-400 italic">No score adjustments recorded.</td></tr>
            ) : adjustments.map(a => (
              <tr key={a._id} className="hover:bg-neutral-50/50 transition-all">
                <td className="px-8 py-5">
                   <p className="text-neutral-900 max-w-xs truncate">{a.reason}</p>
                </td>
                <td className="px-8 py-5 text-xs text-neutral-500 uppercase tracking-tighter">
                   {a.providerId?.firstName} {a.providerId?.lastName}
                </td>
                <td className="px-8 py-5">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-neutral-100 rounded text-neutral-500">{a.scoreType}</span>
                </td>
                <td className="px-8 py-5">
                   <div className={`flex items-center gap-1 ${a.adjustmentPoints > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {a.adjustmentPoints > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {a.adjustmentPoints > 0 ? '+' : ''}{a.adjustmentPoints}
                   </div>
                </td>
                <td className="px-8 py-5 text-[11px] text-neutral-400">
                   {a.oldScore} → {a.newScore}
                </td>
                <td className="px-8 py-5 text-[11px] text-neutral-400">
                   {new Date(a.createdAt).toLocaleString()}
                </td>
                <td className="px-8 py-5 text-right">
                   {a.jobId ? (
                       <button className="text-[10px] font-black uppercase text-brand-provider-blue hover:underline">
                          Job #{a.jobId._id?.slice(-6)}
                       </button>
                   ) : (
                       <span className="text-neutral-300">System</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
