"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import { formatDateTime } from '@/lib/utils';
import {
  ShieldCheck,
  CreditCard,
  UserCog,
  Search,
  Terminal,
  Eye,
  Download,
  Lock,
  ChevronDown,
  RefreshCcw,
  MessageSquare,
  XCircle,
  Code
} from 'lucide-react';

export default function AuditLedgerPortal() {
  const { countryCode, currentCountry } = useCountryStore();
  const [activeTab, setActiveTab] = useState("ADMIN_ACTION");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/v1/admin/audit-logs?auditType=${activeTab}&countryCode=${countryCode}`);
        setLogs(res.data.logs || []);
    } catch (e) {
        console.error('Failed to load audit logs');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadLogs();
  }, [activeTab, countryCode]);

  const filtered = logs.filter(l =>
    l.auditId.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entityId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
      const csvContent = "data:text/csv;charset=utf-8,"
          + ["ID,Timestamp,Actor,Action,Type"].join(",") + "\n"
          + filtered.map(l => `${l.auditId},${l.timestampUTC},${l.adminId?.firstName || 'System'},${l.action},${l.auditType}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `audit_log_${activeTab}_${countryCode}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Immutable System Ledger</h1>
          <p className="text-neutral-500 font-medium">Global cryptographic trace of administrative and financial mutations.</p>
        </div>
        <div className="flex gap-3">
             <button onClick={handleExport} className="bg-white border border-neutral-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 transition-all">
                <Download size={14} /> Export CSV
            </button>
            <div className="bg-neutral-900 text-white px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl">
                <Terminal size={18} className="text-brand-customer-red" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Append-Only Active</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TabCard active={activeTab === "ADMIN_ACTION"} onClick={() => setActiveTab("ADMIN_ACTION")} label="ADMIN_ACTION" sub="Vetting & Rules" icon={<ShieldCheck size={20} />} />
        <TabCard active={activeTab === "FINANCIAL_MUTATION"} onClick={() => setActiveTab("FINANCIAL_MUTATION")} label="FINANCIAL_MUTATION" sub="Ledger & Wallet" icon={<CreditCard size={20} />} />
        <TabCard active={activeTab === "USER_MODIFICATION"} onClick={() => setActiveTab("USER_MODIFICATION")} label="USER_MODIFICATION" sub="Security & Profile" icon={<UserCog size={20} />} />
        <TabCard active={activeTab === "CHAT_ACCESS"} onClick={() => setActiveTab("CHAT_ACCESS")} label="CHAT_ACCESS" sub="Dispute & SOS Review" icon={<MessageSquare size={20} />} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[40px] overflow-hidden shadow-sm flex flex-col h-[650px]">
        <div className="p-8 border-b flex justify-between items-center bg-neutral-50/30">
            <div className="flex gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search audit ID, action..."
                        className="pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-brand-customer-red w-72"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button onClick={loadLogs} className="p-2 hover:bg-neutral-100 rounded-xl transition-all"><RefreshCcw size={16} /></button>
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Workspace: {countryCode} | Protocol Trace</p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm border-b text-[10px] uppercase font-black text-neutral-400 z-10">
                    <tr>
                        <th className="px-10 py-5">Audit ID</th>
                        <th className="px-10 py-5">Timestamp ({currentCountry?.timezone || 'UTC'})</th>
                        <th className="px-10 py-5">Actor / ID</th>
                        <th className="px-10 py-5">Action</th>
                        <th className="px-10 py-5 text-right">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-xs font-bold">
                    {loading ? (
                        <tr><td colSpan={5} className="px-10 py-20 text-center text-neutral-300 font-black uppercase text-[10px] animate-pulse">Establishing Secure Ledger Handshake...</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={5} className="px-10 py-20 text-center text-neutral-400 uppercase text-xs">No records found for this workspace cluster.</td></tr>
                    ) : (
                        filtered.map((log) => (
                            <tr key={log._id} className="hover:bg-neutral-50/50 transition-all group">
                                <td className="px-10 py-6 font-mono text-[10px] text-neutral-400">{log.auditId}</td>
                                <td className="px-10 py-6 text-neutral-500">
                                    {formatDateTime(log.timestampUTC || log.createdAt, currentCountry?.timezone, currentCountry?.locale)}
                                </td>
                                <td className="px-10 py-6">
                                    <p className="text-neutral-900 uppercase">{log.adminId?.firstName || log.userId?.firstName || 'System'}</p>
                                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{log.adminRole || 'Platform'}</p>
                                </td>
                                <td className="px-10 py-6">
                                    <span className="text-[10px] font-black bg-neutral-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter">{log.action}</span>
                                    <p className="text-[9px] text-neutral-400 mt-1 uppercase">{log.entityType}: {log.entityId?.slice(-6)}</p>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <button onClick={() => setSelectedLog(log)} className="p-2.5 bg-neutral-100 rounded-xl text-neutral-500 hover:text-brand-customer-red hover:bg-neutral-200 transition-all shadow-sm"><Eye size={16} /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-10 border-b bg-neutral-50/50 flex justify-between items-center">
                      <div>
                          <h3 className="text-2xl font-black uppercase tracking-tight">Audit Event Detail</h3>
                          <p className="text-[10px] font-black text-neutral-400 uppercase mt-1">Immutable Trace ID: {selectedLog.auditId}</p>
                      </div>
                      <button onClick={() => setSelectedLog(null)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><XCircle size={24} className="text-neutral-300" /></button>
                  </div>
                  <div className="p-10 space-y-8 h-[500px] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 gap-8">
                          <DetailItem label="Action" value={selectedLog.action} />
                          <DetailItem label="Audit Type" value={selectedLog.auditType} />
                          <DetailItem label="Triggered By" value={selectedLog.adminId ? 'ADMIN' : 'SYSTEM/USER'} />
                          <DetailItem label="IP Address" value={selectedLog.ipAddress || 'Internal'} />
                      </div>

                      {/* State Comparison */}
                      {(selectedLog.beforeState || selectedLog.afterState) && (
                          <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Structural Delta</h4>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100">
                                      <p className="text-[8px] font-black text-neutral-400 uppercase mb-4">Before</p>
                                      <pre className="text-[9px] font-mono text-neutral-600 overflow-x-auto">{JSON.stringify(selectedLog.beforeState, null, 2)}</pre>
                                  </div>
                                  <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100">
                                      <p className="text-[8px] font-black text-neutral-400 uppercase mb-4">After</p>
                                      <pre className="text-[9px] font-mono text-neutral-600 overflow-x-auto">{JSON.stringify(selectedLog.afterState, null, 2)}</pre>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Financial Detail */}
                      {selectedLog.financialInfo && (
                          <div className="p-8 bg-neutral-900 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-customer-red blur-3xl opacity-20"></div>
                               <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                   <Code size={12} /> Transaction Chain Verification
                               </h4>
                               <div className="space-y-4">
                                   <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                       <span className="text-[10px] font-bold text-neutral-400 uppercase">Mutation Type</span>
                                       <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${selectedLog.financialInfo.mutationType === 'CREDIT' ? 'bg-green-500' : 'bg-red-500'}`}>{selectedLog.financialInfo.mutationType}</span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-neutral-400 uppercase">Amount</span>
                                       <span className="text-xl font-black">${selectedLog.financialInfo.amountUSD.toFixed(2)}</span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-neutral-400 uppercase">Balance Delta</span>
                                       <span className="text-xs font-mono font-bold">${selectedLog.financialInfo.previousBalance.toFixed(2)} → ${selectedLog.financialInfo.newBalance.toFixed(2)}</span>
                                   </div>
                               </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function TabCard({ active, onClick, label, sub, icon }: { active: boolean, onClick: () => void, label: string, sub: string, icon: React.ReactNode }) {
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
            <div className="relative z-10 flex justify-end items-end">
                {active && <ChevronDown size={20} className="text-brand-customer-red animate-bounce" />}
            </div>
        </div>
    )
}

function DetailItem({ label, value }: any) {
    return (
        <div>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-black text-neutral-900 uppercase">{value || 'N/A'}</p>
        </div>
    )
}
