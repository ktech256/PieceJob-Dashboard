"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ArrowLeft,
  Eye,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddressVerificationQueue() {
  const { countryCode } = useCountryStore();
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/verifications/addresses?countryCode=${countryCode}`);
        setQueue(res.data.queue || []);
    } catch (e) {
        console.error('Failed to load address queue');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadQueue();
  }, [countryCode]);

  const handleAction = async (providerId: string, action: 'approve' | 'reject') => {
      try {
          await api.patch(`/api/admin/verifications/${providerId}/address/${action}`);
          loadQueue();
      } catch (e) {
          alert(`Failed to ${action} address change`);
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 font-black uppercase text-xs transition-all">
              <ArrowLeft size={16} /> Back
          </button>
          <div className="text-right">
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Address Reverification</h1>
              <p className="text-neutral-500 font-medium text-sm">Review proof of residence for workspace-isolated address changes.</p>
          </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                      <tr>
                          <th className="px-8 py-5">Provider</th>
                          <th className="px-8 py-5">Requested Address</th>
                          <th className="px-8 py-5">Proof of Residence</th>
                          <th className="px-8 py-5">Submitted</th>
                          <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                      {loading ? (
                          <tr><td colSpan={5} className="py-20 text-center text-neutral-300 uppercase tracking-widest text-xs animate-pulse">Syncing Geolocation Claims...</td></tr>
                      ) : queue.length === 0 ? (
                          <tr><td colSpan={5} className="py-20 text-center text-neutral-400 uppercase text-xs">No pending address changes found.</td></tr>
                      ) : (
                          queue.map(user => (
                              <tr key={user._id} className="hover:bg-neutral-50/50 transition-all">
                                  <td className="px-8 py-5">
                                      <p className="text-neutral-900">{user.firstName} {user.lastName}</p>
                                      <p className="text-[10px] text-neutral-400 font-medium">{user.email}</p>
                                  </td>
                                  <td className="px-8 py-5">
                                      <div className="flex flex-col gap-1">
                                          <span className="text-xs uppercase text-neutral-500">{user.pendingAddress?.province}</span>
                                          <span className="text-neutral-900">{user.pendingAddress?.address}, {user.pendingAddress?.city}</span>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      {user.pendingAddress?.proofOfResidenceUrl ? (
                                          <button
                                            onClick={() => window.open(user.pendingAddress.proofOfResidenceUrl, '_blank')}
                                            className="flex items-center gap-2 text-brand-customer-red hover:underline"
                                          >
                                              <FileText size={14} /> View Proof
                                          </button>
                                      ) : <span className="text-red-500 opacity-50 italic">Missing Proof</span>}
                                  </td>
                                  <td className="px-8 py-5 text-xs text-neutral-500 uppercase">
                                      {new Date(user.pendingAddress?.submittedAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                      <div className="flex gap-2 justify-end">
                                          <button onClick={() => handleAction(user._id, 'reject')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XCircle size={16} /></button>
                                          <button onClick={() => handleAction(user._id, 'approve')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle2 size={16} /></button>
                                      </div>
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
