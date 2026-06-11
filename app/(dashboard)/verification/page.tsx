"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Eye,
  ArrowRight,
  User,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function VerificationQueue() {
  const { countryCode } = useCountryStore();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");

  const loadQueue = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/verifications/queue?countryCode=${countryCode}&status=${activeTab}`);
        setQueue(res.data.queue || []);
    } catch (e) {
        console.error('Failed to load queue');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadQueue();
  }, [countryCode, activeTab]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Verification Command</h1>
          <p className="text-neutral-500 font-medium text-sm">Review government IDs, licenses, and professional vetting requests.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            {['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(status => (
                <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        activeTab === status ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    {status.replace('_', ' ')}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                      <tr>
                          <th className="px-8 py-5">Provider</th>
                          <th className="px-8 py-5">Level Requested</th>
                          <th className="px-8 py-5">Submitted</th>
                          <th className="px-8 py-5">Docs</th>
                          <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                      {loading ? (
                          <tr><td colSpan={5} className="py-20 text-center text-neutral-300 uppercase tracking-widest text-xs animate-pulse">Syncing Secure Queue...</td></tr>
                      ) : queue.length === 0 ? (
                          <tr><td colSpan={5} className="py-20 text-center text-neutral-400 uppercase text-xs">No {activeTab.toLowerCase()} requests found.</td></tr>
                      ) : (
                          queue.map(req => (
                              <tr key={req._id} className="hover:bg-neutral-50/50 transition-all group">
                                  <td className="px-8 py-5 flex items-center gap-4">
                                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 font-black">
                                          {req.providerId?.userId?.firstName?.[0]}
                                      </div>
                                      <div>
                                          <p className="text-neutral-900">{req.providerId?.userId?.firstName} {req.providerId?.userId?.lastName}</p>
                                          <p className="text-[10px] text-neutral-400 font-medium">{req.providerId?.userId?.email}</p>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                          req.type === 'HIGH_VETTING' ? 'bg-red-50 text-red-600' :
                                          req.type === 'TRADE' ? 'bg-purple-50 text-purple-600' :
                                          req.type === 'PROFESSIONAL' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                      }`}>{req.type}</span>
                                  </td>
                                  <td className="px-8 py-5 text-xs text-neutral-500 uppercase">
                                      {new Date(req.submittedAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-8 py-5">
                                      <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">{req.documents?.length} Files</span>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                      <Link href={`/verification/${req._id}`}>
                                          <button className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all flex items-center gap-2 ml-auto shadow-sm">
                                              Review <ArrowRight size={12} />
                                          </button>
                                      </Link>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
