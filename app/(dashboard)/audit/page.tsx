"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import {
  ShieldCheck,
  CreditCard,
  UserCog,
  Search,
  Filter,
  Terminal,
  Eye,
  Download,
  Lock,
  Clock,
  ChevronDown,
  RefreshCcw
} from 'lucide-react';

export default function AuditLedgerPortal() {
  const [activeTab, setActiveTab] = useState("admin");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
        const type = activeTab === 'admin' ? 'PROVIDER|PRICING|SETTINGS' : activeTab === 'financial' ? 'WALLET|PAYOUT|REFUND' : 'USER';
        const res = await api.get(`/api/v1/admin/audit-logs?type=${type}`);
        setLogs(res.data.logs || []);
    } catch (e) {
        console.error('Failed to load audit logs');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [activeTab]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Immutable System Ledger</h1>
          <p className="text-neutral-500 font-medium">Global cryptographic trace of administrative and financial mutations.</p>
        </div>
        <div className="flex gap-3">
             <button className="bg-white border border-neutral-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 transition-all">
                <Download size={14} /> Export Audit Log
            </button>
            <div className="bg-neutral-900 text-white px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl">
                <Terminal size={18} className="text-brand-customer-red" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Append-Only Active</span>
            </div>
        </div>
      </div>

      {/* SECTION 13 & 24: LOG CATEGORIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TabCard
            active={activeTab === "admin"}
            onClick={() => setActiveTab("admin")}
            label="ADMIN_ACTION"
            sub="Price, Vetting & Rules"
            icon={<ShieldCheck size={20} />}
            count="458 Events"
        />
        <TabCard
            active={activeTab === "financial"}
            onClick={() => setActiveTab("financial")}
            label="FINANCIAL_MUTATION"
            sub="Ledger & Wallet Balance"
            icon={<CreditCard size={20} />}
            count="2.1k Events"
        />
        <TabCard
            active={activeTab === "user"}
            onClick={() => setActiveTab("user")}
            label="USER_MODIFICATION"
            sub="Account Security Data"
            icon={<UserCog size={20} />}
            count="124 Events"
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[40px] overflow-hidden shadow-sm flex flex-col h-[650px]">
        <div className="p-8 border-b flex justify-between items-center bg-neutral-50/30">
            <div className="flex gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                    <input type="text" placeholder="Search event payload, actor..." className="pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-brand-customer-red w-72" />
                </div>
                <button className="flex items-center gap-2 border bg-white px-4 py-2 rounded-xl text-xs font-black uppercase text-neutral-400 hover:text-neutral-800 transition-all">
                    <Filter size={14} /> Filters
                </button>
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Showing: {activeTab === "admin" ? "Structural Mutations" : activeTab === "financial" ? "Ledger Traces" : "Identity Overrides"}</p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm border-b text-[10px] uppercase font-black text-neutral-400 z-10">
                    <tr>
                        <th className="px-10 py-5">Timestamp</th>
                        <th className="px-10 py-5">Actor / ID</th>
                        <th className="px-10 py-5">Mutation</th>
                        <th className="px-10 py-5">Security Trace</th>
                        <th className="px-10 py-5 text-right">JSON</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-xs">
                    {loading ? (
                        <tr><td colSpan={5} className="px-10 py-10 text-center text-neutral-300 font-black uppercase text-[10px]">Loading audit trail...</td></tr>
                    ) : logs.length === 0 ? (
                        <tr><td colSpan={5} className="px-10 py-10 text-center text-neutral-400">No audit events recorded for this category.</td></tr>
                    ) : (
                        logs.map((log, i) => (
                            <tr key={log._id} className="hover:bg-neutral-50/50 transition-all">
                                <td className="px-10 py-6 font-mono text-[10px] text-neutral-400">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="px-10 py-6">
                                    <p className="font-black text-neutral-800 tracking-tight">{log.adminId?.firstName} {log.adminId?.lastName || 'System'}</p>
                                    <span className="text-[9px] font-black bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 uppercase tracking-tighter mt-1 inline-block">{log.action}</span>
                                </td>
                                <td className="px-10 py-6 italic text-neutral-500 font-medium truncate max-w-md">
                                    {log.targetCollection}: {log.targetId}
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lock size={10} className="text-brand-provider-green" />
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{log.ipAddress || 'Internal'}</span>
                                    </div>
                                    <p className="text-[8px] font-mono text-neutral-300 truncate max-w-[120px]">{log._id}</p>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <button className="p-2.5 bg-neutral-50 rounded-xl text-neutral-400 hover:text-brand-customer-red hover:bg-neutral-100 transition-all"><Eye size={16} /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="p-4 bg-neutral-900 border-t border-white/5 flex justify-center items-center gap-4">
             <div className="flex items-center gap-2 text-white/40">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronization lag: 0.12ms</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-brand-provider-green animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

function TabCard({ active, onClick, label, sub, icon, count }: { active: boolean, onClick: () => void, label: string, sub: string, icon: React.ReactNode, count: string }) {
    return (
        <div
            onClick={onClick}
            className={`p-8 rounded-[32px] border-2 cursor-pointer transition-all flex flex-col justify-between h-48 relative overflow-hidden group ${
                active
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-2xl scale-[1.02] z-10'
                : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'
            }`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-all ${active ? 'bg-brand-customer-red' : 'bg-neutral-300'}`}></div>
            <div className="relative z-10">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-6 transition-all ${active ? 'bg-white/10 text-brand-customer-red' : 'bg-neutral-50 text-neutral-300'}`}>
                    {icon}
                </div>
                <h4 className="font-black uppercase tracking-tighter text-sm">{label}</h4>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${active ? 'text-neutral-500' : 'text-neutral-300'}`}>{sub}</p>
            </div>
            <div className="relative z-10 flex justify-between items-end mt-4">
                <p className={`text-xl font-black ${active ? 'text-white' : 'text-neutral-800'}`}>{count}</p>
                {active && <ChevronDown size={20} className="text-brand-customer-red animate-bounce" />}
            </div>
        </div>
    )
}
