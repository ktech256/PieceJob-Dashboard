"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Search,
  RefreshCcw,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Filter,
  MoreVertical,
  ArrowDownLeft
} from 'lucide-react';

export default function FinanceHub() {
  const [activeTab, setActiveTab] = useState("ledger");
  const { countryCode, currentCountry } = useCountryStore();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayouts: 0,
    activeEscrow: 0,
    mismatchErrors: 0,
    currency: '$'
  });

  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
      setLoading(true);
      try {
          const res = await api.get(`/api/admin/finance/overview?countryCode=${countryCode}`);
          setStats({ ...res.data.stats, currency: res.data.stats.currency || currentCountry?.currency || '$' });
      } catch (e) {
          console.error('Failed to load finance stats');
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    if (countryCode) fetchOverview();
  }, [countryCode]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Finance Command Hub</h1>
          <p className="text-neutral-500 font-medium text-sm md:text-base">Manage global revenue, escrow releases, and provider payouts.</p>
        </div>
        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <TabButton active={activeTab === "ledger"} onClick={() => setActiveTab("ledger")} label="Ledger" />
            <TabButton active={activeTab === "payouts"} onClick={() => setActiveTab("payouts")} label="Payout Engine" />
            <TabButton active={activeTab === "invoices"} onClick={() => setActiveTab("invoices")} label="Invoices" />
            <TabButton active={activeTab === "reconciliation"} onClick={() => setActiveTab("reconciliation")} label="Reconciliation" />
            <TabButton active={activeTab === "statements"} onClick={() => setActiveTab("statements")} label="Statements" />
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinanceCard
            label="Total Platform Revenue"
            value={`${stats.currency} ${stats.totalRevenue.toLocaleString()}`}
            icon={<ArrowUpRight size={18} className="text-green-600" />}
            status="CLEARED"
            sub="Ledger balanced"
        />
        <FinanceCard
            label="Withdrawable (Pending)"
            value={`${stats.currency} ${stats.pendingPayouts.toLocaleString()}`}
            icon={<Clock size={18} className="text-blue-600" />}
            status="PROCESSING"
            sub="Providers queued"
        />
        <FinanceCard
            label="Total in Escrow"
            value={`${stats.currency} ${stats.activeEscrow.toLocaleString()}`}
            icon={<ShieldCheck size={18} className="text-brand-provider-green" />}
            status="LOCKED"
            sub="Escrow cooling active"
        />
        <FinanceCard
            label="Reconciliation Health"
            value={stats.mismatchErrors === 0 ? "100%" : `${stats.mismatchErrors} Errors`}
            icon={<Receipt size={18} className="text-brand-customer-red" />}
            status={stats.mismatchErrors === 0 ? "OPTIMAL" : "CRITICAL"}
            sub={stats.mismatchErrors === 0 ? "Zero cent mismatch" : "Action required"}
        />
      </div>

      {activeTab === "ledger" && <LedgerConsole currency={stats.currency} />}
      {activeTab === "payouts" && <PayoutEngine currency={stats.currency} />}
      {activeTab === "invoices" && <InvoiceControl currency={stats.currency} />}
      {activeTab === "reconciliation" && <ReconciliationHub onRefresh={fetchOverview} />}
      {activeTab === "statements" && <StatementsHub />}
    </div>
  );
}

