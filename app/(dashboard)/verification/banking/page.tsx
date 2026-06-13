"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ArrowLeft,
  FileText,
  CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BankingVerificationQueue() {
  const { countryCode } = useCountryStore();
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/verifications/banking?countryCode=${countryCode}`);
        setQueue(res.data.queue || []);
    } catch (e) {
        console.error('Failed to load banking queue');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadQueue();
  }, [countryCode]);

  const handleAction = async (providerId: string, action: 'approve' | 'reject') => {
      try {
          await api.patch(`/api/admin/verifications/banking/${providerId}/${action}`);
          loadQueue();
      } catch (e) {
          alert(`Failed to ${action} bank details`);
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 font-black uppercase text-xs transition-all">
              <ArrowLeft size={16} /> Back
          </button>
          <div className="text-right">
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Banking Integrity Review</h1>
              <p className="text-neutral-500 font-medium text-sm">Verify account holder names and confirmation letters for automated payouts.</p>
          </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                      <tr>
                          <th className="px-8 py-5">Provider & Identity</th>
                          <th className="px-8 py-5">Account Details</th>
                          <th className="px-8 py-5">Confirmation Letter</th>
                          <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                      {loading ? (
                          <tr><td colSpan={4} className="py-20 text-center text-neutral-300 uppercase tracking-widest text-xs animate-pulse">Syncing Financial Credentials...</td></tr>
                      ) : queue.length === 0 ? (
                          <tr><td colSpan={4} className="py-20 text-center text-neutral-400 uppercase text-xs">No pending banking reviews found.</td></tr>
                      ) : (
                          queue.map(provider => (
                              <tr key={provider._id} className="hover:bg-neutral-50/50 transition-all">
                                  <td className="px-8 py-5">
                                      <div className="flex flex-col">
                                          <span className="text-neutral-900">{provider.userId?.firstName} {provider.userId?.lastName}</span>
                                          <span className="text-[10px] text-neutral-400 font-medium uppercase">{provider.userId?.phoneNumber}</span>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-neutral-100 rounded-lg"><CreditCard size={14} className="text-neutral-500" /></div>
                                          <div>
                                              <p className="text-neutral-900 leading-none">{provider.bankDetails?.bankName}</p>
                                              <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">{provider.bankDetails?.accountHolder} • {provider.bankDetails?.accountType}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      {provider.bankDetails?.bankConfirmationUrl ? (
                                          <button
                                            onClick={() => window.open(provider.bankDetails.bankConfirmationUrl, '_blank')}
                                            className="flex items-center gap-2 text-brand-customer-red hover:underline"
                                          >
                                              <FileText size={14} /> View Document
                                          </button>
                                      ) : <span className="text-red-500 opacity-50 italic">Missing Document</span>}
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                      <div className="flex gap-2 justify-end">
                                          <button onClick={() => handleAction(provider._id, 'reject')} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Reject</button>
                                          <button onClick={() => handleAction(provider._id, 'approve')} className="px-6 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg shadow-green-600/20">Verify</button>
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
