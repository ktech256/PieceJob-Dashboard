"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  MessageSquareWarning,
  MessageSquare,
  Search,
  ShieldAlert,
  Lock,
  ArrowRight,
  Gavel,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Scale,
  Filter,
  RefreshCcw,
  ChevronRight,
  User,
  Activity,
  History,
  Info
} from 'lucide-react';

export default function DisputeDesk() {
  const { countryCode } = useCountryStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("OPEN");

  const loadTickets = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/tickets?countryCode=${countryCode}&status=${activeTab}`);
        setTickets(res.data.tickets || []);
        if (res.data.tickets?.length > 0 && !activeTicket) {
            // Only set active if none selected
        }
    } catch (e) {
        console.error('Failed to load tickets');
    } finally {
        setLoading(false);
    }
  };

  const loadTicketDetail = async (id: string) => {
      try {
          const res = await api.get(`/api/admin/tickets/${id}`);
          setActiveTicket(res.data.ticket);
          loadChatVault(id);
      } catch (e) {
          console.error('Detail load failed');
      }
  };

  const loadChatVault = async (id: string) => {
    try {
        const res = await api.get(`/api/admin/tickets/${id}/chat-vault`);
        setMessages(res.data.messages || []);
    } catch (e) {
        console.error('Vault access restricted or failed');
    }
  };

  useEffect(() => {
    if (countryCode) loadTickets();
  }, [countryCode, activeTab]);

  const handleAssign = async () => {
      if (!activeTicket) return;
      try {
          // In a real app, get current admin ID from auth store
          await api.patch(`/api/admin/tickets/${activeTicket._id}/assign`, { adminId: "current_admin_id" });
          loadTicketDetail(activeTicket._id);
      } catch (e) {
          alert('Assignment failed');
      }
  };

  const handleSettle = async (decision: string, customerAmt: number, providerAmt: number, isVerified: boolean = false) => {
      if (!activeTicket) return;
      const reason = prompt(`Reason for ${decision}:`);
      if (!reason) return;

      try {
          if (isVerified) {
              await api.patch(`/api/admin/tickets/${activeTicket._id}/resolve`, {
                  status: 'RESOLVED',
                  isComplaintVerified: true,
                  internalNotes: reason
              });
          }
          await api.post(`/api/admin/tickets/${activeTicket._id}/settle`, {
              decision,
              customerAmount: customerAmt,
              providerAmount: providerAmt,
              reason
          });
          alert('Settlement processed successfully' + (isVerified ? '. Provider flagged for criminal check.' : ''));
          loadTickets();
          setActiveTicket(null);
      } catch (e: any) {
          alert(e.response?.data?.message || 'Settlement failed');
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Support & Dispute Center</h1>
          <p className="text-neutral-500 font-medium">Mediate conflicts, audit secure chat history, and adjust locked escrow funds.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            {['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        activeTab === tab ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List Sidebar */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-[800px]">
            <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Mediation Queue</h3>
                <div className="flex gap-2">
                    <button onClick={loadTickets} className="p-2 bg-white border rounded-lg text-neutral-400 hover:text-neutral-900 transition-all"><RefreshCcw size={14} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 scrollbar-hide">
                {loading ? (
                    <div className="p-10 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Syncing encrypted queue...</div>
                ) : tickets.length === 0 ? (
                    <div className="p-10 text-center text-neutral-400">No {activeTab.toLowerCase()} tickets found.</div>
                ) : (
                    tickets.map((t) => (
                        <div key={t._id} onClick={() => loadTicketDetail(t._id)} className={`p-6 cursor-pointer hover:bg-neutral-50 transition-all ${activeTicket?._id === t._id ? 'bg-neutral-900 text-white shadow-lg' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black tracking-tight text-sm uppercase">{t.type.replace('_', ' ')}</h4>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${t.priority === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-blue-600'}`}>{t.priority}</span>
                            </div>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${activeTicket?._id === t._id ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                {t.userId?.firstName} {t.userId?.lastName} • {t.userId?.role}
                            </p>
                            <div className="flex justify-between items-center">
                                <p className={`text-[10px] font-bold uppercase ${activeTicket?._id === t._id ? 'text-neutral-500' : 'text-neutral-300'}`}>
                                    ID: {t._id.slice(-6)}
                                </p>
                                <p className={`text-[10px] font-bold uppercase ${activeTicket?._id === t._id ? 'text-neutral-500' : 'text-neutral-300'}`}>
                                    {new Date(t.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Mediation Workbench */}
        <div className="lg:col-span-2 space-y-8 h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {activeTicket ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {/* Header Info */}
                    <div className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-800 flex items-center gap-3">
                                    <Scale className="text-neutral-900" size={24} />
                                    Mediation Workbench
                                </h3>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-1">Ticket ID: {activeTicket._id} | Country: {activeTicket.countryCode}</p>
                            </div>
                            <div className="flex gap-2">
                                {!activeTicket.assignedTo && (
                                    <button onClick={handleAssign} className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">Assign to Me</button>
                                )}
                                <button className="p-3 bg-neutral-100 rounded-2xl hover:bg-neutral-200 transition-all"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Summary */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2">Subject</h4>
                                    <p className="text-lg font-black text-neutral-900">{activeTicket.subject}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2">Description</h4>
                                    <p className="text-sm font-medium text-neutral-500 leading-relaxed">{activeTicket.description}</p>
                                </div>
                                <div className="pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
                                    <InfoCard label="Reporter" value={`${activeTicket.userId?.firstName} (${activeTicket.role})`} />
                                    <InfoCard label="Assigned Admin" value={activeTicket.assignedTo?.firstName || 'UNASSIGNED'} />
                                </div>
                            </div>

                            {/* Job Details */}
                            <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100">
                                <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-6 flex items-center gap-2">
                                    <Activity size={12} /> Linked Job Data
                                </h4>
                                {activeTicket.jobId ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-neutral-400 uppercase">Service</span>
                                            <span className="text-xs font-black text-neutral-900">{activeTicket.jobId?.serviceCode}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-neutral-400 uppercase">Escrow Value</span>
                                            <span className="text-sm font-black text-brand-provider-green">${activeTicket.jobId?.serviceFee?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-neutral-400 uppercase">Customer</span>
                                            <span className="text-xs font-black text-neutral-900">{activeTicket.jobId?.customerId?.firstName} {activeTicket.jobId?.customerId?.lastName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-neutral-400 uppercase">Provider</span>
                                            <span className="text-xs font-black text-neutral-900">{activeTicket.jobId?.providerId?.firstName} {activeTicket.jobId?.providerId?.lastName}</span>
                                        </div>
                                        <button className="w-full mt-4 py-2 bg-white border border-neutral-200 rounded-xl text-[10px] font-black uppercase hover:bg-neutral-900 hover:text-white transition-all">View Job Lifecycle</button>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-neutral-300 uppercase text-[10px] font-black">No Job Linked</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Vault & Settlement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="bg-white border border-neutral-200 rounded-[40px] p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest flex items-center gap-2">
                                    <Lock size={12} className="text-red-500" />
                                    Audit-Locked Chat Vault
                                </h4>
                                <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase">RESTRICTED</span>
                            </div>

                            <div className="bg-neutral-50 border border-neutral-100 rounded-[32px] h-[500px] overflow-y-auto p-6 space-y-4 scrollbar-hide flex flex-col">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-neutral-300 text-[10px] uppercase font-black text-center px-10">No message history or access restricted.</div>
                                ) : (
                                    messages.map((m, idx) => (
                                        <ChatBubble key={idx} role={m.senderId === activeTicket.jobId?.customerId?._id ? 'CUSTOMER' : 'PROVIDER'} text={m.text} time={new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                             <div className="bg-white border border-neutral-200 rounded-[40px] p-8 shadow-sm">
                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest mb-6">Escrow Settlement Decisions</h4>
                                <div className="p-8 bg-neutral-900 rounded-[32px] text-white shadow-xl mb-8">
                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Locked Escrow</p>
                                    <p className="text-4xl font-black text-brand-provider-green">${activeTicket.jobId?.serviceFee?.toFixed(2) || '0.00'}</p>
                                </div>

                                <div className="space-y-2">
                                    <ResolutionButton
                                        label="Release to Provider"
                                        icon={<Gavel size={14} />}
                                        onClick={() => handleSettle('RELEASE_TO_PROVIDER', 0, activeTicket.jobId?.serviceFee || 0)}
                                    />
                                    <ResolutionButton
                                        label="Refund Customer"
                                        icon={<ArrowRight size={14} />}
                                        color="text-red-500 hover:bg-red-50 border-red-100"
                                        onClick={() => handleSettle('RELEASE_TO_CUSTOMER', activeTicket.jobId?.serviceFee || 0, 0)}
                                    />
                                    <ResolutionButton
                                        label="Verify Complaint & Refund"
                                        icon={<ShieldAlert size={14} />}
                                        color="text-red-600 bg-red-50 border-red-200"
                                        onClick={() => handleSettle('RELEASE_TO_CUSTOMER', activeTicket.jobId?.serviceFee || 0, 0, true)}
                                    />
                                    <ResolutionButton
                                        label="Split 50/50"
                                        icon={<Scale size={14} />}
                                        onClick={() => handleSettle('SPLIT_SETTLEMENT', (activeTicket.jobId?.serviceFee || 0) / 2, (activeTicket.jobId?.serviceFee || 0) / 2)}
                                    />
                                </div>
                            </div>

                            <div className="bg-white border border-neutral-200 rounded-[40px] p-8 shadow-sm">
                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest mb-6 flex items-center gap-2">
                                    <History size={14} /> Resolution Timeline
                                </h4>
                                <div className="space-y-6">
                                    {activeTicket.timeline?.map((event: any, i: number) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2"></div>
                                            <div>
                                                <p className="text-[10px] font-black text-neutral-900 uppercase">{event.action}</p>
                                                <p className="text-[9px] text-neutral-400 font-bold uppercase">{new Date(event.timestamp).toLocaleString()}</p>
                                                {event.reason && <p className="text-[10px] text-neutral-500 mt-1 italic">"{event.reason}"</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed rounded-[40px] text-neutral-300 font-black uppercase text-sm">Select a ticket to begin mediation</div>
            )}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ role, text, time }: { role: 'CUSTOMER' | 'PROVIDER', text: string, time: string }) {
    return (
        <div className={`flex flex-col ${role === 'CUSTOMER' ? 'items-start' : 'items-end'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl text-xs font-medium ${role === 'CUSTOMER' ? 'bg-white text-neutral-700 shadow-sm border' : 'bg-neutral-900 text-white shadow-lg'}`}>
                {text}
            </div>
            <p className="text-[9px] font-black text-neutral-300 uppercase mt-1 px-2">{role} • {time}</p>
        </div>
    )
}

function ResolutionButton({ label, icon, color = "text-neutral-900 hover:bg-neutral-50 border-neutral-200", onClick }: { label: string, icon: React.ReactNode, color?: string, onClick?: () => void }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all group ${color}`}>
            <span className="flex items-center gap-3">
                {icon}
                {label}
            </span>
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
    )
}

function InfoCard({ label, value }: any) {
    return (
        <div>
            <h4 className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</h4>
            <p className="text-xs font-black text-neutral-900 uppercase">{value}</p>
        </div>
    )
}
