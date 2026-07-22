"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  RefreshCcw,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Landmark,
  Eye,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  ArrowDownCircle,
  CreditCard,
  User,
  History,
  TrendingUp,
  Activity
} from 'lucide-react';

const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    try {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return "Error"; }
};

export default function PartnerSettlementConsole({ currencySymbol }: { currencySymbol: string }) {
    const { countryCode } = useCountryStore();
    const [settlements, setSettlements] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedSettlement, setSelectedSettlement] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settlementsRes, statsRes] = await Promise.all([
                api.get(`/api/v1/affiliate/admin/settlements?countryCode=${countryCode}${statusFilter ? `&status=${statusFilter}` : ''}`),
                api.get(`/api/v1/affiliate/admin/settlements/stats?countryCode=${countryCode}`)
            ]);
            setSettlements(settlementsRes.data.data);
            setStats(statsRes.data.data);
        } catch (e) {
            console.error("Failed to fetch settlement data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) fetchData();
    }, [countryCode, statusFilter]);

    const filtered = settlements.filter(s =>
        s.settlementId.toLowerCase().includes(search.toLowerCase()) ||
        s.partnerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.partnerId?.referralCode?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-neutral-900">
            {/* STATS STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Pending Requests" value={stats?.count?.pending || 0} sub="Awaiting Review" color="orange" icon={<Clock size={16} />} />
                <StatCard label="In Processing" value={stats?.count?.processing || 0} sub="Payment Initiated" color="blue" icon={<Activity size={16} />} />
                <StatCard label="Total Paid" value={`${currencySymbol}${stats?.financials?.totalPaid?.toLocaleString() || '0'}`} sub="Lifetime Disbursed" color="green" icon={<CheckCircle2 size={16} />} />
                <StatCard label="Outstanding Liability" value={`${currencySymbol}${stats?.financials?.outstandingLiability?.toLocaleString() || '0'}`} sub="Pending + Approved" color="red" icon={<AlertCircle size={16} />} />
            </div>

            {/* SECONDARY STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <MiniStat label="Approved" value={stats?.count?.approved || 0} color="text-green-600" />
                <MiniStat label="Rejected" value={stats?.count?.rejected || 0} color="text-red-600" />
                <MiniStat label="Today's Vol" value={stats?.volume?.today || 0} color="text-neutral-900" />
                <MiniStat label="Avg Request" value={`${currencySymbol}${stats?.financials?.averageSettlement?.toFixed(0) || '0'}`} color="text-indigo-600" />
                <MiniStat label="Largest" value={`${currencySymbol}${stats?.financials?.largestSettlement?.toFixed(0) || '0'}`} color="text-amber-600" />
            </div>

            {/* TABLE CONSOLE */}
            <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Enterprise Settlement Registry</h3>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Affiliate Partner Payout Management</p>
                    </div>
                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                            <input
                                type="text"
                                placeholder="ID, Partner or Code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-black transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase outline-none cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="PAID">Paid</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <button onClick={fetchData} className="p-2.5 bg-neutral-900 text-white rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"><RefreshCcw size={16} /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                            <tr>
                                <th className="px-8 py-4">Settlement ID</th>
                                <th className="px-8 py-4">Partner Entity</th>
                                <th className="px-8 py-4 text-right">Amount</th>
                                <th className="px-8 py-4 text-center">Status</th>
                                <th className="px-8 py-4">Request Date</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 text-sm font-medium">
                            {loading ? (
                                <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400 uppercase font-black text-[10px] animate-pulse">Synchronizing Settlement Ledger...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase text-[10px]">No settlement requests identified.</td></tr>
                            ) : (
                                filtered.map((s) => (
                                    <tr key={s._id} className="hover:bg-neutral-50 transition-all group">
                                        <td className="px-8 py-5">
                                            <p className="font-black text-neutral-800 text-xs">{s.settlementId}</p>
                                            <p className="text-[9px] font-mono text-neutral-400">Workspace: {s.countryCode}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-black text-xs uppercase">{s.partnerId?.name?.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-xs">{s.partnerId?.name}</p>
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase">{s.partnerId?.referralCode} • {s.partnerId?.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-neutral-900">{currencySymbol}{s.amount.toFixed(2)}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                                s.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' :
                                                s.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                s.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                s.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                                'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>{s.status}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-black text-neutral-600 uppercase">{formatDate(s.createdAt)}</p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => setSelectedSettlement(s)}
                                                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2 ml-auto"
                                            >
                                                <Eye size={14} /> Review Request
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedSettlement && (
                <SettlementDetailModal
                    settlement={selectedSettlement}
                    onClose={() => setSelectedSettlement(null)}
                    onRefresh={() => { setSelectedSettlement(null); fetchData(); }}
                    currencySymbol={currencySymbol}
                />
            )}
        </div>
    );
}

function StatCard({ label, value, sub, color, icon }: any) {
    const colors: any = {
        orange: "bg-amber-50 text-amber-600 border-amber-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };
    return (
        <div className={`p-8 rounded-[32px] border ${colors[color]} shadow-sm hover:shadow-xl transition-all`}>
            <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
                <div className="p-2 bg-white/50 rounded-lg">{icon}</div>
            </div>
            <h3 className="text-3xl font-black mt-4">{value}</h3>
            <p className="text-[10px] font-bold uppercase mt-1 opacity-50">{sub}</p>
        </div>
    );
}

function MiniStat({ label, value, color }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col items-center text-center">
            <p className="text-[8px] font-black uppercase text-neutral-400 tracking-widest mb-1">{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
        </div>
    );
}

function SettlementDetailModal({ settlement, onClose, onRefresh, currencySymbol }: any) {
    const [status, setStatus] = useState(settlement.status);
    const [note, setNote] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [evidenceUrl, setEvidenceUrl] = useState("");
    const [saving, setSaving] = useState(false);

    const partner = settlement.partnerId;

    const handleUpdate = async (newStatus: string) => {
        if (newStatus === 'REJECTED' && !note) return alert("Please provide a reason for rejection.");
        if (newStatus === 'PAID' && !paymentReference) return alert("Please enter payment reference.");

        setSaving(true);
        try {
            await api.patch(`/api/v1/affiliate/admin/settlements/${settlement._id}/status`, {
                status: newStatus,
                note,
                paymentReference,
                evidenceUrl
            });
            onRefresh();
        } catch (e: any) {
            alert(e.response?.data?.message || "Failed to update settlement status");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8 text-neutral-900">
            <div className="bg-white rounded-[56px] w-full max-w-6xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="p-12 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight italic">Protocol<span className="text-brand-customer-red">Settlement</span> Authorization</h3>
                        <p className="text-[11px] text-neutral-400 font-bold uppercase mt-1 tracking-widest">Case ID: {settlement.settlementId} • Workspace: {settlement.countryCode}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full transition-colors"><XCircle size={28} className="text-neutral-300" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                    {/* TOP SECTION: ENTITY & REQUEST */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DetailCard label="Requested Payout" value={`${currencySymbol}${settlement.amount.toFixed(2)}`} color="text-neutral-900" highlight />
                                <DetailCard label="Available Balance" value={`${currencySymbol}${partner.balance?.available?.toFixed(2) || '0.00'}`} color="text-green-600" />
                                <DetailCard label="Lifetime Paid" value={`${currencySymbol}${partner.balance?.paid?.toFixed(2) || '0.00'}`} color="text-blue-600" />
                                <DetailCard label="Lifetime Earnings" value={`${currencySymbol}${partner.balance?.lifetime?.toFixed(2) || '0.00'}`} color="text-neutral-900" />
                            </div>

                            <div className="bg-blue-50/50 rounded-[40px] p-10 border border-blue-100 space-y-8">
                                <div className="flex items-center gap-4 border-b border-blue-100 pb-6">
                                    <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Landmark size={24} /></div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-blue-900">Banking Destination Credentials</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <DetailRow label="Bank Name" value={settlement.bankDetails?.bankName} />
                                    <DetailRow label="Account Holder" value={settlement.bankDetails?.accountHolder} />
                                    <DetailRow label="Account Number" value={settlement.bankDetails?.accountNumber} highlight />
                                    <DetailRow label="Account Type" value={settlement.bankDetails?.accountType} />
                                    <DetailRow label="Branch Code" value={settlement.bankDetails?.branchCode} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-neutral-900 rounded-[40px] p-10 text-white space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-black">{partner.name?.charAt(0)}</div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-tight">{partner.name}</h4>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{partner.referralCode} • {partner.type}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-neutral-500 border-b border-white/5 pb-2">Network Performance</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <MiniMetric label="Referrals" value={partner.stats?.registrations || 0} />
                                        <MiniMetric label="Qualified" value={partner.stats?.qualifiedUsers || 0} />
                                        <MiniMetric label="Completed" value={partner.stats?.completedJobs || 0} />
                                        <MiniMetric label="Rewarded" value={partner.stats?.rewardedJobs || 0} />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${partner.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}>
                                        Partner: {partner.status}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-neutral-50 rounded-[40px] p-8 border border-neutral-100 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <History size={16} className="text-neutral-400" />
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Audit History</h5>
                                </div>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {settlement.auditLog?.map((log: any, i: number) => (
                                        <div key={i} className="pl-4 border-l-2 border-neutral-200 py-1">
                                            <p className="text-[10px] font-black uppercase text-neutral-800">{log.action}</p>
                                            <p className="text-[9px] text-neutral-400 font-bold">{formatDate(log.timestamp)} • {log.note || 'No notes'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* WORKFLOW CONTROLS */}
                    {settlement.status !== 'PAID' && settlement.status !== 'REJECTED' && settlement.status !== 'CANCELLED' && (
                        <div className="pt-10 border-t border-neutral-100 grid grid-cols-1 xl:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Workflow Authorization</h4>

                                {settlement.status === 'PROCESSING' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Payment Reference (Proof of Payment) *</label>
                                            <input
                                                type="text"
                                                value={paymentReference}
                                                onChange={e => setPaymentReference(e.target.value)}
                                                placeholder="e.g. NETCASH-REF-10923"
                                                className="w-full bg-neutral-50 border-2 border-blue-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Evidence URL / Link (Optional)</label>
                                            <input
                                                type="text"
                                                value={evidenceUrl}
                                                onChange={e => setEvidenceUrl(e.target.value)}
                                                placeholder="https://..."
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Administrator Action Note</label>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all resize-none h-24"
                                        placeholder="Supporting internal notes for status change..."
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col justify-end gap-4">
                                {settlement.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleUpdate('APPROVED')}
                                        disabled={saving}
                                        className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                    >
                                        {saving ? 'Processing...' : 'Approve for Payment'}
                                    </button>
                                )}

                                {(settlement.status === 'PENDING' || settlement.status === 'APPROVED') && (
                                    <button
                                        onClick={() => handleUpdate('PROCESSING')}
                                        disabled={saving}
                                        className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                                    >
                                        {saving ? 'Processing...' : 'Mark as Processing'}
                                    </button>
                                )}

                                {settlement.status === 'PROCESSING' && (
                                    <button
                                        onClick={() => handleUpdate('PAID')}
                                        disabled={saving || !paymentReference}
                                        className="w-full py-6 bg-green-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? 'Processing...' : 'Finalize Payment (Mark Paid)'}
                                    </button>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleUpdate('REJECTED')}
                                        disabled={saving}
                                        className="flex-1 py-5 bg-red-50 text-red-600 border border-red-100 rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleUpdate('CANCELLED')}
                                        disabled={saving}
                                        className="flex-1 py-5 bg-neutral-100 text-neutral-500 rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-neutral-900 hover:text-white transition-all active:scale-95"
                                    >
                                        Cancel Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {settlement.status === 'PAID' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="p-12 bg-green-50 border-2 border-green-100 rounded-[48px] flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-green-600 text-white rounded-[32px] flex items-center justify-center shadow-xl shadow-green-200">
                                    <ShieldCheck size={40} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black uppercase tracking-tight text-green-900">Payment Protocol Finalized</h4>
                                    <p className="text-sm font-bold text-green-700 uppercase tracking-widest mt-2">Reference: {settlement.paymentReference}</p>
                                    <p className="text-[10px] text-green-600/60 font-black uppercase mt-4">Funds successfully moved to lifetime withdrawn ledger.</p>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        if (confirm("REVERSE SETTLEMENT? This will deduct the amount from Partner's PAID balance and return it to AVAILABLE. Ledger will be updated with a reversal entry.")) {
                                            handleUpdate('RETURNED');
                                        }
                                    }}
                                    disabled={saving}
                                    className="px-10 py-4 bg-red-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl"
                                >
                                    Reverse Settlement
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailCard({ label, value, color, highlight }: any) {
    return (
        <div className="bg-neutral-50 border border-neutral-100 p-8 rounded-[32px] shadow-inner">
            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{label}</p>
            <p className={`${highlight ? 'text-3xl' : 'text-xl'} font-black mt-2 ${color}`}>{value}</p>
        </div>
    );
}

function DetailRow({ label, value, highlight }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest">{label}</p>
            <p className={`${highlight ? 'text-lg' : 'text-sm'} font-black text-blue-900 uppercase`}>{value || 'NOT_FOUND'}</p>
        </div>
    );
}

function MiniMetric({ label, value }: any) {
    return (
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[8px] font-black uppercase text-neutral-500 mb-1">{label}</p>
            <p className="text-sm font-black">{value}</p>
        </div>
    );
}
