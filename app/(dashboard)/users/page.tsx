"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api/axios';
import { useCountryStore } from '../../../lib/store/countryStore';
import {
  UserRound,
  Building2,
  Wallet,
  History,
  ShieldAlert,
  Search,
  ChevronRight,
  Gift,
  Users,
  CreditCard,
  ArrowRight,
  RefreshCcw
} from 'lucide-react';

export default function UsersManagement() {
  const [activeTab, setActiveTab] = useState("customers");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">User Identity Hub</h1>
          <p className="text-neutral-500 font-medium">Manage localized consumer profiles, enterprise accounts, and sub-wallet balances.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 shadow-inner">
            <TabButton active={activeTab === "customers"} onClick={() => setActiveTab("customers")} label="Customers" />
            <TabButton active={activeTab === "enterprise"} onClick={() => setActiveTab("enterprise")} label="Enterprise B2B" />
            <TabButton active={activeTab === "wallets"} onClick={() => setActiveTab("wallets")} label="Wallet Monitor" />
        </div>
      </div>

      {activeTab === "customers" && <CustomerDirectory />}
      {activeTab === "enterprise" && <EnterprisePanel />}
      {activeTab === "wallets" && <WalletMonitor />}
    </div>
  );
}

function CustomerDirectory() {
    const { countryCode } = useCountryStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/users?countryCode=${countryCode}`);
            setUsers(res.data.users || []);
        } catch (e) {
            console.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadUsers();
    }, [countryCode]);

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-neutral-900 text-white rounded-2xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-neutral-800 uppercase tracking-tight">Consumer Profile Logs</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Workspace-Isolated Records (Section 169)</p>
                    </div>
                </div>
                <button onClick={loadUsers} className="p-2 bg-white border rounded-xl hover:bg-neutral-50 transition-all"><RefreshCcw size={16} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b">
                        <tr>
                            <th className="px-8 py-4">User Identity</th>
                            <th className="px-8 py-4">Country</th>
                            <th className="px-8 py-4">Verification</th>
                            <th className="px-8 py-4">Account Status</th>
                            <th className="px-8 py-4 text-right">Profile</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-semibold">
                        {users.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400 font-bold uppercase tracking-widest text-xs">No user records found.</td></tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u._id} className="hover:bg-neutral-50/50 transition-all group">
                                    <td className="px-8 py-5">
                                        <p className="text-neutral-800 group-hover:text-brand-customer-red transition-all">{u.firstName} {u.lastName}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{u._id}</p>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-neutral-500 uppercase tracking-widest font-black">{u.countryCode}</td>
                                    <td className="px-8 py-5">
                                        {u.isVerified ? <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">Verified</span> : <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">Pending</span>}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-black uppercase ${!u.isBanned ? 'text-green-600' : 'text-red-500 animate-pulse'}`}>{!u.isBanned ? 'ACTIVE' : 'BANNED'}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-neutral-300 hover:text-neutral-950 transition-all"><ChevronRight size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function EnterprisePanel() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-[32px] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5"><Building2 size={160} /></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-800 mb-2">Corporate Enterprise Panel</h3>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs mb-12">High-Volume B2B Management Tier (Section 362)</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { name: "Bidvest Facilities", id: "ENT-901", activeJobs: 45, compliance: "98%" },
                            { name: "Redefine Properties", id: "ENT-902", activeJobs: 12, compliance: "100%" },
                        ].map((ent) => (
                            <div key={ent.id} className="p-8 border border-neutral-100 bg-neutral-50/50 rounded-[24px] hover:border-blue-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-all">
                                        <Building2 size={24} />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Compliance: {ent.compliance}</span>
                                </div>
                                <h4 className="text-xl font-black text-neutral-800">{ent.name}</h4>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">{ent.id}</p>
                                <div className="flex justify-between items-center pt-6 border-t border-neutral-100">
                                    <div>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase">Active Schedule</p>
                                        <p className="text-lg font-black text-neutral-800">{ent.activeJobs} Pro Jobs</p>
                                    </div>
                                    <button className="p-3 bg-neutral-900 text-white rounded-xl hover:scale-105 transition-all"><ArrowRight size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white shadow-2xl">
                <h3 className="font-black text-sm uppercase tracking-widest text-neutral-500 mb-8">Enterprise Ops</h3>
                <div className="space-y-8">
                    <EnterpriseAction label="Batch Invoice Gen" />
                    <EnterpriseAction label="Corporate KYC Portal" />
                    <EnterpriseAction label="Master Agreement Vault" />
                    <div className="h-px bg-white/10 mt-8"></div>
                    <p className="text-[10px] text-neutral-500 font-bold leading-relaxed mt-8">Specialized tier supporting high-volume scheduling and corporate documentation tracking.</p>
                </div>
            </div>
        </div>
    )
}

function WalletMonitor() {
    return (
        <div className="space-y-8">
            <div className="bg-white border border-neutral-200 rounded-[32px] p-10 shadow-sm">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-800">Consumer Sub-Wallet Monitor</h3>
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs mt-1">Promotional & Referral Balance Visibility (Section 284)</p>
                    </div>
                    <div className="flex gap-4">
                        <WalletCard type="CreditWallet" balance={4500.00} icon={<Gift size={16} />} color="bg-brand-customer-red" />
                        <WalletCard type="ReferralWallet" balance={1240.50} icon={<Users size={16} />} color="bg-brand-provider-green" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border border-neutral-100 rounded-3xl overflow-hidden">
                        <div className="p-4 bg-neutral-50 border-b font-black text-[10px] uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                            <History size={14} /> Global Transaction Feed
                        </div>
                        <div className="divide-y divide-neutral-50">
                            {[
                                { user: "K. Mokoena", type: "REFERRAL_BONUS", amount: 10.00, credit: true },
                                { user: "P. Naidoo", type: "PROMO_TOPUP", amount: 25.00, credit: true },
                                { user: "S. Gouveia", type: "BOOKING_DEDUCT", amount: 50.00, credit: false },
                            ].map((tx, i) => (
                                <div key={i} className="p-5 flex justify-between items-center hover:bg-neutral-50/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500"><CreditCard size={14} /></div>
                                        <div>
                                            <p className="text-sm font-black text-neutral-800">{tx.user}</p>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{tx.type}</p>
                                        </div>
                                    </div>
                                    <p className={`font-black ${tx.credit ? 'text-green-600' : 'text-red-500'}`}>{tx.credit ? '+' : '-'}${tx.amount.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-neutral-50 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                        <ShieldAlert size={48} className="text-neutral-200 mb-6" />
                        <h4 className="font-black text-lg text-neutral-800 mb-2">Audit-Safe Mirroring</h4>
                        <p className="text-xs text-neutral-400 font-medium max-w-xs">Double-entry ledger validation is applied to every sub-wallet mutation to prevent phantom credit inflation.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function WalletCard({ type, balance, icon, color }: { type: string, balance: number, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-neutral-900 border border-white/5 p-6 rounded-[24px] text-white min-w-[200px] relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 ${color} blur-3xl opacity-20`}></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">
                    {icon} {type}
                </div>
                <p className="text-2xl font-black">${balance.toLocaleString()}</p>
            </div>
        </div>
    )
}

function EnterpriseAction({ label }: { label: string }) {
    return (
        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
            <p className="text-xs font-bold tracking-tight text-neutral-300 group-hover:text-white transition-all">{label}</p>
            <ChevronRight size={16} className="text-neutral-500 group-hover:text-brand-provider-green transition-all" />
        </div>
    )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase transition-all tracking-widest ${
                active ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-400 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}
