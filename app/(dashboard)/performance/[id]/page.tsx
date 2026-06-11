"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useParams, useRouter } from 'next/navigation';
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  Activity,
  Award,
  AlertTriangle,
  RotateCcw,
  User,
  ArrowLeft,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';

export default function ProviderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/performance/${id}`);
        setData(res.data);
    } catch (e) {
        console.error('Load failed');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleLifecycleChange = async (status: string) => {
      const reason = prompt(`Reason for ${status.toLowerCase()}:`);
      if (!reason) return;
      try {
          await api.patch(`/api/admin/performance/${id}/lifecycle`, { status, reason });
          loadData();
      } catch (e) {
          alert('Failed to update status');
      }
  };

  if (loading) return <div className="p-20 text-center uppercase font-black text-xs tracking-widest text-neutral-300">Scanning Deep Analytics...</div>;
  if (!data) return <div>Provider not found</div>;

  const { provider, tierHistory, lifecycleHistory, performanceHistory } = data;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 font-black uppercase text-xs transition-all">
              <ArrowLeft size={16} />
              Back to Fleet
          </button>
          <div className="flex gap-2">
              {provider.lifecycleState === 'SUSPENDED' ? (
                  <button onClick={() => handleLifecycleChange('ACTIVE')} className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                      <Unlock size={14} /> Reinstated
                  </button>
              ) : (
                  <button onClick={() => handleLifecycleChange('SUSPENDED')} className="bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                      <Lock size={14} /> Suspend Fleet Access
                  </button>
              )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-neutral-200 rounded-[32px] p-10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5"><Award size={180} /></div>
                  <div className="relative z-10 flex items-start gap-8">
                      <div className="w-24 h-24 bg-neutral-100 rounded-[32px] flex items-center justify-center text-neutral-300">
                          <User size={48} />
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                              <h2 className="text-3xl font-black uppercase tracking-tight">{provider.userId?.firstName} {provider.userId?.lastName}</h2>
                              <span className="bg-neutral-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">{provider.tier}</span>
                          </div>
                          <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-6">{provider.userId?.email} • {provider.userId?.phoneNumber}</p>

                          <div className="grid grid-cols-3 gap-6">
                              <MetricMini label="Rating" value={provider.ratingAvg.toFixed(1)} />
                              <MetricMini label="Jobs" value={provider.jobsCompleted} />
                              <MetricMini label="Success" value={`${provider.performance?.completionRate?.toFixed(0) || 0}%`} />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-[32px] p-10 shadow-sm">
                  <h3 className="font-black text-lg uppercase mb-8">Performance DNA</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                      <Stat label="Acceptance" value={`${provider.performance?.acceptanceRate?.toFixed(1)}%`} sub="Broadcast Efficiency" />
                      <Stat label="On-Time Arrival" value={`${provider.performance?.arrivalRate?.toFixed(1)}%`} sub="Fleet Reliability" />
                      <Stat label="Complaints" value={`${provider.performance?.complaintRate?.toFixed(1)}%`} sub="Service Quality" />
                      <Stat label="Lead Time" value="4.2m" sub="Average Response" />
                  </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="p-8 border-b bg-neutral-50/50">
                      <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Lifecycle Audit Trail</h3>
                  </div>
                  <div className="divide-y divide-neutral-50 font-bold">
                      {lifecycleHistory.map((log: any) => (
                          <div key={log._id} className="p-6 flex justify-between items-center">
                              <div>
                                  <p className="text-sm text-neutral-900 uppercase">{log.status}</p>
                                  <p className="text-[10px] text-neutral-400 font-medium">{log.reason}</p>
                              </div>
                              <p className="text-[10px] text-neutral-400">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="space-y-8">
               <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white shadow-xl">
                  <h3 className="font-black text-xs uppercase tracking-widest text-neutral-500 mb-6">Tier Progression</h3>
                  <div className="space-y-6">
                      {tierHistory.map((h: any) => (
                          <div key={h._id} className="flex items-start gap-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-provider-green mt-1.5"></div>
                              <div>
                                  <p className="text-[11px] font-black uppercase tracking-tight">{h.newTier}</p>
                                  <p className="text-[9px] text-neutral-500 font-bold uppercase">{new Date(h.timestamp).toLocaleDateString()}</p>
                              </div>
                          </div>
                      ))}
                      {tierHistory.length === 0 && <p className="text-[10px] text-neutral-500 italic">No historical tier changes.</p>}
                  </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                  <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-6">Broadcast Opportunities</h3>
                  <div className="text-center py-4">
                      <p className="text-5xl font-black text-neutral-900">{provider.performance?.broadcastOpportunities || 0}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase mt-2">Total Waves Visible</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}

function MetricMini({ label, value }: any) {
    return (
        <div>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-neutral-900">{value}</p>
        </div>
    )
}

function Stat({ label, value, sub }: any) {
    return (
        <div>
            <p className="text-2xl font-black text-neutral-900">{value}</p>
            <p className="text-[10px] font-black text-neutral-800 uppercase tracking-tight mt-1">{label}</p>
            <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{sub}</p>
        </div>
    )
}
