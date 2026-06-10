"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  ShieldCheck,
  Search,
  RotateCw,
  ZoomIn,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  BadgeCheck,
  UserCheck,
  MoreVertical,
  Filter
} from 'lucide-react';

export default function VerificationStation() {
  const [activeTab, setActiveTab] = useState("queue");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Verification Station</h1>
          <p className="text-neutral-500 font-medium">Audit provider credentials and enforce compliance against the 4-tier matrix.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <TabButton active={activeTab === "queue"} onClick={() => setActiveTab("queue")} label="Audit Queue" />
            <TabButton active={activeTab === "matrix"} onClick={() => setActiveTab("matrix")} label="Matrix Config" />
        </div>
      </div>

      {activeTab === "queue" && <VerificationQueue />}
      {activeTab === "matrix" && <MatrixConfig />}
    </div>
  );
}

function VerificationQueue() {
    const { countryCode } = useCountryStore();
    const [providers, setProviders] = useState<any[]>([]);
    const [activeProvider, setActiveProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadQueue = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/admin/verifications/pending?countryCode=${countryCode}`);
            const data = res.data.providers || [];
            setProviders(data);
            if (data.length > 0 && !activeProvider) {
                setActiveProvider(data[0]);
            }
        } catch (e) {
            console.error('Failed to load verification queue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadQueue();
    }, [countryCode]);

    const handleVerify = async (status: 'APPROVED' | 'REJECTED') => {
        if (!activeProvider) return;
        try {
            await api.patch(`/api/v1/admin/verifications/${activeProvider._id}`, { status });
            alert(`Provider ${status.toLowerCase()} successfully.`);
            loadQueue();
            setActiveProvider(null);
        } catch (e) {
            alert('Verification update failed');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-[700px]">
                <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
                    <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Incoming Requests ({providers.length})</h3>
                    <Filter size={14} className="text-neutral-400" />
                </div>
                <div className="flex-1 overflow-y-auto divide-y scrollbar-hide">
                    {loading ? (
                        <div className="p-10 text-center text-xs font-bold text-neutral-300 uppercase">Loading...</div>
                    ) : providers.length === 0 ? (
                        <div className="p-10 text-center text-neutral-400">Queue is empty.</div>
                    ) : (
                        providers.map((req, i) => (
                            <div key={req._id} onClick={() => setActiveProvider(req)} className={`p-6 cursor-pointer transition-all hover:bg-neutral-50 ${activeProvider?._id === req._id ? 'bg-neutral-900 text-white shadow-lg' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-black tracking-tight">{req.userId?.firstName} {req.userId?.lastName}</p>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${activeProvider?._id === req._id ? 'bg-brand-customer-red' : 'bg-blue-100 text-blue-600'}`}>{req.tier}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${activeProvider?._id === req._id ? 'text-neutral-500' : 'text-neutral-400'}`}>{req._id.slice(-6)}</p>
                                    <p className={`text-[10px] font-bold uppercase ${activeProvider?._id === req._id ? 'text-neutral-500' : 'text-neutral-300'}`}>{new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
                {activeProvider ? (
                    <div className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm relative overflow-hidden flex flex-col gap-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-800">Document Auditing Workspace</h3>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-1">Provider: {activeProvider.userId?.firstName} {activeProvider.userId?.lastName} (ID: {activeProvider._id})</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all"><ZoomIn size={18} /></button>
                                <button className="p-3 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all"><RotateCw size={18} /></button>
                            </div>
                        </div>

                        <div className="bg-neutral-100 rounded-3xl aspect-[16/10] flex items-center justify-center border-4 border-dashed border-neutral-200 relative group overflow-hidden">
                            {activeProvider.idDocumentUrl ? (
                                <img src={activeProvider.idDocumentUrl} className="w-full h-full object-cover" />
                            ) : (
                                <FileText size={80} className="text-neutral-300 group-hover:scale-110 transition-all duration-700" />
                            )}
                            <div className="absolute bottom-6 left-6 right-6 flex justify-center">
                                <div className="bg-neutral-900/80 backdrop-blur-lg px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest">Document Evidence Link</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest">Compliance Checklist</h4>
                                <div className="space-y-4">
                                    <ChecklistItem label="Photo Match Verification" />
                                    <ChecklistItem label="Criminal Record Clear" />
                                    <ChecklistItem label="Trade License Valid" />
                                    <ChecklistItem label="References Authenticated" />
                                </div>
                            </div>
                            <div className="flex flex-col justify-end gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleVerify('REJECTED')} className="py-4 bg-neutral-100 text-neutral-600 rounded-2xl font-black uppercase text-xs hover:bg-neutral-200 transition-all">Reject</button>
                                    <button onClick={() => handleVerify('APPROVED')} className="py-4 bg-brand-provider-green text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-brand-provider-green/20 hover:scale-105 transition-all">Approve Level</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed rounded-[40px] text-neutral-300 font-black uppercase text-sm">Select a provider to audit</div>
                )}
            </div>
        </div>
    )
}

function MatrixConfig() {
    return (
        <div className="bg-white border border-neutral-200 rounded-[40px] p-12 shadow-sm">
            <div className="max-w-4xl">
                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-800 mb-2">Verification Matrix Rules</h3>
                <p className="text-neutral-400 font-medium mb-12">Configure mandatory input checks for the 4-tier verification protocol (Section 238).</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <MatrixLevel
                        title="Standard"
                        color="text-blue-600"
                        items={["Gov. ID / Passport", "Profile Photo", "Phone Auth", "Criminal Background"]}
                    />
                    <MatrixLevel
                        title="Professional"
                        color="text-green-600"
                        items={["Certifications", "2 Years Experience Proof", "Reference Logs"]}
                    />
                    <MatrixLevel
                        title="Trade"
                        color="text-purple-600"
                        items={["Official Trade License", "Tool/Equipment Proof"]}
                    />
                    <MatrixLevel
                        title="High Vetting"
                        color="text-red-600"
                        items={["Formal Interview", "3 References Authentication"]}
                    />
                </div>
            </div>
        </div>
    )
}

function MatrixLevel({ title, color, items }: { title: string, color: string, items: string[] }) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <BadgeCheck className={color} size={20} />
                <h4 className="font-black uppercase tracking-tight text-lg">{title}</h4>
            </div>
            <ul className="space-y-4">
                {items.map((item, i) => (
                    <li key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <span className="text-sm font-bold text-neutral-700">{item}</span>
                        <div className="w-8 h-4 bg-neutral-200 rounded-full flex items-center px-1">
                            <div className="w-2.5 h-2.5 bg-white rounded-full translate-x-3.5 shadow-sm"></div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function ChecklistItem({ label, checked }: { label: string, checked?: boolean }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer">
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-brand-provider-green border-brand-provider-green' : 'border-neutral-200 group-hover:border-neutral-400'}`}>
                {checked && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <p className={`text-xs font-black uppercase tracking-tighter ${checked ? 'text-neutral-800' : 'text-neutral-400'}`}>{label}</p>
        </div>
    )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase transition-all tracking-widest ${
                active ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-400 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}