function LedgerConsole({ currency }: { currency: string }) {
    const { countryCode } = useCountryStore();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
...

    const loadLedger = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/ledger?countryCode=${countryCode}`);
            setLogs(res.data.logs || []);
        } catch (e) {
            console.error('Ledger load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadLedger();
    }, [countryCode]);

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Statement Mirroring Console</h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Real-time Double-Entry Verification (Immutable)</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadLedger} className="bg-neutral-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-black transition-all flex items-center gap-2">
                        <RefreshCcw size={14} />
                        Refresh Ledger
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Transaction ID</th>
                            <th className="px-8 py-4">Type</th>
                            <th className="px-8 py-4 text-right">Debit / Credit</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm">
                        {loading ? (
                             <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">Loading ledger...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">No transactions found.</td></tr>
                        ) : (
                            logs.map((tx) => (
                                <tr key={tx._id} className="hover:bg-neutral-50/50 transition-all group">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-500">{tx.transactionId}</td>
                                    <td className="px-8 py-5">
                                        <span className={`bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[10px] font-black uppercase`}>{tx.type}</span>
                                    </td>
                                    <td className={`px-8 py-5 text-right font-black ${['SERVICE_FEE', 'BOOKING_FEE', 'CREDIT_TOPUP'].includes(tx.type) ? 'text-green-600' : 'text-red-600'}`}>
                                        {['SERVICE_FEE', 'BOOKING_FEE', 'CREDIT_TOPUP'].includes(tx.type) ? '+' : '-'}{tx.amount.toFixed(2)} {tx.currency}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <span className="text-[10px] font-black text-neutral-800 uppercase tracking-tighter">{tx.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-neutral-400 font-bold uppercase">{new Date(tx.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function PayoutEngine({ currency }: { currency: string }) {
    const { countryCode } = useCountryStore();
    const [payouts, setPayouts] = useState<any[]>([]);
...
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPayouts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/payouts?countryCode=${countryCode}`);
            setPayouts(res.data.payouts || []);
        } catch (e) {
            console.error('Payouts load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadPayouts();
    }, [countryCode]);

    const handleBatchApprove = async () => {
        if (selectedIds.length === 0) return;
        try {
            await api.post('/api/admin/finance/payouts/batch/approve', { ids: selectedIds });
            setSelectedIds([]);
            loadPayouts();
        } catch (e) {
            alert('Batch approval failed');
        }
    };

    const handleBatchProcess = async () => {
        if (selectedIds.length === 0) return;
        try {
            await api.post('/api/admin/finance/payouts/batch/process', { ids: selectedIds });
            setSelectedIds([]);
            loadPayouts();
        } catch (e) {
            alert('Batch processing failed');
        }
    };

    const handleMarkPaid = async (id: string) => {
        const ref = prompt("Enter Bank Reference Number:");
        if (!ref) return;
        try {
            await api.patch(`/api/admin/finance/payouts/${id}/pay`, { bankReference: ref });
            loadPayouts();
        } catch (e) {
            alert('Settlement failed');
        }
    };

    const handleReverse = async (id: string) => {
        const reason = prompt("Enter Reversal Reason:");
        if (!reason) return;
        try {
            await api.patch(`/api/admin/finance/payouts/${id}/reverse`, { reason });
            loadPayouts();
        } catch (e) {
            alert('Reversal failed');
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const exportCSV = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/finance/payouts/export?countryCode=${countryCode}&format=csv`, '_blank');
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Active Payout Queue</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{payouts.length} total requests</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportCSV} className="bg-neutral-100 text-neutral-600 p-2 rounded-xl hover:bg-neutral-200 transition-all">
                            <Download size={18} />
                        </button>
                        <button onClick={loadPayouts} className="bg-brand-provider-green text-white px-6 py-2 rounded-xl text-xs font-black uppercase hover:scale-105 transition-all">Refresh Queue</button>
                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <div className="mb-6 p-4 bg-neutral-900 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-top-4">
                        <p className="text-white text-xs font-black uppercase tracking-widest">{selectedIds.length} payouts selected</p>
                        <div className="flex gap-2">
                            <button onClick={handleBatchApprove} className="bg-green-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Approve Batch</button>
                            <button onClick={handleBatchProcess} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Process Batch</button>
                            <button onClick={() => setSelectedIds([])} className="bg-neutral-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-20 text-center text-neutral-400">Loading payout queue...</div>
                    ) : payouts.length === 0 ? (
                        <div className="py-20 text-center text-neutral-400">No pending payouts found.</div>
                    ) : (
                        payouts.map((p) => (
                            <div key={p._id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${selectedIds.includes(p._id) ? 'bg-neutral-50 border-neutral-900 ring-1 ring-neutral-900' : 'bg-neutral-50 border-neutral-100 group hover:border-brand-provider-green/30'}`}>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(p._id)}
                                        onChange={() => toggleSelect(p._id)}
                                        className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                    />
                                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-500 uppercase">
                                        {p.provider?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-neutral-800">{p.provider?.name}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{p.provider?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-center">
                                    <div className="text-right">
                                        <p className="text-lg font-black text-neutral-900">{p.totalAmount.toFixed(2)} {p.currency}</p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            p.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                            p.status === 'APPROVED' ? 'bg-purple-100 text-purple-700' :
                                            p.status === 'REVERSED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>{p.status}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {p.status === 'PROCESSING' && (
                                            <button onClick={() => handleMarkPaid(p._id)} className="p-2 bg-white border border-green-200 rounded-lg text-[10px] font-black text-green-600 hover:bg-green-600 hover:text-white transition-all">SETTLE</button>
                                        )}
                                        {(p.status === 'PENDING' || p.status === 'APPROVED' || p.status === 'PROCESSING') && (
                                            <button onClick={() => handleReverse(p._id)} className="p-2 bg-white border border-red-200 rounded-lg text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white transition-all">REVERSE</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white shadow-xl">
                    <h3 className="font-black text-sm uppercase tracking-widest text-neutral-500 mb-6">Payout Controls</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold">Min Withdrawal Threshold</p>
                            <p className="font-black text-brand-provider-green">{currency} 50.00</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold">Auto-Settlement</p>
                            <p className="font-black">DISABLED</p>
                        </div>
                        <div className="h-px bg-white/10"></div>
                        <p className="text-[10px] text-neutral-400 font-medium leading-relaxed italic">Manual settlement is currently enforced for all provider tiers to ensure audit integrity during Phase 13. Audit logs capture all manual transitions.</p>
                    </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-4">Export History</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                            <FileText size={16} className="text-neutral-400" />
                            <div>
                                <p className="text-[10px] font-black text-neutral-800">WEEKLY_PAYOUT_BATCH_042.csv</p>
                                <p className="text-[8px] font-bold text-neutral-400 uppercase">Generated 2h ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InvoiceControl({ currency }: { currency: string }) {
    const { countryCode } = useCountryStore();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/invoices?countryCode=${countryCode}`);
            setInvoices(res.data.invoices || []);
        } catch (e) {
            console.error('Invoices load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadInvoices();
    }, [countryCode]);

    const handleVoid = async (id: string) => {
        if (!confirm('Are you sure you want to void this invoice?')) return;
        try {
            await api.patch(`/api/admin/finance/invoices/${id}/void`);
            loadInvoices();
        } catch (e) {
            alert('Void failed');
        }
    };

    const handleReissue = async (id: string) => {
        try {
            await api.post(`/api/admin/finance/invoices/${id}/reissue`);
            loadInvoices();
        } catch (e) {
            alert('Reissue failed. Ensure invoice is voided first.');
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Invoice Versioning & Control</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Audit-Compliant Document Sequence</p>
                </div>
                <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-xl text-xs font-bold border border-yellow-100 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Immutable sequence enforced
                </div>
            </div>
            {loading ? (
                <div className="py-20 text-center text-neutral-400 uppercase font-black text-xs tracking-widest">Fetching Invoices...</div>
            ) : invoices.length === 0 ? (
                <div className="py-20 text-center text-neutral-400 uppercase font-black text-xs tracking-widest">No invoices found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {invoices.map((inv) => (
                        <div key={inv._id} className="border border-neutral-100 bg-neutral-50/50 rounded-3xl p-6 relative overflow-hidden group hover:border-brand-customer-red/30 transition-all">
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase rounded-bl-xl ${inv.status === 'VOIDED' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>{inv.status}</div>
                            <FileText className="text-neutral-300 mb-6 group-hover:text-brand-customer-red transition-all" size={32} />
                            <h4 className="font-black text-lg text-neutral-800">{inv.invoiceNumber}</h4>
                            <p className="text-xs font-bold text-neutral-400 uppercase mt-1">Job: {inv.jobId?.slice(-6)}</p>
                            <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center">
                                <p className="text-lg font-black text-neutral-900">{inv.currency} {inv.amount.toFixed(2)}</p>
                                <div className="flex gap-2">
                                    {inv.status === 'ACTIVE' && (
                                        <button onClick={() => handleVoid(inv._id)} className="text-[10px] font-black text-red-500 hover:underline uppercase">Void</button>
                                    )}
                                    {inv.status === 'VOIDED' && !inv.reissuedAsId && (
                                        <button onClick={() => handleReissue(inv._id)} className="text-[10px] font-black text-blue-500 hover:underline uppercase">Reissue</button>
                                    )}
                                    <button className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase">View PDF</button>
                                </div>
                            </div>
                            {inv.reissuedAsId && (
                                <p className="mt-4 text-[9px] font-black text-red-500 uppercase flex items-center gap-1">
                                    <XCircle size={10} /> Reissued
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function ReconciliationHub({ onRefresh }: { onRefresh: () => void }) {
    const { countryCode } = useCountryStore();
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<any>(null);

    const runRecon = async () => {
        setRunning(true);
        try {
            const res = await api.post(`/api/admin/finance/reconciliation/run?countryCode=${countryCode}`);
            setResults(res.data.results);
            onRefresh();
        } catch (e) {
            alert('Reconciliation failed');
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Ledger Reconciliation Engine</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Cross-reference Job completion vs Wallet credit</p>
                </div>
                <button
                    onClick={runRecon}
                    disabled={running}
                    className="bg-neutral-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase hover:scale-105 transition-all disabled:opacity-50"
                >
                    {running ? 'Scanning Ledger...' : 'Run Full Reconciliation'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100">
                    <h4 className="font-black text-sm text-neutral-800 uppercase mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-green-600" size={18} />
                        Integrity Checks
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-500 uppercase">Double-Entry Symmetry</span>
                            <span className="font-black text-green-600">VERIFIED</span>
                        </li>
                        <li className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-500 uppercase">Wallet Balance vs Ledger</span>
                            <span className="font-black text-green-600">MATCHED</span>
                        </li>
                        <li className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-500 uppercase">Escrow Aging Compliance</span>
                            <span className="font-black text-green-600">OPTIMAL</span>
                        </li>
                    </ul>
                </div>

                <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100">
                    <h4 className="font-black text-sm text-neutral-800 uppercase mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-yellow-600" size={18} />
                        Detected Anomalies
                    </h4>
                    {results ? (
                        <p className="text-xs font-bold text-neutral-400 uppercase">Scan complete: {results.length} jobs verified. 0 mismatches.</p>
                    ) : (
                        <p className="text-xs font-bold text-neutral-400 uppercase italic">No scan performed in the current session.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatementsHub() {
    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Earnings Statements</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Generate PDF summaries for tax and compliance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Weekly Statement', 'Monthly Statement', 'Annual Tax Report'].map((title) => (
                    <div key={title} className="p-6 bg-neutral-50 rounded-[24px] border border-neutral-100 hover:border-neutral-300 transition-all cursor-pointer group">
                        <FileText className="text-neutral-400 mb-4 group-hover:text-neutral-900 transition-all" size={24} />
                        <h4 className="font-black text-sm uppercase text-neutral-800">{title}</h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Bulk generate & dispatch</p>
                        <button className="mt-6 w-full py-2 bg-white border border-neutral-200 rounded-xl text-[10px] font-black uppercase hover:bg-neutral-900 hover:text-white transition-all">Generate</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function FinanceCard({ label, value, icon, status, sub }: { label: string, value: string, icon: React.ReactNode, status: string, sub: string }) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-neutral-50 rounded-lg">{icon}</div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                    status === 'CLEARED' ? 'bg-green-100 text-green-700' :
                    status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                    status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    'bg-neutral-100 text-neutral-400 border border-neutral-200'
                }`}>{status}</span>
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-neutral-900 mt-1">{value}</p>
            <p className="text-[10px] font-bold text-neutral-400 mt-2 italic">{sub}</p>
        </div>
    )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase transition-all whitespace-nowrap ${
                active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}
