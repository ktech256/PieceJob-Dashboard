"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize,
  AlertTriangle,
  User,
  ShieldCheck,
  Smartphone,
  Calendar,
  FileText,
  Eye
} from 'lucide-react';

export default function ReviewVerification() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const loadRequest = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/verifications/${id}`);
        setRequest(res.data.request);
        if (res.data.request.documents?.length > 0) {
            setSelectedDoc(res.data.request.documents[0]);
        }
    } catch (e) {
        console.error('Load failed');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [id]);

  const handleReview = async (status: string) => {
      const reason = (status === 'REJECTED' || status === 'RESUBMITTED') ? prompt(`Enter reason for ${status}:`) : null;
      if ((status === 'REJECTED' || status === 'RESUBMITTED') && !reason) return;

      try {
          await api.patch(`/api/admin/verifications/${id}/review`, { status, rejectionReason: reason });
          router.push('/verification');
      } catch (e) {
          alert('Failed to update verification status');
      }
  };

  if (loading) return <div className="p-20 text-center uppercase font-black text-xs tracking-widest text-neutral-300">Decrypting Encrypted Dossier...</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 font-black uppercase text-xs transition-all">
              <ArrowLeft size={16} />
              Return to Queue
          </button>
          <div className="flex gap-2">
              <button onClick={() => handleReview('REJECTED')} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm">
                  Reject Request
              </button>
              <button onClick={() => handleReview('RESUBMITTED')} className="bg-amber-50 text-amber-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                  Request Resubmission
              </button>
              <button onClick={() => handleReview('APPROVED')} className="bg-green-600 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Approve Vetting
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SIDEBAR INFO */}
          <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-neutral-200 rounded-[32px] p-6 shadow-sm">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                      <User size={14} /> Subject Profile
                  </h3>
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 font-black uppercase">
                          {request.providerId?.userId?.firstName?.[0]}
                      </div>
                      <div>
                          <p className="text-sm font-black text-neutral-900 uppercase leading-none">{request.providerId?.userId?.firstName} {request.providerId?.userId?.lastName}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter mt-1">{request.providerId?.userId?.phoneNumber}</p>
                      </div>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-neutral-100">
                      <MetricRow label="Current Level" value={request.providerId?.verificationLevel} color="text-neutral-500" />
                      <MetricRow label="Required Level" value={request.type} color="text-brand-customer-red" />
                      <MetricRow label="Vetting Status" value={request.status} color="text-neutral-500" />
                      <MetricRow label="Workspace" value={request.countryCode} color="text-neutral-500" />
                  </div>
                  <div className="space-y-1 pt-6 border-t border-neutral-100">
                      <MetricRow label="Approved Files" value={request.documents?.filter((d: any) => d.status === 'APPROVED').length} color="text-green-500" />
                      <MetricRow label="Pending Files" value={request.documents?.filter((d: any) => d.status === 'PENDING').length} color="text-amber-500" />
                      <MetricRow label="Rejected Files" value={request.documents?.filter((d: any) => d.status === 'REJECTED').length} color="text-red-500" />
                  </div>
                  <div className="mt-6 pt-6 border-t border-neutral-100">
                      <h4 className="font-black text-[9px] uppercase tracking-widest text-neutral-400 mb-4">Service Context</h4>
                      <div className="flex flex-wrap gap-1">
                          {request.providerId?.servicesOffered?.map((s: string) => (
                              <span key={s} className="text-[8px] bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded-md uppercase font-bold text-neutral-600">{s}</span>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-[32px] p-2 overflow-hidden shadow-sm">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-neutral-400 m-4">Submitted Documents</h3>
                  <div className="space-y-1">
                      {request.documents?.map((doc: any) => (
                          <button
                            key={doc._id}
                            onClick={() => setSelectedDoc(doc)}
                            className={`w-full text-left p-4 rounded-3xl transition-all flex items-center gap-3 ${selectedDoc?._id === doc._id ? 'bg-neutral-900 text-white shadow-lg' : 'hover:bg-neutral-50 text-neutral-600'}`}
                          >
                              <FileText size={16} className={selectedDoc?._id === doc._id ? 'text-brand-customer-red' : 'text-neutral-300'} />
                              <div className="overflow-hidden">
                                  <p className="text-[10px] font-black uppercase truncate">{doc.type.replace('_', ' ')}</p>
                                  <p className={`text-[8px] font-bold uppercase ${doc.status === 'APPROVED' ? 'text-green-500' : 'opacity-60'}`}>{doc.status}</p>
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          {/* VIEWER ENGINE */}
          <div className="lg:col-span-9 flex flex-col h-[700px]">
              <div className="flex-1 bg-[#1A1A1A] rounded-[40px] relative overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl">
                   {selectedDoc ? (
                       <div
                        className="transition-transform duration-200 ease-out cursor-move"
                        style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        }}
                       >
                           <img
                                src={selectedDoc.url}
                                alt="Document"
                                className="max-h-full max-w-full object-contain shadow-2xl rounded-sm"
                                draggable={false}
                           />
                       </div>
                   ) : (
                       <div className="text-neutral-500 flex flex-col items-center gap-4">
                           <Eye size={48} className="opacity-20" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select Document to Inspect</p>
                       </div>
                   )}

                   {/* VIEWER CONTROLS */}
                   <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                       <ViewerBtn icon={<RotateCcw size={16} />} onClick={() => setRotation(r => r - 90)} />
                       <ViewerBtn icon={<RotateCw size={16} />} onClick={() => setRotation(r => r + 90)} />
                       <div className="w-px h-6 bg-white/10 mx-2"></div>
                       <ViewerBtn icon={<ZoomOut size={16} />} onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} />
                       <span className="text-[10px] font-black text-white w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                       <ViewerBtn icon={<ZoomIn size={16} />} onClick={() => setZoom(z => Math.min(3, z + 0.2))} />
                       <div className="w-px h-6 bg-white/10 mx-2"></div>
                       <ViewerBtn icon={<RotateCcw size={16} />} onClick={() => { setZoom(1); setRotation(0); }} />
                       <ViewerBtn icon={<Download size={16} />} onClick={() => window.open(selectedDoc?.url, '_blank')} />
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{label}</span>
            <span className={`text-[10px] font-black uppercase ${color}`}>{value}</span>
        </div>
    )
}

function ViewerBtn({ icon, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="p-2 hover:bg-white/10 rounded-xl text-white transition-all hover:scale-110 active:scale-95"
        >
            {icon}
        </button>
    )
}
