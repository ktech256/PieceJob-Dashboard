"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function PerformanceAppeals() {
  const { countryCode } = useCountryStore();
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);

  const loadAppeals = async () => {
    setLoading(true);
    try {
        const res = await api.get('/api/admin/performance/appeals');
        setAppeals(res.data.data || []);
    } catch (e) {
        console.error('Failed to load appeals');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadAppeals();
  }, []);

  const handleReview = async (appealId: string, status: string, action: string) => {
    try {
        await api.post(`/api/admin/performance/appeals/${appealId}/review`, {
            status,
            adminNotes: "Processed via Appeal Dashboard",
            adjustmentAction: action
        });
        toast.success(`Appeal ${status.toLowerCase()} successfully`);
        loadAppeals();
        setSelectedAppeal(null);
    } catch (e) {
        toast.error('Review submission failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Provider Appeals Hub</h1>
          <p className="text-neutral-500 font-medium">Review and resolve provider disputes regarding performance penalties and deductions.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                <tr>
                  <th className="px-8 py-5">Provider</th>
                  <th className="px-8 py-5">Reason</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center text-neutral-400 uppercase tracking-widest text-xs">Syncing Appeals...</td></tr>
                ) : appeals.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-neutral-400">No pending appeals found.</td></tr>
                ) : appeals.map(a => (
                  <tr key={a._id} className={`hover:bg-neutral-50/50 transition-all ${selectedAppeal?._id === a._id ? 'bg-neutral-50' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                          <AlertCircle size={16} className="text-neutral-400" />
                        </div>
                        <p className="text-neutral-900">{a.providerId?.firstName} {a.providerId?.lastName}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-black uppercase text-neutral-500">{a.reasonCode}</td>
                    <td className="px-8 py-5 text-xs text-neutral-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        a.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                        a.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                        'bg-red-50 text-red-600'
                      }`}>{a.status}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => setSelectedAppeal(a)}
                        className="text-xs font-black uppercase tracking-widest text-neutral-900 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-1">
          {selectedAppeal ? (
            <div className="bg-white border border-neutral-200 rounded-[32px] p-8 space-y-6 sticky top-8">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-black uppercase tracking-tight">Appeal Detail</h3>
                <button onClick={() => setSelectedAppeal(null)} className="text-neutral-400 hover:text-neutral-900">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 rounded-2xl">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Description</p>
                  <p className="text-sm font-medium leading-relaxed">{selectedAppeal.description}</p>
                </div>

                {selectedAppeal.adjustmentId && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Penalty Info</p>
                      <div className="flex justify-between items-end">
                        <div>
                           <p className="text-xs font-bold text-red-700">{selectedAppeal.adjustmentId.reason}</p>
                           <p className="text-[10px] text-red-400">Old: {selectedAppeal.adjustmentId.oldScore} → New: {selectedAppeal.adjustmentId.newScore}</p>
                        </div>
                        <p className="text-xl font-black text-red-700">{selectedAppeal.adjustmentId.adjustmentPoints}</p>
                      </div>
                   </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                   <button className="flex items-center justify-center gap-2 p-3 bg-neutral-100 rounded-xl text-[10px] font-black uppercase hover:bg-neutral-200 transition-all">
                      <ImageIcon size={14} /> View Evidence
                   </button>
                   <button className="flex items-center justify-center gap-2 p-3 bg-neutral-100 rounded-xl text-[10px] font-black uppercase hover:bg-neutral-200 transition-all">
                      <MapPin size={14} /> GPS Snapshot
                   </button>
                </div>
              </div>

              {selectedAppeal.status === 'PENDING' && (
                <div className="pt-6 border-t border-neutral-100 space-y-3">
                  <button
                    onClick={() => handleReview(selectedAppeal._id, 'APPROVED', 'REVERSE')}
                    className="w-full bg-neutral-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Approve & Reverse Penalty
                  </button>
                  <button
                    onClick={() => handleReview(selectedAppeal._id, 'REJECTED', 'KEEP')}
                    className="w-full bg-white border border-neutral-200 text-neutral-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Reject Appeal
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-neutral-200 rounded-[32px] flex flex-col items-center justify-center text-center p-8">
              <FileText size={48} className="text-neutral-200 mb-4" />
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Select an appeal to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
