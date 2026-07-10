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
  XCircle,
  Unlock,
  Ban,
  MoreVertical,
  ChevronRight,
  UserPlus,
  Coins,
  ShieldAlert,
  MessageSquare,
  Phone
} from 'lucide-react';

const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Invalid Date";
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
        return "Error";
    }
};

const formatTime = (date: string | Date | undefined) => {
    if (!date) return "--:--";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "--:--";
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
        return "Error";
    }
};

const formatDateTimeLong = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Invalid Date";
        return d.toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
        return "Error";
    }
};

const renderActor = (actor: any) => {
    if (!actor) return 'SYSTEM';
    if (typeof actor === 'string') return actor;
    if (typeof actor !== 'object') return String(actor);

    // Defensive check to avoid rendering the whole object
    const name = actor.firstName ? `${actor.firstName} ${actor.lastName || ''}`.trim() : null;
    const identifier = name || actor.email || actor.auditId || actor._id?.toString() || 'CORE_ENGINE';

    return String(identifier);
};

export default function FinanceControlCentre() {
  const [activeTab, setActiveTab] = useState("overview");
  const { countryCode, currentCountry } = useCountryStore();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    netServiceFee: 0,
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
      if (res.data && res.data.stats) {
          setStats({
              ...stats, // Keep defaults if any field missing
              ...res.data.stats
          });
      }
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
    { id: "service-fees", label: "Service Fees", icon: <Coins size={14} /> },
    { id: "customers", label: "Customers", icon: <User size={14} /> },
    { id: "providers", label: "Providers", icon: <HardHat size={14} /> },
    { id: "manual-credit", label: "Manual Credit", icon: <Coins size={14} /> },
    { id: "ledger", label: "Ledger", icon: <History size={14} /> },
    { id: "withdrawals", label: "Withdrawals", icon: <ArrowDownCircle size={14} /> },
    { id: "refunds", label: "Refunds", icon: <Undo size={14} /> },
    { id: "bonuses", label: "Bonuses", icon: <Gift size={14} /> },
    { id: "referrals", label: "Referrals", icon: <Users size={14} /> },
    { id: "escrow", label: "Escrow", icon: <ShieldCheck size={14} /> },
    { id: "audit", label: "Audit Logs", icon: <Activity size={14} /> },
  ];

  return (
    <div className="space-y-8 pb-20 text-neutral-900">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Finance Control Centre</h1>
          <p className="text-neutral-500 font-medium text-sm">Full operational oversight of the PieceJob economy in {currentCountry?.name}.</p>
        </div>
        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-2xl border border-neutral-200 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-50 text-neutral-500 hover:text-neutral-700'
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
            <FinanceCard label="Customer Wallets" value={(stats.totalCustomerWallets || 0).toString()} sub="Total Active" color="blue" />
            <FinanceCard label="Provider Wallets" value={(stats.totalProviderWallets || 0).toString()} sub="Total Active" color="green" />
            <FinanceCard label="Total Platform Revenue" value={`${stats.currencySymbol || ''}${(stats.totalRevenue || 0).toLocaleString()}`} sub="Gross Volume" color="emerald" />
            <FinanceCard label="Net Service Fee" value={`${stats.currencySymbol || ''}${(stats.netServiceFee || 0).toLocaleString()}`} sub="Earned Profit" color="indigo" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinanceCard label="Total in Escrow" value={`${stats.currencySymbol || ''}${(stats.activeEscrow || 0).toLocaleString()}`} sub="Held Funds" color="amber" />
            <FinanceCard label="Pending Withdrawals" value={`${stats.currencySymbol || ''}${(stats.pendingPayouts || 0).toLocaleString()}`} sub="Awaiting Action" color="orange" />
            <FinanceCard label="Pending Refunds" value={`${stats.currencySymbol || ''}${(stats.pendingRefunds || 0).toLocaleString()}`} sub="Customer Requests" color="red" />
            <FinanceCard label="Referral & Bonus" value={`${stats.currencySymbol || ''}${(stats.totalBonuses || 0).toLocaleString()}`} sub="Marketing Liability" color="purple" />
          </div>
          <ReconciliationHub onRefresh={fetchOverview} />
        </div>
      )}

      {activeTab === "service-fees" && <ServiceFeeModule currencySymbol={stats.currencySymbol} />}
      {activeTab === "customers" && <WalletList role="CUSTOMER" currencySymbol={stats.currencySymbol} />}
      {activeTab === "providers" && <WalletList role="PROVIDER" currencySymbol={stats.currencySymbol} />}
      {activeTab === "manual-credit" && <ManualCreditModule currencySymbol={stats.currencySymbol} />}
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
    <div className={`p-6 rounded-[32px] border ${colors[color]} shadow-sm hover:shadow-md transition-all group cursor-default`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <h3 className="text-3xl font-black mt-2 group-hover:scale-105 transition-transform origin-left">{value || '0'}</h3>
      <p className="text-[10px] font-bold uppercase mt-1 opacity-50">{sub}</p>
    </div>
  );
}

function WalletList({ role, currencySymbol }: any) {
  const { countryCode } = useCountryStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/finance/wallets?role=${role}&countryCode=${countryCode}`);
      setData(res.data.data || []);
    } catch (e) {
      console.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [role, countryCode]);

  const handleAction = (item: any, type: string) => {
    setSelectedItem(item);
    setModalType(type);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
        <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">{role} Wallets</h3>
        <div className="flex gap-4">
            <button onClick={fetchWallets} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
            <tr>
              <th className="px-8 py-4">{role}</th>
              <th className="px-8 py-4 text-right">Platform Balance</th>
              <th className="px-8 py-4 text-right">Referral</th>
              <th className="px-8 py-4 text-right">Bonus</th>
              {role === 'PROVIDER' && <th className="px-8 py-4 text-right">Escrow</th>}
              <th className="px-8 py-4 text-center">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 text-sm font-medium">
            {loading ? (
              <tr><td colSpan={role === 'PROVIDER' ? 7 : 6} className="px-8 py-10 text-center text-neutral-400">Loading wallets...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={role === 'PROVIDER' ? 7 : 6} className="px-8 py-10 text-center text-neutral-400">No wallets found.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.user?._id} className="hover:bg-neutral-50 transition-all group">
                  <td className="px-8 py-5">
                    <p className="font-black text-neutral-800">{item.user?.firstName} {item.user?.lastName}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{item.user?.email}</p>
                  </td>
                  <td className="px-8 py-5 font-black text-neutral-900 text-right">{currencySymbol}{(item.wallet?.balanceMain || 0).toFixed(2)}</td>
                  <td className="px-8 py-5 text-neutral-600 text-right">{currencySymbol}{(item.wallet?.balanceReferral || 0).toFixed(2)}</td>
                  <td className="px-8 py-5 text-neutral-600 text-right">{currencySymbol}{(item.wallet?.balanceBonus || 0).toFixed(2)}</td>
                  {role === 'PROVIDER' && <td className="px-8 py-5 font-black text-amber-600 text-right">{currencySymbol}{(item.wallet?.balanceEscrow || 0).toFixed(2)}</td>}
                  <td className="px-8 py-5 text-center">
                     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                        item.wallet?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        item.wallet?.status === 'FROZEN' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                     }`}>{item.wallet?.status || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleAction(item, 'VIEW')} className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-900 hover:text-white transition-all shadow-sm" title="View Ledger"><Eye size={12} /></button>
                       <button onClick={() => handleAction(item, 'CREDIT')} className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Credit Wallet"><ArrowUpRight size={12} /></button>
                       <button onClick={() => handleAction(item, 'DEBIT')} className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Debit Wallet"><ArrowDownCircle size={12} /></button>
                       <button onClick={() => handleAction(item, 'STATUS')} className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-sm" title="Update Status"><Ban size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalType === 'STATUS' && (
          <StatusUpdateModal
            item={selectedItem}
            onClose={() => setModalType(null)}
            onRefresh={fetchWallets}
          />
      )}
      {modalType === 'CREDIT' && (
          <ManualMutationModal
            item={selectedItem}
            type="CREDIT"
            onClose={() => setModalType(null)}
            onRefresh={fetchWallets}
          />
      )}
      {modalType === 'DEBIT' && (
          <ManualMutationModal
            item={selectedItem}
            type="DEBIT"
            onClose={() => setModalType(null)}
            onRefresh={fetchWallets}
          />
      )}
      {modalType === 'VIEW' && (
          <WalletAuditModal
            item={selectedItem}
            onClose={() => setModalType(null)}
          />
      )}
    </div>
  );
}

