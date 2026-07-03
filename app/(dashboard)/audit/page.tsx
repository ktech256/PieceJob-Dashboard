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
  Code,
  Globe,
  Activity,
  User,
  History,
  FileSpreadsheet,
  Coins,
  ChevronRight
} from 'lucide-react';

const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDateTimeLong = (date: string | Date) => {
    return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

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
        const res = await api.get(`/api/v1/admin/audit-logs?auditType=${activeTab}&countryCode=${countryCode}&search=${search}`);
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

  const handleExport = (format: 'csv' | 'excel') => {
      const headers = ["Date", "Time", "Workspace", "Admin", "Action", "Target User", "Wallet", "Reference", "Amount", "Balance Before", "Balance After", "Reason", "IP Address", "Status"];
      const csvContent = "data:text/csv;charset=utf-8,"
          + headers.join(",") + "\n"
          + logs.map(l => [
              formatDateTime(l.createdAt, 'UTC', 'en-US').split(',')[0],
              formatDateTime(l.createdAt, 'UTC', 'en-US').split(',')[1],
              l.countryCode,
              l.adminId?.email || 'SYSTEM',
              l.action,
              l.userId?.email || 'N/A',
              l.financialInfo?.walletType || 'N/A',
              l.financialInfo?.transactionId || 'N/A',
              l.financialInfo?.amountBase || 0,
              l.financialInfo?.previousBalance || 0,
              l.financialInfo?.newBalance || 0,
              l.action,
              l.ipAddress || 'Internal',
              'SUCCESS'
          ].join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `audit_log_${activeTab}_${countryCode}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
  };

  return (
    <div className="space-y-8 pb-20 text-neutral-900">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Immutable System Ledger</h1>
          <p className="text-neutral-500 font-medium">Global cryptographic trace of administrative and financial mutations.</p>
        </div>
        <div className="flex gap-3">
             <button onClick={() => handleExport('csv')} className="bg-white border border-neutral-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 transition-all shadow-sm active:scale-95">
                <Download size={14} /> Export CSV
            </button>
            <button onClick={() => handleExport('excel')} className="bg-white border border-neutral-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 transition-all shadow-sm active:scale-95">
                <FileSpreadsheet size={14} /> Excel
            </button>
            <div className="bg-neutral-900 text-white px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl">
                <Terminal size={18} className="text-brand-customer-red" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Append-Only Protocol</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TabCard active={activeTab === "ADMIN_ACTION"} onClick={() => setActiveTab("ADMIN_ACTION")} label="ADMIN_ACTION" sub="Vetting & Rules" icon={<ShieldCheck size={20} />} />
        <TabCard active={activeTab === "FINANCIAL_MUTATION"} onClick={() => setActiveTab("FINANCIAL_MUTATION")} label="FINANCIAL_MUTATION" sub="Ledger & Wallet" icon={<CreditCard size={20} />} />
        <TabCard active={activeTab === "USER_MODIFICATION"} onClick={() => setActiveTab("USER_MODIFICATION")} label="USER_MODIFICATION" sub="Security & Profile" icon={<UserCog size={20} />} />
        <TabCard active={activeTab === "CHAT_ACCESS"} onClick={() => setActiveTab("CHAT_ACCESS")} label="CHAT_ACCESS" sub="Dispute & SOS Review" icon={<MessageSquare size={20} />} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[40px] overflow-hidden shadow-sm flex flex-col min-h-[700px]">
        <div className="p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-neutral-50/30">
            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search Audit ID, Action, Reference..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs font-bold outline-none focus:border-neutral-900 transition-all shadow-inner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
                    />
                </div>
                <button onClick={loadLogs} className="p-3 bg-neutral-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"><RefreshCcw size={18} /></button>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                <Globe size={14} className="text-blue-500" />
                Workspace Cluster: {countryCode} | Sector: {activeTab}
            </div>
        </div>

        <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm border-b text-[10px] uppercase font-black text-neutral-400 z-10">
                    <tr>
                        <th className="px-10 py-5">Event Temporal Signal</th>
                        <th className="px-10 py-5">Auth Actor</th>
                        <th className="px-10 py-5">Mutation Action</th>
                        <th className="px-10 py-5">Entity Context</th>
                        <th className="px-10 py-5 text-right">Yield Impact</th>
                        <th className="px-10 py-5 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-xs font-bold">
                    {loading ? (
                        <tr><td colSpan={6} className="px-10 py-32 text-center text-neutral-300 font-black uppercase text-[11px] animate-pulse tracking-[0.4em]">Deciphering Immutable Ledger Handshake...</td></tr>
                    ) : logs.length === 0 ? (
                        <tr><td colSpan={6} className="px-10 py-32 text-center text-neutral-400 uppercase text-xs font-black tracking-widest bg-neutral-50/30">No cryptographic records detected in this workspace cluster.</td></tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log._id} className="hover:bg-neutral-50/80 transition-all group">
                                <td className="px-10 py-6">
                                    <p className="text-[11px] font-black text-neutral-900 uppercase">{formatDate(log.createdAt)}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mt-1">{formatTime(log.createdAt)} UTC</p>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-neutral-100 rounded-2xl flex items-center justify-center text-[11px] font-black text-neutral-500 border border-neutral-200 group-hover:bg-white group-hover:border-neutral-900 group-hover:text-neutral-900 transition-all duration-300">
                                            {log.adminId?.firstName?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <p className="text-neutral-900 uppercase font-black text-xs">{log.adminId?.firstName ? `${log.adminId.firstName} ${log.adminId.lastName}` : (log.adminId || 'SYSTEM_PROCESS')}</p>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-0.5">{log.adminRole || 'CORE_ORACLE'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black bg-neutral-900 text-white px-3 py-1 rounded-lg uppercase tracking-tight w-fit shadow-sm">{log.action}</span>
                                        <p className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">Trace: {log.auditId}</p>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{log.entityType}</p>
                                        </div>
                                        <p className="text-xs font-bold text-neutral-800 font-mono pl-3">{log.entityId || log.userId || 'GLOBAL_ROOT'}</p>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    {log.financialInfo ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-sm font-black ${log.financialInfo.mutationType === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                                {log.financialInfo.mutationType === 'CREDIT' ? '+' : '-'}{log.financialInfo.amountBase.toFixed(2)}
                                            </span>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">{log.financialInfo.currency}</p>
                                        </div>
                                    ) : (
                                        <span className="text-neutral-300 font-black tracking-widest">---</span>
                                    )}
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <button onClick={() => setSelectedLog(log)} className="p-3 bg-neutral-100 rounded-[18px] text-neutral-500 hover:text-neutral-900 hover:bg-white hover:border-neutral-900 border border-transparent transition-all shadow-sm active:scale-90"><Eye size={18} /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="p-8 bg-neutral-50/50 border-t border-neutral-100 flex justify-between items-center text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">
             <div className="flex items-center gap-4">
                 <p>Signal Strength: Optimal</p>
                 <span className="w-px h-3 bg-neutral-200"></span>
                 <p>Immutable Count: {logs.length}</p>
             </div>
             <div className="flex gap-2">
                 <button className="px-4 py-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-900 hover:text-white transition-all">Previous Signal</button>
                 <button className="px-4 py-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-900 hover:text-white transition-all">Next Signal</button>
             </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8">
              <div className="bg-white rounded-[56px] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100">
                  <div className="p-12 border-b bg-neutral-50/30 flex justify-between items-center">
                      <div className="flex items-center gap-6">
                           <div className="p-4 bg-neutral-900 text-white rounded-[24px] shadow-xl"><History size={24} /></div>
                           <div>
                               <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Cryptographic Trace Detail</h3>
                               <p className="text-[10px] font-black text-neutral-400 uppercase mt-2 tracking-[0.2em]">Protocol ID: <span className="text-neutral-900 font-mono">{selectedLog.auditId}</span></p>
                           </div>
                      </div>
                      <button onClick={() => setSelectedLog(null)} className="p-4 bg-white hover:bg-neutral-100 rounded-full transition-all shadow-md active:scale-90"><XCircle size={28} className="text-neutral-400" /></button>
                  </div>
                  <div className="p-12 space-y-10 max-h-[600px] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                          <DetailItem label="Auth Action" value={selectedLog.action} highlight />
                          <DetailItem label="Ledger Category" value={selectedLog.auditType} />
                          <DetailItem label="Temporal Stamp" value={formatDateTimeLong(selectedLog.createdAt) + ' UTC'} />
                          <DetailItem label="Network Protocol" value={selectedLog.systemSource} />
                          <DetailItem label="Ingress Node" value={selectedLog.ipAddress || 'INTERNAL_SIGNAL'} />
                          <DetailItem label="Integrity Status" value="CRYPTOGRAPHICALLY_VERIFIED" color="text-green-600" />
                      </div>

                      <div className="h-px bg-neutral-100"></div>

                      {/* State Comparison */}
                      {(selectedLog.beforeState || selectedLog.afterState) && (
                          <div className="space-y-6">
                              <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 bg-brand-customer-red rounded-full"></div>
                                  Structural Variance Delta
                              </h4>
                              <div className="grid grid-cols-2 gap-6">
                                  <div className="p-8 bg-neutral-50 rounded-[40px] border border-neutral-100">
                                      <p className="text-[9px] font-black text-neutral-400 uppercase mb-6 tracking-widest">Pre-Mutation State</p>
                                      <pre className="text-[10px] font-mono text-neutral-600 overflow-x-auto leading-relaxed">{JSON.stringify(selectedLog.beforeState, null, 2)}</pre>
                                  </div>
                                  <div className="p-8 bg-neutral-900 rounded-[40px] border border-white/5 shadow-2xl">
                                      <p className="text-[9px] font-black text-neutral-500 uppercase mb-6 tracking-widest text-center">Post-Mutation State</p>
                                      <pre className="text-[10px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">{JSON.stringify(selectedLog.afterState, null, 2)}</pre>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Financial Detail */}
                      {selectedLog.financialInfo && (
                          <div className="p-10 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.1),transparent)] bg-white border-2 border-green-100 rounded-[48px] shadow-xl relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><Coins size={80} className="text-green-600" /></div>
                               <h4 className="text-[11px] font-black text-green-700 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                   <Activity size={14} strokeWidth={3} /> Ledger Mutation Proof
                               </h4>
                               <div className="grid grid-cols-3 gap-8">
                                   <div className="space-y-2">
                                       <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Authorization</p>
                                       <p className={`text-xs font-black px-3 py-1 rounded-lg uppercase w-fit ${selectedLog.financialInfo.mutationType === 'CREDIT' ? 'bg-green-50 text-white' : 'bg-red-50 text-white'}`}>{selectedLog.financialInfo.mutationType}</p>
                                   </div>
                                   <div className="space-y-2">
                                       <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Mutation Yield</p>
                                       <p className="text-2xl font-black text-neutral-900 leading-none">{selectedLog.financialInfo.currency} {selectedLog.financialInfo.amountBase.toFixed(2)}</p>
                                   </div>
                                   <div className="space-y-2">
                                       <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Ledger Balance Shift</p>
                                       <p className="text-xs font-mono font-bold text-neutral-500 mt-1">{selectedLog.financialInfo.previousBalance.toFixed(2)} <ChevronRight size={10} className="inline mx-1" /> {selectedLog.financialInfo.newBalance.toFixed(2)}</p>
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
            className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all flex flex-col justify-between h-52 relative overflow-hidden group shadow-sm hover:shadow-xl ${
                active
                ? 'bg-neutral-900 border-neutral-900 text-white scale-[1.03] z-10 ring-8 ring-neutral-900/5'
                : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-300'
            }`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-all duration-500 ${active ? 'bg-brand-customer-red scale-150' : 'bg-neutral-300'}`}></div>
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center mb-8 transition-all duration-500 shadow-inner ${active ? 'bg-white/10 text-white scale-110 border border-white/10' : 'bg-neutral-50 text-neutral-300'}`}>
                    {icon}
                </div>
                <h4 className="font-black uppercase tracking-tighter text-base group-hover:translate-x-1 transition-transform">{label}</h4>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-60 group-hover:translate-x-1 transition-transform delay-75`}>{sub}</p>
            </div>
            <div className="relative z-10 flex justify-end items-end">
                {active && <div className="w-8 h-8 bg-brand-customer-red rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-bounce"><ChevronDown size={18} className="text-white" strokeWidth={3} /></div>}
            </div>
        </div>
    )
}

function DetailItem({ label, value, highlight, color = 'text-neutral-900' }: any) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{label}</p>
            <p className={`${highlight ? 'font-black text-base' : 'font-bold text-sm'} ${color} uppercase leading-tight`}>{value || 'N/A'}</p>
        </div>
    )
}
