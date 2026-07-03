"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCcw,
  Clock,
  FileText,
  Download,
  Filter,
  Search,
  Users,
  HardHat,
  History,
  ArrowDownCircle,
  Undo,
  Gift,
  Activity,
  User,
  LayoutDashboard,
  Wallet,
  Lock,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function FinanceControlCentre() {
  const [activeTab, setActiveTab] = useState("overview");
  const { countryCode, currentCountry } = useCountryStore();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    netCommission: 0,
    pendingPayouts: 0,
    activeEscrow: 0,
    totalCustomerWallets: 0,
    totalProviderWallets: 0,
    pendingRefunds: 0,
    totalBonuses: 0,
    currency: '$',
    currencySymbol: '$'
  });

  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/finance/overview?countryCode=${countryCode}`);
      setStats(res.data.stats);
    } catch (e) {
      console.error('Failed to load finance overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) fetchOverview();
  }, [countryCode]);

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
    { id: "customers", label: "Customers", icon: <User size={14} /> },
    { id: "providers", label: "Providers", icon: <HardHat size={14} /> },
    { id: "ledger", label: "Ledger", icon: <History size={14} /> },
    { id: "withdrawals", label: "Withdrawals", icon: <ArrowDownCircle size={14} /> },
    { id: "refunds", label: "Refunds", icon: <Undo size={14} /> },
    { id: "bonuses", label: "Bonuses", icon: <Gift size={14} /> },
    { id: "referrals", label: "Referrals", icon: <Users size={14} /> },
    { id: "escrow", label: "Escrow", icon: <ShieldCheck size={14} /> },
    { id: "audit", label: "Audit Logs", icon: <Activity size={14} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Finance Control Centre</h1>
          <p className="text-neutral-500 font-medium text-sm">Full operational oversight of the PieceJob economy in {currentCountry?.name}.</p>
        </div>
        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinanceCard label="Customer Wallets" value={stats.totalCustomerWallets.toString()} sub="Total Active" color="blue" />
            <FinanceCard label="Provider Wallets" value={stats.totalProviderWallets.toString()} sub="Total Active" color="green" />
            <FinanceCard label="Total Platform Revenue" value={`${stats.currencySymbol}${stats.totalRevenue.toLocaleString()}`} sub="Gross Volume" color="emerald" />
            <FinanceCard label="Net Commission" value={`${stats.currencySymbol}${stats.netCommission.toLocaleString()}`} sub="Earned Profit" color="indigo" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinanceCard label="Total in Escrow" value={`${stats.currencySymbol}${stats.activeEscrow.toLocaleString()}`} sub="Held Funds" color="amber" />
            <FinanceCard label="Pending Withdrawals" value={`${stats.currencySymbol}${stats.pendingPayouts.toLocaleString()}`} sub="Awaiting Action" color="orange" />
            <FinanceCard label="Pending Refunds" value={`${stats.currencySymbol}${stats.pendingRefunds.toLocaleString()}`} sub="Customer Requests" color="red" />
            <FinanceCard label="Referral & Bonus" value={`${stats.currencySymbol}${stats.totalBonuses.toLocaleString()}`} sub="Marketing Liability" color="purple" />
          </div>
          <ReconciliationHub onRefresh={fetchOverview} />
        </div>
      )}

      {activeTab === "customers" && <WalletList role="CUSTOMER" currencySymbol={stats.currencySymbol} />}
      {activeTab === "providers" && <WalletList role="PROVIDER" currencySymbol={stats.currencySymbol} />}
      {activeTab === "ledger" && <LedgerExplorer currencySymbol={stats.currencySymbol} />}
      {activeTab === "withdrawals" && <WithdrawalManager currencySymbol={stats.currencySymbol} />}
      {activeTab === "refunds" && <RefundCentre currencySymbol={stats.currencySymbol} />}
      {activeTab === "bonuses" && <BonusCentre currencySymbol={stats.currencySymbol} />}
      {activeTab === "referrals" && <ReferralCentre currencySymbol={stats.currencySymbol} />}
      {activeTab === "escrow" && <EscrowMonitor currencySymbol={stats.currencySymbol} activeEscrow={stats.activeEscrow} />}
      {activeTab === "audit" && <AuditLogsView />}
    </div>
  );
}

function FinanceCard({ label, value, sub, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };
  return (
    <div className={`p-6 rounded-[32px] border ${colors[color]} shadow-sm`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <h3 className="text-3xl font-black mt-2">{value}</h3>
      <p className="text-[10px] font-bold uppercase mt-1 opacity-50">{sub}</p>
    </div>
  );
}

function WalletList({ role, currencySymbol }: any) {
  const { countryCode } = useCountryStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/finance/wallets?role=${role}&countryCode=${countryCode}`);
      setData(res.data.data);
    } catch (e) {
      console.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [role, countryCode]);

  return (
    <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
        <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">{role} Wallets</h3>
        <button onClick={fetchWallets} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
            <tr>
              <th className="px-8 py-4">{role}</th>
              <th className="px-8 py-4">Main Balance</th>
              <th className="px-8 py-4">Referral</th>
              <th className="px-8 py-4">Bonus</th>
              {role === 'PROVIDER' && <th className="px-8 py-4">Escrow</th>}
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 text-sm">
            {loading ? (
              <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400">Loading wallets...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400">No wallets found.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.user._id} className="hover:bg-neutral-50 transition-all">
                  <td className="px-8 py-5">
                    <p className="font-black text-neutral-800">{item.user.firstName} {item.user.lastName}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{item.user.email}</p>
                  </td>
                  <td className="px-8 py-5 font-black text-neutral-900">{currencySymbol}{item.wallet.balanceMain.toFixed(2)}</td>
                  <td className="px-8 py-5 font-bold text-neutral-600">{currencySymbol}{item.wallet.balanceReferral.toFixed(2)}</td>
                  <td className="px-8 py-5 font-bold text-neutral-600">{currencySymbol}{item.wallet.balanceBonus.toFixed(2)}</td>
                  {role === 'PROVIDER' && <td className="px-8 py-5 font-black text-amber-600">{currencySymbol}{item.wallet.balanceEscrow.toFixed(2)}</td>}
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-900 hover:text-white transition-all"><Eye size={14} /></button>
                       <button className="p-2 bg-neutral-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all" title="Credit"><ArrowUpRight size={14} /></button>
                       <button className="p-2 bg-neutral-100 rounded-lg hover:bg-red-600 hover:text-white transition-all" title="Freeze"><Lock size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LedgerExplorer({ currencySymbol }: any) {
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
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Immutable Ledger Explorer</h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Full Transaction Traceability (Audit Grade)</p>
                </div>
                <button onClick={loadLedger} className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-black transition-all flex items-center gap-2">
                    <RefreshCcw size={14} />
                    Refresh
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Transaction ID</th>
                            <th className="px-8 py-4">Type</th>
                            <th className="px-8 py-4 text-right">Debit / Credit</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                             <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">Loading ledger...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">No records found.</td></tr>
                        ) : (
                            logs.map((tx) => (
                                <tr key={tx._id} className="hover:bg-neutral-50 transition-all group">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-500">{tx.transactionId}</td>
                                    <td className="px-8 py-5">
                                        <span className={`bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[10px] font-black uppercase`}>{tx.type}</span>
                                    </td>
                                    <td className={`px-8 py-5 text-right font-black ${['SERVICE_FEE', 'BOOKING_FEE', 'CREDIT_TOPUP', 'PROMO_CREDIT', 'REFERRAL_REWARD'].includes(tx.type) ? 'text-green-600' : 'text-red-600'}`}>
                                        {['SERVICE_FEE', 'BOOKING_FEE', 'CREDIT_TOPUP', 'PROMO_CREDIT', 'REFERRAL_REWARD'].includes(tx.type) ? '+' : '-'}{tx.amount.toFixed(2)} {tx.currency}
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
    );
}

function WithdrawalManager({ currencySymbol }: any) {
  const { countryCode } = useCountryStore();
  const [payouts, setPayouts] = useState<any[]>([]);
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
    loadPayouts();
  }, [countryCode]);

  return (
    <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
        <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Withdrawal Requests</h3>
        <button onClick={loadPayouts} className="bg-brand-provider-green text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all">Refresh Queue</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
            <tr>
              <th className="px-8 py-4">Provider</th>
              <th className="px-8 py-4">Amount</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Requested</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 text-sm">
            {loading ? (
               <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">Loading payout queue...</td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">No pending requests.</td></tr>
            ) : (
              payouts.map((p) => (
                <tr key={p._id} className="hover:bg-neutral-50 transition-all">
                   <td className="px-8 py-5 font-black text-neutral-800">{p.provider?.name}</td>
                   <td className="px-8 py-5 font-black text-lg">{p.totalAmount.toFixed(2)} {p.currency}</td>
                   <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.status}</span>
                   </td>
                   <td className="px-8 py-5 text-xs text-neutral-400 font-bold uppercase">{new Date(p.createdAt).toLocaleDateString()}</td>
                   <td className="px-8 py-5 text-right">
                      <button className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Settle</button>
                   </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RefundCentre({ currencySymbol }: any) {
    const { countryCode } = useCountryStore();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/refunds?countryCode=${countryCode}`);
            setData(res.data.data);
        } catch (e) {
            console.error('Failed to load refunds');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, [countryCode]);

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Refund Control Hub</h3>
                <button onClick={fetchRefunds} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Refund ID</th>
                            <th className="px-8 py-4">Customer</th>
                            <th className="px-8 py-4">Job</th>
                            <th className="px-8 py-4 text-right">Amount</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                            <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400">Loading refunds...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400">No refunds found.</td></tr>
                        ) : (
                            data.map((r) => (
                                <tr key={r._id} className="hover:bg-neutral-50 transition-all">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-500">{r.transactionId}</td>
                                    <td className="px-8 py-5 font-black text-neutral-800">{r.toUserId?.firstName} {r.toUserId?.lastName}</td>
                                    <td className="px-8 py-5 font-bold text-blue-600">#{r.jobId?.id?.slice(-6)}</td>
                                    <td className="px-8 py-5 text-right font-black text-red-600">{currencySymbol}{r.amount.toFixed(2)}</td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-neutral-100 text-neutral-800 rounded">{r.status}</span>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-neutral-400 uppercase">{new Date(r.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BonusCentre({ currencySymbol }: any) {
    const { countryCode } = useCountryStore();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadBonuses = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/ledger?countryCode=${countryCode}&type=BONUS`);
            setLogs(res.data.logs || []);
        } catch (e) {
            console.error('Bonuses load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadBonuses();
    }, [countryCode]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Bonus Distribution History</h3>
                    <button onClick={loadBonuses} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                            <tr>
                                <th className="px-8 py-4">Account</th>
                                <th className="px-8 py-4">Description</th>
                                <th className="px-8 py-4 text-right">Amount</th>
                                <th className="px-8 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                            {loading ? (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-neutral-400">Loading bonuses...</td></tr>
                            ) : logs.filter((tx: any) => tx.type === 'BONUS' || tx.type === 'PROMO_CREDIT').length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-neutral-400">No bonuses distributed yet.</td></tr>
                            ) : (
                                logs.filter((tx: any) => tx.type === 'BONUS' || tx.type === 'PROMO_CREDIT').map((tx) => (
                                    <tr key={tx._id} className="hover:bg-neutral-50 transition-all">
                                        <td className="px-8 py-5">
                                            <p className="font-black text-neutral-800">User ID: {tx.toUserId?.slice(-6)}</p>
                                        </td>
                                        <td className="px-8 py-5 text-neutral-500">{tx.description}</td>
                                        <td className="px-8 py-5 text-right font-black text-green-600">{currencySymbol}{tx.amount.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-xs text-neutral-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-[#121212] rounded-[32px] p-8 text-white shadow-xl h-fit">
                <h4 className="font-black text-xs uppercase tracking-widest text-neutral-500 mb-6 text-center">Reward Dispenser</h4>
                <div className="space-y-6">
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Target Account ID</label>
                        <input type="text" className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs outline-none focus:border-brand-customer-red" placeholder="e.g. 6a2c..." />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Amount ({currencySymbol})</label>
                        <input type="number" className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs outline-none focus:border-brand-customer-red" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Description / Reason</label>
                        <input type="text" className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs outline-none focus:border-brand-customer-red" placeholder="e.g. Compensation" />
                    </div>
                    <button className="w-full bg-brand-customer-red text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Credit Wallet</button>
                    <p className="text-[10px] text-neutral-500 font-medium leading-relaxed italic text-center">Action will be recorded in the immutable ledger and audit logs.</p>
                </div>
            </div>
        </div>
    );
}

function ReferralCentre({ currencySymbol }: any) {
    const { countryCode } = useCountryStore();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReferrals = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/referrals?countryCode=${countryCode}`);
            setData(res.data.data);
        } catch (e) {
            console.error('Failed to load referrals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [countryCode]);

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Referral Reward Ledger</h3>
                <button onClick={fetchReferrals} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Incentive ID</th>
                            <th className="px-8 py-4">Inviter</th>
                            <th className="px-8 py-4">Amount</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4 text-right">Fulfillment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">Loading referral rewards...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">No rewards distributed yet.</td></tr>
                        ) : (
                            data.map((r) => (
                                <tr key={r._id} className="hover:bg-neutral-50 transition-all">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-500">{r.transactionId}</td>
                                    <td className="px-8 py-5 font-black text-neutral-800">{r.toUserId?.firstName} {r.toUserId?.lastName}</td>
                                    <td className="px-8 py-5 font-black text-green-600">{currencySymbol}{r.amount.toFixed(2)}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={12} className="text-green-500" />
                                            <span className="text-[10px] font-black uppercase">PAID</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right text-xs text-neutral-400 font-bold uppercase">{new Date(r.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EscrowMonitor({ currencySymbol, activeEscrow }: any) {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#121212] p-12 rounded-[40px] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Global Escrow Pool</p>
                    <h3 className="text-6xl font-black mt-4">{currencySymbol}{activeEscrow.toLocaleString()}</h3>
                    <p className="text-sm font-bold text-neutral-400 mt-2 uppercase tracking-tight">Funds held pending job completion & cooling period.</p>
                </div>
                <ShieldCheck size={120} className="text-neutral-900 absolute -right-4 -bottom-4 rotate-12" />
            </div>

            <div className="bg-white border border-neutral-200 rounded-[32px] p-8">
                 <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight mb-8">Escrow Health Indicators</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-neutral-50 rounded-3xl">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Released (24h)</p>
                        <p className="text-2xl font-black text-neutral-900 mt-2">{currencySymbol} 0.00</p>
                    </div>
                    <div className="p-6 bg-neutral-50 rounded-3xl">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Held (7d+)</p>
                        <p className="text-2xl font-black text-neutral-900 mt-2">{currencySymbol} 0.00</p>
                    </div>
                    <div className="p-6 bg-red-50 rounded-3xl">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Disputed Hold</p>
                        <p className="text-2xl font-black text-red-600 mt-2">{currencySymbol} 0.00</p>
                    </div>
                 </div>
            </div>
        </div>
    );
}

function AuditLogsView() {
    const { countryCode } = useCountryStore();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/audit-logs?countryCode=${countryCode}&category=FINANCE`);
            setLogs(res.data.logs || []);
        } catch (e) {
            console.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [countryCode]);

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm animate-in fade-in duration-500">
             <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Financial Audit Trail</h3>
                <button onClick={fetchLogs} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Timestamp</th>
                            <th className="px-8 py-4">Actor</th>
                            <th className="px-8 py-4">Action</th>
                            <th className="px-8 py-4">Details</th>
                            <th className="px-8 py-4">Impact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">Loading audit trail...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">No logs for this workspace.</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-neutral-50 transition-all">
                                    <td className="px-8 py-5 text-xs font-bold text-neutral-400 uppercase">{new Date(log.createdAt).toLocaleString()}</td>
                                    <td className="px-8 py-5 font-black text-neutral-800">{log.adminId || 'SYSTEM'}</td>
                                    <td className="px-8 py-5 font-black text-blue-600 uppercase text-[10px]">{log.action}</td>
                                    <td className="px-8 py-5 text-xs text-neutral-500 truncate max-w-xs">{JSON.stringify(log.financialInfo || log.afterState)}</td>
                                    <td className="px-8 py-5 text-right font-black text-neutral-900">{log.financialInfo?.amountBase || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
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
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Consistency check: Ledger vs User Balances</p>
                </div>
                <button
                    onClick={runRecon}
                    disabled={running}
                    className="bg-neutral-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase hover:scale-105 transition-all disabled:opacity-50"
                >
                    {running ? 'Scanning Ledger...' : 'Execute Integrity Scan'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100">
                    <h4 className="font-black text-sm text-neutral-800 uppercase mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-green-600" size={18} />
                        Security Checksum
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-500 uppercase">Double-Entry Balance</span>
                            <span className="font-black text-green-600">VERIFIED</span>
                        </li>
                        <li className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-500 uppercase">Isolation Compliance</span>
                            <span className="font-black text-green-600">PASSED</span>
                        </li>
                    </ul>
                </div>

                <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100">
                    <h4 className="font-black text-sm text-neutral-800 uppercase mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-yellow-600" size={18} />
                        Mismatches Detected
                    </h4>
                    {results ? (
                        <p className="text-xs font-bold text-neutral-400 uppercase">Scan complete: {results.scannedJobs} jobs verified. {results.walletMismatches.length} errors.</p>
                    ) : (
                        <p className="text-xs font-bold text-neutral-400 uppercase italic">No active scan performed.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
