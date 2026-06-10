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
  Filter
} from 'lucide-react';

export default function DisputeDesk() {
  const { countryCode } = useCountryStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/v1/admin/disputes?countryCode=${countryCode}`);
        const data = res.data.disputes || [];
        setTickets(data);
        if (data.length > 0 && !activeTicket) {
            setActiveTicket(data[0]);
        }
    } catch (e) {
        console.error('Failed to load disputes');
    } finally {
        setLoading(false);
    }
  };

  const loadChat = async (jobId: string) => {
    try {
        const res = await api.get(`/api/v1/chat/${jobId}`);
        setMessages(res.data.messages || []);
    } catch (e) {
        console.error('Failed to load chat history');
    }
  };

  useEffect(() => {
    if (countryCode) loadTickets();
  }, [countryCode]);

  useEffect(() => {
    if (activeTicket?.jobId) {
        loadChat(activeTicket.jobId);
    }
  }, [activeTicket]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Dispute Resolution Desk</h1>
          <p className="text-neutral-500 font-medium">Mediate conflicts, audit secure chat history, and adjust locked escrow funds.</p>
        </div>
        <div className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl border border-red-100 flex items-center gap-3">
            <AlertCircle size={20} className="animate-pulse" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Active Tickets</span>
                <span className="text-xl font-black leading-none">{tickets.length} Open</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List Sidebar */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-[750px]">
            <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Mediation Queue</h3>
                <div className="flex gap-2">
                    <button onClick={loadTickets} className="p-2 bg-white border rounded-lg text-neutral-400 hover:text-neutral-900"><RefreshCcw size={14} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 scrollbar-hide">
                {loading ? (
                    <div className="p-10 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading queue...</div>
                ) : tickets.length === 0 ? (
                    <div className="p-10 text-center text-neutral-400">No disputes found.</div>
                ) : (
                    tickets.map((t) => (
                        <div key={t._id} onClick={() => setActiveTicket(t)} className={`p-6 cursor-pointer hover:bg-neutral-50 transition-all ${activeTicket?._id === t._id ? 'bg-neutral-900 text-white shadow-lg' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black tracking-tight">{t.reason}</h4>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${t.status === 'OPEN' ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-600'}`}>{t.status}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTicket?._id === t._id ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                    {t.raisedBy?.firstName} • {String(t.jobId).slice(-6)}
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
        <div className="lg:col-span-2 space-y-8">
            {activeTicket ? (
                <div className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-800 flex items-center gap-3">
                                <Scale className="text-neutral-900" size={24} />
                                Ticket Mediation Workbench
                            </h3>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-1">Ticket ID: {activeTicket._id} | Job ID: {activeTicket.jobId}</p>
                        </div>
                        <button className="p-3 bg-neutral-100 rounded-2xl hover:bg-neutral-200 transition-all"><MoreVertical size={18} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Chat Vault */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest flex items-center gap-2">
                                    <Lock size={12} className="text-red-500" />
                                    Audit-Locked Chat Vault
                                </h4>
                                <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase">RESTRICTED ACCESS</span>
                            </div>

                            <div className="bg-neutral-50 border border-neutral-100 rounded-[32px] h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-hide flex flex-col">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-neutral-300 text-xs uppercase font-black">No chat records found.</div>
                                ) : (
                                    messages.map((m, idx) => (
                                        <ChatBubble key={idx} role={m.senderId?.role === 'CUSTOMER' ? 'CUSTOMER' : 'PROVIDER'} text={m.text} time={new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Escrow Adjuster */}
                        <div className="space-y-8 flex flex-col h-full">
                            <div className="flex-1">
                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest mb-6">Escrow Funds Adjuster</h4>
                                <div className="p-8 bg-neutral-900 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-customer-red blur-3xl opacity-20"></div>
                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Currently Locked in Escrow</p>
                                    <p className="text-4xl font-black mb-1">$350.00</p>
                                    <p className="text-[10px] text-brand-provider-green font-bold uppercase tracking-tighter italic">"12h release timer paused by dispute"</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest">Mediation Resolution</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <ResolutionButton label="Full Payout to Provider" icon={<Gavel size={14} />} />
                                    <ResolutionButton label="100% Refund to Customer" icon={<ArrowRight size={14} />} color="text-red-500 hover:bg-red-50 border-red-100" />
                                    <ResolutionButton label="Split: 50% / 50%" icon={<Scale size={14} />} />
                                </div>
                                <div className="mt-4 p-4 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                                    <p className="text-[10px] text-neutral-400 font-bold leading-relaxed uppercase tracking-tighter">Resolution requires admin override log. Every adjustment is recorded in System Audit Ledger (Section 311).</p>
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

function ResolutionButton({ label, icon, color = "text-neutral-900 hover:bg-neutral-50 border-neutral-200" }: { label: string, icon: React.ReactNode, color?: string }) {
    return (
        <button className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all group ${color}`}>
            <span className="flex items-center gap-3">
                {icon}
                {label}
            </span>
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
    )
}

function RefreshCcw({ size, className }: { size: number, className?: string }) {
    return <ArrowRight size={size} className={className} />
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
    return <ArrowRight size={size} className={className} />
}
