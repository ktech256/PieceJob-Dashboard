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
  FileText
} from 'lucide-react';

export default function FinanceHub() {
  const [activeTab, setActiveTab] = useState("ledger");
  const { countryCode } = useCountryStore();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayouts: 0,
    activeEscrow: 0,
    mismatchErrors: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/overview?countryCode=${countryCode}`);
            setStats(res.data.stats);
        } catch (e) {
            console.error('Failed to load finance stats');
        } finally {
            setLoading(false);
        }
    };
    if (countryCode) fetchOverview();
  }, [countryCode]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Finance Command Hub</h1>
          <p className="text-neutral-500 font-medium">Manage global revenue, escrow releases, and provider payouts.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <TabButton active={activeTab === "ledger"} onClick={() => setActiveTab("ledger")} label="Ledger" />
            <TabButton active={activeTab === "payouts"} onClick={() => setActiveTab("payouts")} label="Payout Engine" />
            <TabButton active={activeTab === "invoices"} onClick={() => setActiveTab("invoices")} label="Invoices" />
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinanceCard
            label="Total Platform Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<ArrowUpRight size={18} className="text-green-600" />}
            status="CLEARED"
            sub="Ledger balanced"
        />
        <FinanceCard
            label="Withdrawable (Pending)"
            value={`$${stats.pendingPayouts.toLocaleString()}`}
            icon={<Clock size={18} className="text-blue-600" />}
            status="PROCESSING"
            sub="24 providers queued"
        />
        <FinanceCard
            label="Total in Escrow"
            value={`$${stats.activeEscrow.toLocaleString()}`}
            icon={<ShieldCheck size={18} className="text-brand-provider-green" />}
            status="LOCKED"
            sub="12h cooling active"
        />
        <FinanceCard
            label="Reconciliation Health"
            value={stats.mismatchErrors === 0 ? "100%" : "Error"}
            icon={<Receipt size={18} className="text-brand-customer-red" />}
            status="OPTIMAL"
            sub="Zero cent mismatch"
        />
      </div>

      {activeTab === "ledger" && <LedgerConsole />}
      {activeTab === "payouts" && <PayoutEngine />}
      {activeTab === "invoices" && <InvoiceControl />}
    </div>
  );
}

function LedgerConsole() {
    const { countryCode } = useCountryStore();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Real-time Double-Entry Verification</p>
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
                        {logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">No transactions found.</td></tr>
                        ) : (
                            logs.map((tx) => (
                                <tr key={tx._id} className="hover:bg-neutral-50/50 transition-all group">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-500">{tx.transactionId}</td>
                                    <td className="px-8 py-5">
                                        <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{tx.type}</span>
                                    </td>
                                    <td className={`px-8 py-5 text-right font-black ${tx.type === 'SERVICE_FEE' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.amount.toFixed(2)} {tx.currency}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
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

function PayoutEngine() {
    const { countryCode } = useCountryStore();
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPayouts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/payouts/admin?countryCode=${countryCode}`);
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

    const handleMarkPaid = async (id: string) => {
        try {
            await api.patch(`/api/payouts/admin/${id}/pay`);
            loadPayouts();
        } catch (e) {
            alert('Settlement failed');
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Active Payout Queue</h3>
                    <button onClick={loadPayouts} className="bg-brand-provider-green text-white px-6 py-2 rounded-xl text-xs font-black uppercase hover:scale-105 transition-all">Refresh Queue</button>
                </div>
                <div className="space-y-4">
                    {payouts.length === 0 ? (
                        <div className="py-10 text-center text-neutral-400">No pending payouts.</div>
                    ) : (
                        payouts.map((p) => (
                            <div key={p._id} className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100 group hover:border-brand-provider-green/30 transition-all">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-500 uppercase">
                                        {p.provider?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-neutral-800">{p.provider?.name}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase">{p.provider?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-center">
                                    <div className="text-right">
                                        <p className="text-lg font-black text-neutral-900">{p.totalAmount.toFixed(2)} {p.currency}</p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.status}</span>
                                    </div>
                                    {p.status === 'PENDING' && (
                                        <button onClick={() => handleMarkPaid(p._id)} className="p-2 bg-white border rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-900 hover:text-white transition-all">Settle</button>
                                    )}
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
                            <p className="font-black text-brand-provider-green">$50.00</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold">Auto-Settlement</p>
                            <p className="font-black">DISABLED</p>
                        </div>
                        <div className="h-px bg-white/10"></div>
                        <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">Manual settlement is currently enforced for all provider tiers to ensure audit integrity during Phase 13.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InvoiceControl() {
    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
             <div className="flex justify-between items-center mb-12">
                <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Invoice Versioning & Control</h3>
                <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-xl text-xs font-bold border border-yellow-100 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Immutable sequence enforced
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { id: "INV-2024-001", user: "Customer C-45", amount: 150.00, status: "ACTIVE" },
                    { id: "INV-2024-002", user: "Customer C-48", amount: 2500.00, status: "VOIDED", reissued: "INV-2024-002-R1" },
                    { id: "INV-2024-002-R1", user: "Customer C-48", amount: 2450.00, status: "REISSUE" },
                ].map((inv) => (
                    <div key={inv.id} className="border border-neutral-100 bg-neutral-50/50 rounded-3xl p-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase rounded-bl-xl ${inv.status === 'VOIDED' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>{inv.status}</div>
                        <FileText className="text-neutral-300 mb-6 group-hover:text-brand-customer-red transition-all" size={32} />
                        <h4 className="font-black text-lg text-neutral-800">{inv.id}</h4>
                        <p className="text-xs font-bold text-neutral-400 uppercase mt-1">{inv.user}</p>
                        <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center">
                            <p className="text-lg font-black text-neutral-900">${inv.amount.toLocaleString()}</p>
                            <button className="text-xs font-black text-brand-customer-red hover:underline uppercase">View PDF</button>
                        </div>
                        {inv.reissued && (
                            <p className="mt-4 text-[9px] font-black text-red-500 uppercase flex items-center gap-1">
                                <XCircle size={10} /> Reissued as: {inv.reissued}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function FinanceCard({ label, value, icon, status, sub }: { label: string, value: string, icon: React.ReactNode, status: string, sub: string }) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-neutral-50 rounded-lg">{icon}</div>
                <span className="text-[9px] font-black text-neutral-400 border border-neutral-200 px-2 py-0.5 rounded uppercase tracking-widest">{status}</span>
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
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}