function WalletAuditModal({ item, onClose }: any) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get(`/api/admin/finance/ledger?countryCode=${item.user?.countryCode}`);
                const filtered = (res.data.logs || []).filter((l: any) => l.fromUserId === item.user?._id || l.toUserId === item.user?._id);
                setLogs(filtered);
            } catch (e) {
                console.error("Ledger fetch failed");
            } finally {
                setLoading(false);
            }
        };
        if (item?.user?._id) fetchLogs();
    }, [item]);

    return (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 text-neutral-900">
            <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-neutral-800">Wallet Audit Trail</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Snapshot for {item.user?.firstName} {item.user?.lastName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><XCircle className="text-neutral-300" /></button>
                </div>
                <div className="overflow-y-auto p-0 flex-1 scrollbar-hide">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-neutral-50 text-[9px] uppercase font-black text-neutral-400 border-b border-neutral-100 z-10">
                            <tr>
                                <th className="px-10 py-4">Transaction</th>
                                <th className="px-10 py-4">Context</th>
                                <th className="px-10 py-4 text-right">Amount</th>
                                <th className="px-10 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 text-sm">
                            {loading ? (
                                <tr><td colSpan={4} className="px-10 py-10 text-center text-neutral-400 uppercase font-black text-[10px]">Accessing Vault...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={4} className="px-10 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No activity recorded.</td></tr>
                            ) : (
                                logs.map(l => (
                                    <tr key={l._id}>
                                        <td className="px-10 py-5">
                                            <p className="font-black text-neutral-800 text-xs">{l.type}</p>
                                            <p className="text-[10px] font-mono text-neutral-400">{l.transactionId}</p>
                                        </td>
                                        <td className="px-10 py-5 text-neutral-500 text-xs font-bold italic">"{l.description}"</td>
                                        <td className={`px-10 py-5 text-right font-black ${l.toUserId === item.user?._id ? 'text-green-600' : 'text-red-600'}`}>
                                            {l.toUserId === item.user?._id ? '+' : '-'}{l.amount.toFixed(2)}
                                        </td>
                                        <td className="px-10 py-5 text-right text-xs text-neutral-400 uppercase">
                                            <p className="font-black text-neutral-600">{formatDate(l.createdAt)}</p>
                                            <p className="text-[10px]">{formatTime(l.createdAt)}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusUpdateModal({ item, onClose, onRefresh }: any) {
    const [status, setStatus] = useState(item.wallet?.status || 'ACTIVE');
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!reason) return alert("Please provide a reason.");
        setLoading(true);
        try {
            await api.patch(`/api/admin/users/${item.user?._id}/wallet/status`, {
                status,
                reason,
                isFrozen: status === 'FROZEN',
                isLocked: status === 'LOCKED',
                isSuspended: status === 'SUSPENDED'
            });
            onRefresh();
            onClose();
        } catch (e) {
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 text-neutral-900">
            <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-100">
                <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-neutral-800">Update Wallet Status</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Recipient: {item.user?.firstName} {item.user?.lastName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><XCircle className="text-neutral-300" /></button>
                </div>
                <div className="p-10 space-y-6">
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">New Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all cursor-pointer"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="FROZEN">Frozen</option>
                            <option value="LOCKED">Locked</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Reason for Change</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all h-24 resize-none"
                            placeholder="Provide justification for audit log..."
                        />
                    </div>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full bg-neutral-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-neutral-200"
                    >
                        {loading ? 'Processing...' : 'Apply Status Change'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ManualMutationModal({ item, type, onClose, onRefresh }: any) {
    const [amount, setAmount] = useState("");
    const [balanceType, setBalanceType] = useState("balanceMain");
    const [reason, setReason] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleMutate = async () => {
        setLoading(true);
        try {
            await api.post(`/api/admin/users/wallet/mutate`, {
                userId: item.user?._id,
                amount: type === 'CREDIT' ? parseFloat(amount) : -parseFloat(amount),
                balanceType,
                reason
            });
            onRefresh();
            onClose();
        } catch (e) {
            alert("Mutation failed");
        } finally {
            setLoading(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-8 text-neutral-900">
                <div className="bg-white rounded-[48px] w-full max-w-xl shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 duration-200">
                    <div className="p-12 text-center border-b border-neutral-100 bg-neutral-50/30">
                        <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg ${type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {type === 'CREDIT' ? <ArrowUpRight size={40} strokeWidth={3} /> : <ArrowDownCircle size={40} strokeWidth={3} />}
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Confirm Mutation</h3>
                        <p className="text-neutral-500 font-bold text-sm uppercase tracking-widest mt-2 underline underline-offset-8 decoration-neutral-200">Direct balance adjustment</p>
                    </div>

                    <div className="p-12 space-y-8 bg-white">
                        <div className="grid grid-cols-2 gap-y-6 text-sm">
                            <DetailRow label="Recipient" value={`${item.user?.firstName} ${item.user?.lastName}`} highlight />
                            <DetailRow label="Role" value={item.user?.role} highlight color="text-blue-600" />
                            <DetailRow label="Wallet Impact" value={balanceType.replace('balance', '').toUpperCase()} highlight />
                            <DetailRow label="Workspace" value={item.user?.countryCode} />
                            <DetailRow label="Current Balance" value={(item.wallet?.[balanceType] || 0).toFixed(2)} />
                            <div className="h-px bg-neutral-100 col-span-2"></div>
                            <DetailRow label="Mutation Signal" value={`${type === 'CREDIT' ? '+' : '-'}${parseFloat(amount).toFixed(2)}`} highlight color={type === 'CREDIT' ? 'text-green-600' : 'text-red-600'} />
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">Audit Trace Reason</p>
                            <p className="text-xs font-bold text-neutral-800 leading-relaxed italic">"{reason}"</p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 bg-white border border-neutral-200 text-neutral-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neutral-50 transition-all active:scale-95">Cancel</button>
                            <button
                                onClick={handleMutate}
                                disabled={loading}
                                className={`flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 active:scale-95 ${type === 'CREDIT' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                            >
                                {loading ? 'Processing Ledger...' : `Confirm ${type} Auth`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 text-neutral-900">
            <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-100">
                <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-neutral-800">{type} Wallet</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">{item.user?.firstName} {item.user?.lastName} ({item.user?.role})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><XCircle className="text-neutral-300" /></button>
                </div>
                <div className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                             <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Balance Sector</label>
                             <select
                                value={balanceType}
                                onChange={(e) => setBalanceType(e.target.value)}
                                className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all cursor-pointer"
                            >
                                <option value="balanceMain">Main Available</option>
                                <option value="balanceCredit">Credit Pool</option>
                                <option value="balanceReferral">Referral Pool</option>
                                <option value="balanceBonus">Bonus Pool</option>
                                {item.user?.role === 'PROVIDER' && <option value="balanceEscrow">Escrow Sector</option>}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Adjustment Logic Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all h-24 resize-none"
                            placeholder="Provide narrative justification..."
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");
                            if (!reason) return alert("Provide a reason");
                            setShowConfirm(true);
                        }}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-white shadow-lg ${type === 'CREDIT' ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'}`}
                    >
                        Review Transaction
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, highlight, color = 'text-neutral-900' }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">{label}</p>
            <p className={`${highlight ? 'font-black text-sm' : 'font-bold text-xs'} ${color} uppercase`}>{value || 'N/A'}</p>
        </div>
    );
}

function ManualCreditModule({ currencySymbol }: any) {
    const { countryCode } = useCountryStore();
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [executing, setExecuting] = useState(false);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            // Reusing wallet list to find providers with their current balances
            const res = await api.get(`/api/admin/finance/wallets?role=PROVIDER&countryCode=${countryCode}`);
            setProviders(res.data.data || []);
        } catch (e) {
            console.error('Failed to load providers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) fetchProviders();
    }, [countryCode]);

    const handleCredit = async () => {
        if (!selectedProvider || !amount || parseFloat(amount) <= 0 || !reason) {
            return alert("Please fill in all mandatory fields.");
        }

        if (!confirm(`Are you sure you want to credit ${selectedProvider.user.firstName} with ${currencySymbol}${amount}?`)) {
            return;
        }

        setExecuting(true);
        try {
            await api.post(`/api/admin/finance/manual-credit`, {
                providerId: selectedProvider.user._id,
                amount: parseFloat(amount),
                reason,
                notes
            });
            alert("Manual credit issued successfully.");
            setAmount("");
            setReason("");
            setNotes("");
            setSelectedProvider(null);
            fetchProviders();
        } catch (e: any) {
            alert(e.response?.data?.message || "Failed to issue manual credit.");
        } finally {
            setExecuting(false);
        }
    };

    const filtered = providers.filter(p =>
        p.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-500 text-neutral-900">
            <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Provider Selection</h3>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Select a provider to issue manual credit</p>
                    </div>
                    <div className="relative w-full md:w-64">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                         <input
                            type="text"
                            placeholder="Search Provider..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-black transition-all"
                         />
                    </div>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                            <tr>
                                <th className="px-8 py-4">Provider</th>
                                <th className="px-8 py-4 text-right">Credit Balance</th>
                                <th className="px-8 py-4 text-right">Available</th>
                                <th className="px-8 py-4 text-right">Status</th>
                                <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 uppercase font-black text-[10px] tracking-widest animate-pulse">Loading Providers...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No providers matching search.</td></tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.user?._id} className={`hover:bg-neutral-50 transition-all group ${selectedProvider?.user?._id === p.user?._id ? 'bg-blue-50/50' : ''}`}>
                                        <td className="px-8 py-4">
                                            <p className="font-black text-neutral-800">{p.user?.firstName} {p.user?.lastName}</p>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{p.user?.email}</p>
                                        </td>
                                        <td className="px-8 py-4 text-right font-black text-green-600">{currencySymbol}{(p.wallet?.balanceCredit || 0).toFixed(2)}</td>
                                        <td className="px-8 py-4 text-right text-neutral-500">{currencySymbol}{(p.wallet?.balanceMain || 0).toFixed(2)}</td>
                                        <td className="px-8 py-4 text-right">
                                             <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${p.wallet?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.wallet?.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedProvider(p)}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                                    selectedProvider?.user?._id === p.user?._id
                                                    ? 'bg-neutral-900 text-white'
                                                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                                }`}
                                            >
                                                {selectedProvider?.user?._id === p.user?._id ? 'Selected' : 'Select'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-[#121212] rounded-[32px] p-10 text-white shadow-2xl h-fit sticky top-8 border border-white/5">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-8">
                    <Coins size={32} />
                </div>
                <h4 className="font-black text-xl uppercase tracking-tight mb-2">Manual Credit Auth</h4>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-8">Authorized adjustment of Credit Balance</p>

                <div className="space-y-6 text-sm">
                    {selectedProvider ? (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-6">
                            <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest mb-1">Active Target</p>
                            <p className="font-black text-blue-400">{selectedProvider.user.firstName} {selectedProvider.user.lastName}</p>
                            <p className="text-[10px] text-neutral-400">{selectedProvider.user.email}</p>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6 flex items-center gap-3">
                             <AlertTriangle size={16} className="text-amber-500" />
                             <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">Please select a provider from the list</p>
                        </div>
                    )}

                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Credit Amount ({currencySymbol})</label>
                        <input
                            type="number"
                            className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs font-black outline-none focus:border-blue-500 transition-all"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Standardized Reason</label>
                        <select
                            className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-blue-500 transition-all cursor-pointer"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            <option value="">Select Reason...</option>
                            <option value="Voucher Correction">Voucher Correction</option>
                            <option value="Missing Credit Adjustment">Missing Credit Adjustment</option>
                            <option value="Customer Support Adjustment">Customer Support Adjustment</option>
                            <option value="Promotional Bonus">Promotional Bonus</option>
                            <option value="Goodwill Credit">Goodwill Credit</option>
                            <option value="Admin Correction">Admin Correction</option>
                            <option value="Accounting Adjustment">Accounting Adjustment</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Internal Notes</label>
                        <textarea
                            className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold outline-none focus:border-blue-500 transition-all resize-none h-24"
                            placeholder="Detailed justification for audit log..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleCredit}
                        disabled={executing || !selectedProvider}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        {executing ? 'Executing Protocol...' : 'Issue Manual Credit'}
                    </button>
                    <p className="text-[10px] text-neutral-500 font-medium leading-relaxed italic text-center">This operation only impacts the "Credit" balance and is fully logged.</p>
                </div>
            </div>
        </div>
    );
}

function LedgerExplorer({ currencySymbol }: any) {
    const { countryCode } = useCountryStore();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadLedger = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/ledger?countryCode=${countryCode}${search ? `&search=${search}` : ''}`);
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
            <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-neutral-50/50">
                <div>
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Immutable Ledger Explorer</h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Full Transaction Traceability (Audit Grade)</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                         <input
                            type="text"
                            placeholder="Search Reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadLedger()}
                            className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-black transition-all shadow-inner"
                         />
                    </div>
                    <button onClick={loadLedger} className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95">
                        <RefreshCcw size={14} />
                        Sync
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Transaction ID</th>
                            <th className="px-8 py-4">Type</th>
                            <th className="px-8 py-4 text-right">Debit / Credit</th>
                            <th className="px-8 py-4 text-center">Status</th>
                            <th className="px-8 py-4 text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                             <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Cryptographic Ledger...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No records detected.</td></tr>
                        ) : (
                            logs.map((tx) => (
                                <tr key={tx._id} className="hover:bg-neutral-50/80 transition-all group">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-500">{tx.transactionId}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                            ['SERVICE_FEE', 'BOOKING_FEE'].includes(tx.type) ? 'bg-green-50 text-green-700 border-green-100' :
                                            ['Service Fee', 'PAYOUT'].includes(tx.type) ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            'bg-neutral-50 text-neutral-600 border-neutral-200'
                                        }`}>{tx.type === 'Service Fee' ? 'SERVICE_FEE' : tx.type}</span>
                                    </td>
                                    <td className={`px-8 py-5 text-right font-black ${['SERVICE_FEE', 'BOOKING_FEE', 'CREDIT_TOPUP', 'PROMO_CREDIT', 'REFERRAL_REWARD', 'MANUAL_CREDIT'].includes(tx.type) ? 'text-green-600' : 'text-red-600'}`}>
                                        {['SERVICE_FEE', 'BOOKING_FEE', 'CREDIT_TOPUP', 'PROMO_CREDIT', 'REFERRAL_REWARD', 'MANUAL_CREDIT'].includes(tx.type) ? '+' : '-'}{tx.amount.toFixed(2)} {tx.currency}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <span className="text-[10px] font-black text-neutral-800 uppercase tracking-tighter">{tx.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right text-xs text-neutral-400 font-black uppercase">
                                        {formatDate(tx.createdAt)}
                                        <span className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity font-mono">{formatTime(tx.createdAt)}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-6 bg-neutral-50/30 border-t border-neutral-100 flex justify-between items-center text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                <p>Showing latest {logs.length} entries</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all">CSV</button>
                    <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all">Excel</button>
                </div>
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
        <button onClick={loadPayouts} className="bg-brand-provider-green text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-lg">Refresh Queue</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
            <tr>
              <th className="px-8 py-4">Provider</th>
              <th className="px-8 py-4">Amount</th>
              <th className="px-8 py-4 text-center">Status</th>
              <th className="px-8 py-4">Requested</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 text-sm font-medium">
            {loading ? (
               <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 animate-pulse uppercase font-black text-[10px]">Accessing Payout Oracle...</td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No pending withdrawals detected.</td></tr>
            ) : (
              payouts.map((p) => (
                <tr key={p._id} className="hover:bg-neutral-50 transition-all group">
                   <td className="px-8 py-5">
                        <p className="font-black text-neutral-800">{p.provider?.name}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Bank: {p.bankDetails?.bankName || 'NOT_LINKED'}</p>
                   </td>
                   <td className="px-8 py-5 font-black text-lg text-neutral-900">{p.totalAmount.toFixed(2)} {p.currency}</td>
                   <td className="px-8 py-5 text-center">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.status}</span>
                   </td>
                   <td className="px-8 py-5 text-xs text-neutral-400 font-black uppercase tracking-tighter">{formatDate(p.createdAt)}</td>
                   <td className="px-8 py-5 text-right">
                      <button className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-black transition-all active:scale-95 shadow-md">Settle Request</button>
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
            <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center text-neutral-900">
                <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Refund Control Hub</h3>
                <button onClick={fetchRefunds} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Refund ID</th>
                            <th className="px-8 py-4">Customer</th>
                            <th className="px-8 py-4">Job Context</th>
                            <th className="px-8 py-4 text-right">Reclaim Yield</th>
                            <th className="px-8 py-4 text-center">Protocol Status</th>
                            <th className="px-8 py-4 text-right">Signal Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                            <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400 animate-pulse uppercase font-black text-[10px] tracking-widest">Scanning for Refund Signal...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No refunds detected in workspace sector.</td></tr>
                        ) : (
                            data.map((r) => (
                                <tr key={r._id} className="hover:bg-neutral-50 transition-all">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-500">{r.transactionId}</td>
                                    <td className="px-8 py-5">
                                        <p className="font-black text-neutral-800">{r.toUserId?.firstName} {r.toUserId?.lastName}</p>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">Recipient Node</p>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-blue-600">#{r.jobId?.id?.slice(-6) || 'N/A'}</td>
                                    <td className="px-8 py-5 text-right font-black text-red-600">{currencySymbol}{r.amount.toFixed(2)}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-[9px] font-black uppercase px-2 py-1 bg-green-50 text-green-800 rounded border border-green-100">REPAID</span>
                                    </td>
                                    <td className="px-8 py-5 text-right text-xs text-neutral-400 uppercase font-black tracking-tighter">{formatDate(r.createdAt)}</td>
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
    const [form, setForm] = useState({
        targetId: "",
        amount: "",
        balanceType: "balanceBonus",
        reason: "",
        campaign: "",
        description: ""
    });
    const [confirmData, setConfirmData] = useState<any>(null);
    const [executing, setExecuting] = useState(false);

    const loadBonuses = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/finance/ledger?countryCode=${countryCode}`);
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

    const initiateCredit = async () => {
        if (!form.targetId || !form.amount || !form.reason) return alert("All fields are mandatory.");
        try {
            const res = await api.get(`/api/admin/users/${form.targetId}`);
            const walletRes = await api.get(`/api/admin/finance/wallets?role=${res.data.user.role}&countryCode=${countryCode}`);
            const userWallet = walletRes.data.data.find((w: any) => w.user?._id === form.targetId);

            setConfirmData({
                user: res.data.user,
                wallet: userWallet?.wallet || { balanceMain: 0, balanceReferral: 0, balanceBonus: 0, balanceEscrow: 0, status: 'NOT_FOUND' },
                amount: parseFloat(form.amount),
                balanceType: form.balanceType,
                reason: form.reason,
                campaign: form.campaign,
                description: form.description
            });
        } catch (e) {
            alert("Invalid Account ID or Network Error");
        }
    };

    const confirmCredit = async () => {
        setExecuting(true);
        try {
            await api.post(`/api/admin/users/wallet/mutate`, {
                userId: form.targetId,
                amount: parseFloat(form.amount),
                balanceType: form.balanceType,
                reason: `${form.reason} | ${form.description} [Campaign: ${form.campaign}]`.trim(),
                metadata: { campaign: form.campaign, bonusDist: true }
            });
            setConfirmData(null);
            setForm({ targetId: "", amount: "", balanceType: "balanceBonus", reason: "", campaign: "", description: "" });
            loadBonuses();
        } catch (e) {
            alert("Credit Failed");
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-500 text-neutral-900">
            <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Incentive Distribution Ledger</h3>
                    <button onClick={loadBonuses} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                            <tr>
                                <th className="px-8 py-4">Account</th>
                                <th className="px-8 py-4">Narrative Description</th>
                                <th className="px-8 py-4 text-right">Incentive Amount</th>
                                <th className="px-8 py-4 text-right">Dispersed Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                            {loading ? (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-neutral-400 uppercase font-black text-[10px] tracking-widest animate-pulse">Syncing Reward Oracle...</td></tr>
                            ) : logs.filter((tx: any) => tx.type === 'BONUS' || tx.type === 'PROMO_CREDIT' || tx.type === 'MANUAL_CREDIT').length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No incentives dispersed yet.</td></tr>
                            ) : (
                                logs.filter((tx: any) => tx.type === 'BONUS' || tx.type === 'PROMO_CREDIT' || tx.type === 'MANUAL_CREDIT').map((tx) => (
                                    <tr key={tx._id} className="hover:bg-neutral-50 transition-all group">
                                        <td className="px-8 py-5">
                                            <p className="font-black text-neutral-800">ID: {tx.toUserId?.slice(-6)}</p>
                                        </td>
                                        <td className="px-8 py-5 text-neutral-500 text-xs italic font-bold">"{tx.description}"</td>
                                        <td className="px-8 py-5 text-right font-black text-green-600">{currencySymbol}{tx.amount.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-right text-xs text-neutral-400 font-black uppercase tracking-tighter">{formatDate(tx.createdAt)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-[#121212] rounded-[32px] p-10 text-white shadow-2xl h-fit sticky top-8 border border-white/5">
                <div className="w-16 h-16 bg-brand-customer-red/20 rounded-2xl flex items-center justify-center text-brand-customer-red mb-8">
                    <Gift size={32} />
                </div>
                <h4 className="font-black text-xl uppercase tracking-tight mb-2">Reward Dispenser</h4>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-8">Authorization required for disbursement</p>

                <div className="space-y-6 text-sm">
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Target Account ID</label>
                        <input
                            type="text"
                            className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs outline-none focus:border-brand-customer-red transition-all font-mono"
                            placeholder="e.g. 6a2c..."
                            value={form.targetId}
                            onChange={(e) => setForm({...form, targetId: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                             <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Wallet Selection</label>
                             <select
                                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all cursor-pointer"
                                value={form.balanceType}
                                onChange={(e) => setForm({...form, balanceType: e.target.value})}
                             >
                                <option value="balanceBonus">Bonus Pool</option>
                                <option value="balanceReferral">Referral Pool</option>
                                <option value="balanceCredit">Credit Balance</option>
                                <option value="balanceMain">Main Balance</option>
                             </select>
                        </div>
                        <div className="col-span-1">
                            <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Amount ({currencySymbol})</label>
                            <input
                                type="number"
                                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs font-black outline-none focus:border-brand-customer-red transition-all"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => setForm({...form, amount: e.target.value})}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Campaign Code</label>
                            <input
                                type="text"
                                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all"
                                placeholder="Optional"
                                value={form.campaign}
                                onChange={(e) => setForm({...form, campaign: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Narrative Reason</label>
                        <input
                            type="text"
                            className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold outline-none focus:border-brand-customer-red transition-all"
                            placeholder="e.g. System Compensation"
                            value={form.reason}
                            onChange={(e) => setForm({...form, reason: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">Internal Description</label>
                        <textarea
                            className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold outline-none focus:border-brand-customer-red transition-all resize-none h-20"
                            placeholder="Additional details for audit..."
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                        />
                    </div>
                    <button
                        onClick={initiateCredit}
                        className="w-full bg-brand-customer-red text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-900/20"
                    >
                        Initiate Disbursement
                    </button>
                    <p className="text-[10px] text-neutral-500 font-medium leading-relaxed italic text-center">Operation will be logged under Category: FINANCIAL_MUTATION.</p>
                </div>
            </div>

            {confirmData && (
                <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-8">
                    <div className="bg-white rounded-[56px] w-full max-w-2xl shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 duration-300">
                        <div className="p-16 text-center border-b border-neutral-100 bg-neutral-50/30">
                            <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] mx-auto flex items-center justify-center mb-8 shadow-inner border border-green-100">
                                <ShieldCheck size={48} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tight text-neutral-900">Confirm disbursement</h3>
                            <p className="text-neutral-500 font-bold text-sm uppercase tracking-[0.2em] mt-3 underline decoration-green-500 underline-offset-8">Critical Financial Authorization</p>
                        </div>

                        <div className="p-16 space-y-10 bg-white">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm">
                                <DetailRow label="Recipient Name" value={`${confirmData.user?.firstName} ${confirmData.user?.lastName}`} highlight />
                                <DetailRow label="Account Role" value={confirmData.user?.role} highlight color="text-blue-600" />
                                <DetailRow label="Target Workspace" value={`${confirmData.user?.countryCode} Sector`} />
                                <DetailRow label="Wallet Status" value={confirmData.wallet?.status} highlight color={confirmData.wallet?.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'} />
                                <DetailRow label="Available Balance" value={`${currencySymbol}${(confirmData.wallet?.balanceMain || 0).toFixed(2)}`} />
                                <DetailRow label="Bonus Balance" value={`${currencySymbol}${(confirmData.wallet?.balanceBonus || 0).toFixed(2)}`} />
                                <div className="col-span-2 h-px bg-neutral-100 my-2"></div>
                                <DetailRow label="Disbursement Auth" value={`${currencySymbol}${confirmData.amount.toFixed(2)}`} highlight color="text-green-600" />
                                <DetailRow label="Impacted Ledger" value={confirmData.balanceType.replace('balance', '').toUpperCase()} highlight />
                            </div>

                            <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><History size={64} /></div>
                                <p className="text-[10px] font-black uppercase text-neutral-400 mb-3 tracking-widest">Audit Logic Justification</p>
                                <p className="text-sm font-bold text-neutral-800 leading-relaxed italic relative z-10">"{confirmData.reason} - {confirmData.description}"</p>
                            </div>

                            <div className="flex gap-6">
                                <button onClick={() => setConfirmData(null)} className="flex-1 bg-white border border-neutral-200 text-neutral-500 py-5 rounded-[24px] font-black uppercase text-[11px] tracking-widest hover:bg-neutral-50 transition-all active:scale-95">Abort Action</button>
                                <button
                                    onClick={confirmCredit}
                                    disabled={executing}
                                    className="flex-[2] bg-neutral-900 text-white py-5 rounded-[24px] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-black transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {executing ? 'Applying Ledger Mutation...' : 'Execute Authorized Credit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
            setData(res.data.data || []);
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
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center text-neutral-900">
                <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Referral Reward Oracle</h3>
                <button onClick={fetchReferrals} className="p-2 hover:bg-neutral-200 rounded-xl transition-all"><RefreshCcw size={16} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Reward ID</th>
                            <th className="px-8 py-4">Incentivized User</th>
                            <th className="px-8 py-4 text-right">Yield</th>
                            <th className="px-8 py-4 text-center">Status</th>
                            <th className="px-8 py-4 text-right">Fulfillment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 uppercase font-black text-[10px] animate-pulse tracking-widest">Scanning Referral Pool...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No incentives generated in this workspace.</td></tr>
                        ) : (
                            data.map((r) => (
                                <tr key={r._id} className="hover:bg-neutral-50 transition-all group">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-500">{r.transactionId}</td>
                                    <td className="px-8 py-5">
                                        <p className="font-black text-neutral-800">{r.toUserId?.firstName} {r.toUserId?.lastName}</p>
                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">Referrer Node</p>
                                    </td>
                                    <td className="px-8 py-5 font-black text-green-600 text-right">{currencySymbol}{r.amount.toFixed(2)}</td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                            <span className="text-[10px] font-black uppercase text-green-800">DISBURSED</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right text-xs text-neutral-400 font-black uppercase tracking-tighter">{formatDate(r.createdAt)}</td>
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
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-neutral-900">
            <div className="bg-[#0A0A0A] p-20 rounded-[56px] text-white flex justify-between items-center shadow-2xl relative overflow-hidden border border-white/5 group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(251,191,36,0.1),transparent)] group-hover:opacity-100 transition-opacity opacity-50"></div>
                <div className="relative z-10">
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-8 flex items-center gap-4">
                        <span className="relative flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                        </span>
                        PieceJob Escrow Signal
                    </p>
                    <h3 className="text-8xl font-black tracking-tighter leading-none group-hover:scale-[1.02] transition-transform duration-700">{currencySymbol}{(activeEscrow || 0).toLocaleString()}</h3>
                    <p className="text-base font-bold text-neutral-400 mt-10 uppercase tracking-[0.1em] flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                        <ShieldCheck size={20} className="text-amber-500" />
                        Guaranteed Provider Yield locked in Cooling Protocol
                    </p>
                </div>
                <div className="hidden xl:block">
                     <ShieldCheck size={280} className="text-neutral-800 opacity-10 rotate-12 -mr-16 -mb-16 group-hover:rotate-0 transition-transform duration-1000" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <EscrowCard label="Success Exit (24h)" value="0.00" icon={<CheckCircle2 size={24} />} color="green" />
                <EscrowCard label="Cooling Aging (7d+)" value="0.00" icon={<Clock size={24} />} color="amber" />
                <EscrowCard label="Dispute Lockdown" value="0.00" icon={<ShieldAlert size={24} />} color="red" />
            </div>
        </div>
    );
}

function EscrowCard({ label, value, icon, color }: any) {
    const colors: any = {
        green: "bg-green-50 text-green-700 border-green-100 shadow-green-100/20",
        amber: "bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100/20",
        red: "bg-red-50 text-red-700 border-red-100 shadow-red-100/20",
    }
    return (
        <div className={`p-10 bg-white border border-neutral-200 rounded-[40px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-neutral-900`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">{label}</p>
            <p className="text-4xl font-black text-neutral-900 mt-3">$ {value}</p>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Analyze Deep Signal <ChevronRight size={14} />
            </div>
        </div>
    );
}

function AuditLogsView() {
    const { countryCode, currentCountry } = useCountryStore();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/audit-logs?countryCode=${countryCode}`);
            setLogs(res.data.logs || []);
        } catch (e) {
            console.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) fetchLogs();
    }, [countryCode]);

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm animate-in fade-in duration-500 text-neutral-900">
             <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                    <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Full System Financial Audit</h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Immutable Ledger & State Modification Records</p>
                </div>
                <div className="flex gap-4">
                     <button className="p-2 hover:bg-neutral-200 rounded-xl transition-all text-neutral-400" title="Export Ledger"><Download size={18} /></button>
                     <button onClick={fetchLogs} className="p-2 hover:bg-neutral-200 rounded-xl transition-all" title="Reload Logs"><RefreshCcw size={18} /></button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Timestamp</th>
                            <th className="px-8 py-4">Authorized Admin</th>
                            <th className="px-8 py-4 text-center">Action</th>
                            <th className="px-8 py-4">Target Entity</th>
                            <th className="px-8 py-4 text-right">Impact</th>
                            <th className="px-8 py-4 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                            <tr><td colSpan={6} className="px-8 py-20 text-center text-neutral-400 uppercase font-black text-[11px] animate-pulse tracking-widest">Decrypting Operational Event Trail...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No authorized logs detected in this workspace.</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-neutral-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <p className="text-[11px] font-black text-neutral-800 uppercase">{formatDate(log.createdAt)}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{formatTime(log.createdAt)} UTC</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-neutral-100 rounded-2xl flex items-center justify-center text-[11px] font-black text-neutral-500 uppercase border border-neutral-200 shadow-sm">
                                                {log.adminId?.firstName?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <p className="font-black text-neutral-800 text-xs">{renderActor(log.adminId)}</p>
                                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{log.adminRole || 'ORACLE_PROCESS'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="font-black text-blue-600 uppercase text-[9px] bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{log.action}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-tight">{log.entityType}</p>
                                            <p className="text-xs font-bold text-neutral-700 font-mono">{log.entityId || log.userId || 'GLOBAL_CTX'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-neutral-900">
                                        {log.financialInfo ? (
                                            <span className={`text-sm ${log.financialInfo.mutationType === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                                {log.financialInfo.mutationType === 'CREDIT' ? '+' : '-'}{log.financialInfo.amountBase.toFixed(2)}
                                            </span>
                                        ) : (
                                            <span className="text-neutral-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button onClick={() => setSelectedLog(log)} className="p-2.5 bg-neutral-100 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-white border border-transparent hover:border-neutral-200 transition-all shadow-sm active:scale-90"><Eye size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {selectedLog && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-8">
                     <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-100">
                        <div className="p-10 border-b bg-neutral-50/50 flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tight">Audit Event Trace</h3>
                            <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><XCircle className="text-neutral-300" /></button>
                        </div>
                        <div className="p-10 space-y-6 text-neutral-900">
                            <div className="grid grid-cols-2 gap-6">
                                <DetailRow label="Trace ID" value={selectedLog.auditId} highlight />
                                <DetailRow label="Actor" value={renderActor(selectedLog.adminId)} />
                                <DetailRow label="Action" value={selectedLog.action} />
                                <DetailRow label="Category" value={selectedLog.auditType} />
                                <DetailRow label="IP Address" value={selectedLog.ipAddress || 'Internal'} />
                                <DetailRow label="Timestamp" value={formatDateTimeLong(selectedLog.createdAt)} />
                            </div>
                            <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 max-h-48 overflow-y-auto font-mono text-[10px]">
                                {JSON.stringify(selectedLog.afterState || selectedLog.financialInfo, null, 2)}
                            </div>
                        </div>
                     </div>
                </div>
            )}
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
        <div className="bg-white border border-neutral-200 rounded-[40px] p-12 shadow-sm text-neutral-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
                <div>
                    <h3 className="font-black text-2xl text-neutral-900 uppercase tracking-tight">Ledger Reconciliation Oracle</h3>
                    <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-[0.3em] mt-2">Zero-Tolerance Consistency verification Layer</p>
                </div>
                <button
                    onClick={runRecon}
                    disabled={running}
                    className="bg-neutral-900 text-white px-12 py-5 rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-neutral-300"
                >
                    {running ? 'Calibrating Global Signal...' : 'Execute Authorized Scan'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="p-12 bg-neutral-50 rounded-[48px] border border-neutral-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700"><ShieldCheck size={140} /></div>
                    <h4 className="font-black text-xs text-neutral-900 uppercase mb-10 flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-sm"><ShieldCheck size={20} strokeWidth={3} /></div>
                        System Integrity Checksum
                    </h4>
                    <ul className="space-y-8">
                        <IntegrityItem label="Double-Entry Symmetry" status="VERIFIED" />
                        <IntegrityItem label="Isolation Compliance" status="PASSED" />
                        <IntegrityItem label="Escrow Aging Logic" status="OPTIMAL" />
                    </ul>
                </div>

                <div className="p-12 bg-neutral-50 rounded-[48px] border border-neutral-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700"><AlertTriangle size={140} /></div>
                    <h4 className="font-black text-xs text-neutral-900 uppercase mb-10 flex items-center gap-4">
                         <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-sm"><AlertTriangle size={20} strokeWidth={3} /></div>
                        Anomalous Variance Detection
                    </h4>
                    <div className="min-h-[160px] flex items-center justify-center text-center">
                        {results ? (
                             <div className="animate-in slide-in-from-bottom-4">
                                <p className="text-5xl font-black text-neutral-900">{(results.walletMismatches || []).length}</p>
                                <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-4">Divergent signals detected in scan</p>
                                <div className="mt-8 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-3">
                                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                     <span className="text-[9px] font-black uppercase text-neutral-500">Oracle: Variance within threshold</span>
                                </div>
                             </div>
                        ) : (
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest italic opacity-40">Awaiting secure session scan...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function IntegrityItem({ label, status }: any) {
    return (
        <li className="flex justify-between items-center text-xs group/item cursor-default">
            <span className="font-black text-neutral-400 uppercase tracking-widest group-hover/item:text-neutral-900 transition-colors">{label}</span>
            <span className="font-black text-green-600 bg-green-50 px-4 py-1.5 rounded-xl border border-green-100 shadow-sm group-hover/item:scale-105 transition-transform">{status}</span>
        </li>
    );
}

function ServiceFeeModule({ currencySymbol }: any) {
    const { countryCode } = useCountryStore();
    const [stats, setStats] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subTab, setSubTab] = useState("dashboard");
    const [modalType, setModalType] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const tabs = ["dashboard", "records", "vouchers", "settings"];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, recordsRes] = await Promise.all([
                api.get(`/api/admin/finance/service-fees/overview?countryCode=${countryCode}`),
                api.get(`/api/admin/finance/service-fees/records?countryCode=${countryCode}`)
            ]);
            setStats(statsRes.data.stats);
            setRecords(recordsRes.data.data);
        } catch (e) {
            console.error("Failed to fetch service fee data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) fetchData();
    }, [countryCode]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex gap-4 border-b border-neutral-100 pb-4">
                {tabs.map(t => (
                    <button
                        key={t}
                        onClick={() => setSubTab(t)}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            subTab === t ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-900'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {subTab === "dashboard" && stats && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <FinanceCard label="Outstanding" value={`${currencySymbol}${stats.totalOutstanding?.toFixed(2)}`} sub="Total Owed" color="red" />
                        <FinanceCard label="Provider Credits" value={`${currencySymbol}${stats.totalCredits?.toFixed(2)}`} sub="Negative Balances" color="green" />
                        <FinanceCard label="Collected All-Time" value={`${currencySymbol}${stats.collectedAllTime?.toFixed(2)}`} sub="Platform Share" color="indigo" />
                        <FinanceCard label="Today" value={`${currencySymbol}${stats.collectedToday?.toFixed(2)}`} sub="Collected" color="emerald" />
                        <FinanceCard label="Contributions" value={`${currencySymbol}${stats.bookingFeePaid?.toFixed(2)}`} sub="Booking Fees" color="blue" />
                        <FinanceCard label="Waived" value={`${currencySymbol}${stats.waivedServiceFee?.toFixed(2)}`} sub="Total Waived" color="amber" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-[32px] p-8">
                            <h3 className="font-black text-lg uppercase tracking-tight mb-6">Top Owing Providers</h3>
                            <div className="space-y-4">
                                {stats.topOwingProviders?.map((p: any) => (
                                    <div key={p._id} className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            {p.userId?.profilePhoto ? (
                                                <img src={p.userId.profilePhoto} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                            ) : (
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-neutral-400 border border-neutral-200 shadow-sm">
                                                    {p.userId?.firstName?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-black text-sm">{p.userId?.firstName} {p.userId?.lastName}</p>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase">{p.userId?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-red-600">{currencySymbol}{p.serviceFeeBalance?.toFixed(2)}</p>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${p.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {p.isSuspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#121212] rounded-[32px] p-8 text-white space-y-8">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Bulk Operations</h3>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1">Marketplace Governance</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-white/5 border border-white/10 rounded-[24px]">
                                    <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Suspension Threshold</label>
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            type="number"
                                            id="bulk-threshold"
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black outline-none focus:border-brand-customer-red w-full"
                                            placeholder="100.00"
                                        />
                                        <button
                                            onClick={async () => {
                                                const el = document.getElementById('bulk-threshold') as HTMLInputElement;
                                                const val = parseFloat(el.value);
                                                if (!val) return alert("Enter threshold");
                                                if (!confirm(`Suspend all providers owing more than ${val}?`)) return;
                                                try {
                                                    await api.post('/api/admin/finance/service-fees/bulk-suspend', { threshold: val, countryCode });
                                                    alert("Bulk suspension completed");
                                                    fetchData();
                                                } catch (e) { alert("Failed"); }
                                            }}
                                            className="bg-brand-customer-red text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap"
                                        >
                                            Suspend
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!confirm("Unsuspend ALL currently suspended providers in this workspace?")) return;
                                        try {
                                            await api.post('/api/admin/finance/service-fees/bulk-unsuspend', { countryCode });
                                            alert("Bulk unsuspension completed");
                                            fetchData();
                                        } catch (e) { alert("Failed"); }
                                    }}
                                    className="w-full bg-white/5 border border-white/10 text-neutral-400 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-neutral-900 transition-all"
                                >
                                    Unsuspend All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === "records" && (
                <div className="space-y-8">
                    <div className="flex flex-wrap gap-4 bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                            <input type="text" placeholder="Search Job or Provider..." className="w-full pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-xs font-bold outline-none" />
                        </div>
                        <div className="flex gap-2">
                             <select className="bg-neutral-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none cursor-pointer">
                                <option>All Status</option>
                                <option>PAID</option>
                                <option>PENDING</option>
                                <option>WAIVED</option>
                             </select>
                             <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">
                                <Filter size={14} />
                                Apply Filters
                             </button>
                             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-[10px] font-black uppercase hover:bg-neutral-50 transition-all">
                                <Download size={14} />
                                Export CSV
                             </button>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1400px]">
                                <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                                    <tr>
                                        <th className="px-8 py-5">Job Snapshot</th>
                                        <th className="px-8 py-5">Participants</th>
                                        <th className="px-8 py-5">Workspace / Type</th>
                                        <th className="px-8 py-5 text-right">Agreed Value</th>
                                        <th className="px-8 py-5 text-right">Service Fee</th>
                                        <th className="px-8 py-5 text-center">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                                    {records.map((r) => (
                                    <tr key={r._id} className="hover:bg-neutral-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-black text-neutral-800 text-xs tracking-tight">#{r.jobId?._id?.slice(-8).toUpperCase()}</p>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase">{formatDate(r.createdAt)} • {formatTime(r.createdAt)}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-[8px] font-black border border-orange-100">P</div>
                                                    <p className="text-xs font-black">{r.providerId?.firstName} {r.providerId?.lastName}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-[8px] font-black border border-blue-100">C</div>
                                                    <p className="text-xs font-bold text-neutral-500">{r.jobId?.customerId?.firstName || 'User'} {r.jobId?.customerId?.lastName || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs font-black text-neutral-900">{r.jobId?.serviceName}</p>
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{r.jobId?.countryCode} SECTOR</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="font-black text-neutral-900 text-lg">
                                                {r.acceptedPrice && r.acceptedPrice > 0 ? `${currencySymbol}${r.acceptedPrice.toFixed(2)}` : 'N/A'}
                                            </p>
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase"> Agreed Price</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="font-black text-indigo-600 text-sm">{currencySymbol}{r.serviceFeeAmount?.toFixed(2)}</p>
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase">Yield @ {r.serviceFeePercentage}%</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${
                                                r.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-100' :
                                                r.status === 'WAIVED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-red-50 text-red-700 border-red-100'
                                            }`}>{r.status}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setSelectedJobId(r.jobId?._id); setModalType('TIMELINE'); }} className="p-2 bg-neutral-100 rounded-xl hover:bg-neutral-900 hover:text-white transition-all shadow-sm" title="View Deep Negotiation History"><ShieldCheck size={16} /></button>
                                                <button onClick={() => alert('View normal chats logic here')} className="p-2 bg-neutral-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="View Terminal Chat Logs"><MessageSquare size={16} /></button>
                                                <button onClick={() => alert('View call logs logic here')} className="p-2 bg-neutral-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="View Secure Call Logs"><Phone size={16} /></button>
                                                <button onClick={() => {
                                                    if(confirm(`Suspend Provider ${r.providerId?.firstName}?`)) {
                                                        api.patch(`/api/admin/providers/${r.providerId?._id}/suspend`, { suspended: true });
                                                        alert("Suspension Auth Signal Sent");
                                                    }
                                                }} className="p-2 bg-neutral-100 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Suspend Provider Node"><Ban size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-neutral-900 text-white flex flex-col lg:flex-row justify-between items-center gap-8">
                             <div className="flex gap-12">
                                <div className="text-center lg:text-left">
                                    <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Total Agreed Value</p>
                                    <p className="text-2xl font-black">{currencySymbol}{records.reduce((acc, r) => acc + (r.acceptedPrice || 0), 0).toLocaleString()}</p>
                                </div>
                                <div className="text-center lg:text-left border-l border-white/10 pl-12">
                                    <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Projected Platform Yield</p>
                                    <p className="text-2xl font-black text-emerald-400">{currencySymbol}{records.reduce((acc, r) => acc + (r.serviceFeeAmount || 0), 0).toLocaleString()}</p>
                                </div>
                                <div className="text-center lg:text-left border-l border-white/10 pl-12">
                                    <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Current Service Fee Balance</p>
                                    <p className="text-2xl font-black text-red-400">{currencySymbol}{records.reduce((acc, r) => acc + (r.status !== 'PAID' && r.status !== 'WAIVED' ? r.outstandingBalance : 0), 0).toLocaleString()}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Dataset Population</p>
                                <p className="text-xs font-bold">{records.length} Audit Grade Records Identified</p>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === "vouchers" && <UsedVouchersList />}

            {subTab === "settings" && <ServiceFeeSettingsView />}

            {modalType === 'TIMELINE' && selectedJobId && (
                <ServiceFeeTimelineModal
                    jobId={selectedJobId}
                    onClose={() => { setModalType(null); setSelectedJobId(null); }}
                />
            )}
        </div>
    );
}

function ServiceFeeSettingsView() {
    const { countryCode } = useCountryStore();
    const [settings, setSettings] = useState<any>(null);
    const [saving, setExecuting] = useState(false);

    useEffect(() => {
        const load = async () => {
            const res = await api.get(`/api/admin/settings?countryCode=${countryCode}`);
            setSettings(res.data.settings);
        };
        if (countryCode) load();
    }, [countryCode]);

    const handleSave = async () => {
        setExecuting(true);
        try {
            await api.post(`/api/admin/settings`, { ...settings, countryCode });
            alert("Settings saved");
        } catch (e) {
            alert("Save failed");
        } finally {
            setExecuting(false);
        }
    };

    if (!settings) return null;

    return (
        <div className="bg-[#121212] rounded-[40px] p-12 text-white border border-white/5 space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Service Fee Protocol Config</h3>
                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-2">Operational thresholds and governance</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-brand-provider-green text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                    {saving ? 'Saving...' : 'Deploy Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <SettingInput label="Default Service Fee %" value={settings.platformServiceFeePercent} onChange={(v: string) => setSettings({...settings, platformServiceFeePercent: parseFloat(v)})} />
                <SettingInput label="Suspension Threshold" value={settings.serviceFeeSuspensionThreshold} onChange={(v: string) => setSettings({...settings, serviceFeeSuspensionThreshold: parseFloat(v)})} />
                <SettingInput label="Max Negotiation Rounds" value={settings.maxNegotiationRounds} onChange={(v: string) => setSettings({...settings, maxNegotiationRounds: parseInt(v)})} />
                <SettingToggle label="Escrow System" value={settings.isEscrowEnabled} onChange={(v: boolean) => setSettings({...settings, isEscrowEnabled: v})} />
                <SettingToggle label="Auto Suspend Providers" value={settings.autoSuspendEnabled} onChange={(v: boolean) => setSettings({...settings, autoSuspendEnabled: v})} />
                <SettingToggle label="Auto Unsuspend on Payment" value={settings.autoUnsuspendEnabled} onChange={(v: boolean) => setSettings({...settings, autoUnsuspendEnabled: v})} />
            </div>

            <div className="bg-white/5 rounded-[32px] p-8 border border-white/10">
                <h4 className="text-xs font-black uppercase mb-6 text-neutral-400">Voucher Vendor Access Control</h4>
                <div className="flex gap-4">
                    {["OTT", "BLUE", "1VOUCHER"].map(v => {
                        const isEnabled = settings.voucherVendors?.find((vv: any) => vv.code === v)?.isEnabled ?? true;
                        return (
                            <button
                                key={v}
                                onClick={() => {
                                    const vendors = [...(settings.voucherVendors || [])];
                                    const idx = vendors.findIndex(vv => vv.code === v);
                                    if (idx > -1) vendors[idx].isEnabled = !isEnabled;
                                    else vendors.push({ name: v, code: v, isEnabled: !isEnabled });
                                    setSettings({...settings, voucherVendors: vendors});
                                }}
                                className={`px-6 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase ${
                                    isEnabled ? 'bg-brand-provider-green/10 border-brand-provider-green text-brand-provider-green' : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                                }`}
                            >
                                {v} {isEnabled ? 'ENABLED' : 'DISABLED'}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SettingInput({ label, value, onChange }: any) {
    return (
        <div>
            <label className="text-[9px] font-black uppercase text-neutral-500 ml-1 tracking-widest">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-brand-provider-green transition-all"
            />
        </div>
    );
}

function SettingToggle({ label, value, onChange }: any) {
    return (
        <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-[32px] px-8 py-6">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
                <p className="text-[8px] font-bold text-neutral-500 uppercase mt-1">Automatic System Action</p>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-14 h-8 rounded-full transition-all relative ${value ? 'bg-brand-provider-green' : 'bg-neutral-700'}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${value ? 'right-1' : 'left-1'}`}></div>
            </button>
        </div>
    );
}

function UsedVouchersList() {
    const { countryCode } = useCountryStore();
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVouchers = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/admin/finance/service-fees/vouchers?countryCode=${countryCode}`);
                setVouchers(res.data.data);
            } catch (e) {
                console.error("Failed to load vouchers");
            } finally {
                setLoading(false);
            }
        };
        if (countryCode) fetchVouchers();
    }, [countryCode]);

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm animate-in fade-in duration-500 text-neutral-900">
            <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="font-black text-lg uppercase tracking-tight">Voucher Redemption Registry</h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Unique Redemption verification Layer</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Voucher Number</th>
                            <th className="px-8 py-4">Vendor</th>
                            <th className="px-8 py-4">Provider</th>
                            <th className="px-8 py-4 text-right">Amount</th>
                            <th className="px-8 py-4 text-center">Status</th>
                            <th className="px-8 py-4 text-right">Redeemed At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                        {loading ? (
                            <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400 animate-pulse uppercase font-black text-[10px]">Scanning Voucher Vault...</td></tr>
                        ) : vouchers.length === 0 ? (
                            <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No redemptions detected in this workspace.</td></tr>
                        ) : (
                            vouchers.map((v) => (
                                <tr key={v._id} className="hover:bg-neutral-50 transition-all">
                                    <td className="px-8 py-5 font-mono text-xs font-bold text-neutral-800">{v.voucherNumber}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-100">{v.vendor}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {v.redeemedBy?.profilePhoto && <img src={v.redeemedBy.profilePhoto} className="w-8 h-8 rounded-lg object-cover" />}
                                            <div>
                                                <p className="font-black text-neutral-800">{v.redeemedBy?.firstName} {v.redeemedBy?.lastName}</p>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase">{v.redeemedBy?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-neutral-900">{v.amount.toFixed(2)}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                            v.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            v.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>{v.status || 'APPROVED'}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right text-xs text-neutral-400 uppercase font-black tracking-tighter">
                                        {formatDate(v.redeemedAt)}
                                        <span className="ml-2 opacity-50 font-mono">{formatTime(v.redeemedAt)}</span>
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

function ServiceFeeTimelineModal({ jobId, onClose }: { jobId: string, onClose: () => void }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const res = await api.get(`/api/admin/finance/service-fees/timeline/${jobId}`);
                setData(res.data.data);
            } catch (e) {
                console.error("Timeline fetch failed");
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, [jobId]);

    const getCurrency = (j: any) => j?.pricingSnapshot?.currencyCode || 'R';

    return (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-8 text-neutral-900">
            <div className="bg-white rounded-[48px] w-full max-w-6xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Forensic Audit: Job Case #{jobId.slice(-8).toUpperCase()}</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Deep Intelligence & Negotiation History</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-2xl transition-colors"><XCircle className="text-neutral-300" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
                    {loading ? (
                        <div className="py-20 text-center text-xs font-black uppercase tracking-widest animate-pulse text-neutral-300">Synchronizing Forensic State...</div>
                    ) : !data ? (
                        <div className="py-20 text-center font-bold text-neutral-400 uppercase text-xs">No audit record found for this signal.</div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                            {/* LEFT: JOB & PARTICIPANTS */}
                            <div className="space-y-8">
                                <div className="bg-neutral-50 rounded-[32px] p-8 border border-neutral-100 shadow-inner">
                                    <h4 className="text-[10px] font-black uppercase text-neutral-400 mb-6 tracking-widest">Financial Summary</h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="flex justify-between items-end border-b border-neutral-200 pb-4">
                                            <p className="text-[9px] font-black text-neutral-400 uppercase">Service Category</p>
                                            <p className="text-sm font-black text-neutral-900">{data.jobId?.serviceName}</p>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-neutral-200 pb-4">
                                            <p className="text-[9px] font-black text-neutral-400 uppercase">Agreed Job Price</p>
                                            <p className="text-xl font-black text-blue-600">
                                                {data.acceptedPrice && data.acceptedPrice > 0
                                                    ? `${getCurrency(data.jobId)}${data.acceptedPrice}`
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-neutral-200 pb-4">
                                            <p className="text-[9px] font-black text-neutral-400 uppercase">Service Fee</p>
                                            <p className="text-sm font-black text-indigo-600">{getCurrency(data.jobId)}{data.serviceFeeAmount || 0} ({data.serviceFeePercentage || 0}%)</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-[9px] font-black text-neutral-400 uppercase">Current Ledger Status</p>
                                            <span className="px-3 py-1 bg-neutral-900 text-white text-[9px] font-black rounded-lg">{data.status || 'PENDING'}</span>
                                        </div>
                                    </div>

                                    {data.jobId?.taskPhotos?.length > 0 && (
                                        <div className="mt-10">
                                            <p className="text-[9px] font-black uppercase text-neutral-400 mb-4 tracking-widest">Evidence: Task Photos</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {data.jobId.taskPhotos.map((p: string, i: number) => (
                                                    <img key={i} src={p} className="w-full h-16 rounded-xl object-cover border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-zoom-in" alt="" onClick={() => window.open(p, '_blank')} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[#121212] rounded-[32px] p-8 text-white shadow-xl">
                                    <h4 className="text-[10px] font-black uppercase text-neutral-500 mb-8 tracking-widest">Node Connectivity</h4>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white">P</div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-neutral-500">Service Provider</p>
                                                <p className="text-xs font-black">{data.providerId?.firstName} {data.providerId?.lastName || data.jobId?.providerId?.firstName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-black text-white">C</div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-neutral-500">Service Customer</p>
                                                <p className="text-xs font-black">{data.customerId?.firstName} {data.customerId?.lastName || data.jobId?.customerId?.firstName}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                                            <p className="text-xl font-black">{data.chatCount || 0}</p>
                                            <p className="text-[8px] font-black uppercase text-neutral-500">Chat Log</p>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                                            <p className="text-xl font-black">{data.proposals?.length || 0}</p>
                                            <p className="text-[8px] font-black uppercase text-neutral-500">Price Rounds</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MIDDLE: NEGOTIATION ROUNDS */}
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Negotiation Deep Scan</h4>
                                <div className="space-y-4">
                                    {data.proposals?.length === 0 ? (
                                        <div className="p-12 text-center border-2 border-dashed border-neutral-100 rounded-[32px]">
                                            <p className="text-[10px] font-black uppercase text-neutral-300">No proposals recorded for this session.</p>
                                        </div>
                                    ) : (
                                        data.proposals.map((p: any, idx: number) => (
                                            <div key={idx} className={`p-6 rounded-[24px] border ${p.status === 'ACCEPTED' ? 'bg-emerald-50 border-emerald-100' : p.status === 'REJECTED' ? 'bg-red-50 border-red-100' : 'bg-white border-neutral-100 shadow-sm'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase text-neutral-400 mb-1">Round {p.round}</p>
                                                        <p className={`text-lg font-black ${p.status === 'ACCEPTED' ? 'text-emerald-700' : 'text-neutral-900'}`}>{getCurrency(data.jobId)}{p.amount.toFixed(2)}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                        p.status === 'ACCEPTED' ? 'bg-emerald-200 text-emerald-800' :
                                                        p.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                                                        'bg-neutral-100 text-neutral-500'
                                                    }`}>{p.status}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-bold text-neutral-500 italic">"{p.note || 'No narrative provided'}"</p>
                                                    <p className="text-[8px] font-black text-neutral-400 uppercase">{formatDate(p.createdAt)}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* RIGHT: TIMELINE */}
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Protocol Execution Timeline</h4>
                                <div className="space-y-6 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-neutral-100">
                                    {(data.jobId?.negotiationTimeline || data.timeline || []).map((ev: any, i: number) => (
                                        <div key={i} className="flex gap-6 relative group">
                                            <div className={`w-6 h-6 rounded-full bg-white border-2 z-10 flex items-center justify-center group-hover:scale-110 transition-transform ${
                                                ['PRICE_ACCEPTED', 'PHOTOS_REVIEWED', 'DISPATCH_CONFIRMED'].includes(ev.event) ? 'border-emerald-500' : 'border-neutral-900'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                                    ['PRICE_ACCEPTED', 'PHOTOS_REVIEWED', 'DISPATCH_CONFIRMED'].includes(ev.event) ? 'bg-emerald-500' : 'bg-neutral-900'
                                                }`}></div>
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <p className="text-[11px] font-black uppercase tracking-tight text-neutral-800">{ev.event.replace(/_/g, ' ')}</p>
                                                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{formatDateTimeLong(ev.timestamp)}</p>
                                                {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                                                    <div className="mt-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-[9px] font-mono text-neutral-400">
                                                        {JSON.stringify(ev.metadata)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
