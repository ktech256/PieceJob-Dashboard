"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  Search,
  Plus,
  History,
  ShieldCheck,
  Zap,
  CreditCard,
  Gift
} from 'lucide-react';

export default function WalletManagement() {
  const { countryCode } = useCountryStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mutation, setMutation] = useState({ userId: "", amount: 0, type: "balanceCredit", reason: "" });

  const loadLogs = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/finance/ledger?countryCode=${countryCode}`);
        setLogs(res.data.logs || []);
    } catch (e) {
        console.error('Failed to load ledger');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadLogs();
  }, [countryCode]);

  const handleMutate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.post('/api/admin/users/wallet/mutate', mutation);
          setShowModal(false);
          loadLogs();
          alert('Wallet mutated successfully');
      } catch (e) {
          alert('Mutation failed');
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Wallet Architecture</h1>
          <p className="text-neutral-500 font-medium text-sm">Manage credits, referral rewards, and manual bonus adjustments.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowModal(true)} className="bg-brand-customer-red text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-customer-red/20 flex items-center gap-2">
                <Plus size={16} />
                Manual Mutation
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <WalletCard label="Credit Balance" icon={<CreditCard size={20} />} color="bg-blue-600" />
          <WalletCard label="Referral Rewards" icon={<Gift size={20} />} color="bg-purple-600" />
          <WalletCard label="Bonus Liquidity" icon={<Zap size={20} />} color="bg-orange-500" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b bg-neutral-50/50 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <History size={16} /> Global Financial Log
              </h3>
              <button onClick={loadLogs} className="p-2 hover:bg-neutral-100 rounded-lg transition-all"><RefreshCcw size={14} /></button>
          </div>
          <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-4">Transaction ID</th>
                            <th className="px-8 py-4">Context</th>
                            <th className="px-8 py-4 text-right">Impact</th>
                            <th className="px-8 py-4">Type</th>
                            <th className="px-8 py-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                        {loading ? (
                             <tr><td colSpan={5} className="px-8 py-10 text-center text-neutral-400">Syncing Ledger...</td></tr>
                        ) : logs.map((tx) => (
                            <tr key={tx._id} className="hover:bg-neutral-50/50 transition-all">
                                <td className="px-8 py-5 font-mono text-[10px] text-neutral-400">{tx.transactionId}</td>
                                <td className="px-8 py-5">
                                    <p className="text-neutral-900">{tx.metadata?.reason || 'System Process'}</p>
                                    <p className="text-[10px] text-neutral-400 uppercase">{tx.fromUserId || tx.toUserId}</p>
                                </td>
                                <td className={`px-8 py-5 text-right font-black ${tx.toUserId ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.toUserId ? '+' : '-'}${tx.amount.toFixed(2)}
                                </td>
                                <td className="px-8 py-5">
                                    <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[10px] uppercase">{tx.type}</span>
                                </td>
                                <td className="px-8 py-5 text-neutral-400 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
          </div>
      </div>

      {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-10 border-b bg-neutral-50/50">
                      <h3 className="text-2xl font-black uppercase">Manual Wallet Mutation</h3>
                      <p className="text-[10px] font-black text-neutral-400 uppercase mt-1 tracking-widest">Authorized Financial Override</p>
                  </div>
                  <form onSubmit={handleMutate} className="p-10 space-y-6">
                      <div className="space-y-4">
                          <Input label="Target User ID" onChange={(v: string) => setMutation({...mutation, userId: v})} />
                          <div className="grid grid-cols-2 gap-4">
                              <Input label="Amount (+ or -)" type="number" onChange={(v: string) => setMutation({...mutation, amount: parseFloat(v)})} />
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Wallet Type</label>
                                  <select
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                    onChange={e => setMutation({...mutation, type: e.target.value})}
                                  >
                                      <option value="balanceCredit">Credit Wallet</option>
                                      <option value="balanceReferral">Referral Wallet</option>
                                      <option value="balanceBonus">Bonus Wallet</option>
                                  </select>
                              </div>
                          </div>
                          <Input label="Mutation Reason (Internal Audit)" onChange={(v: string) => setMutation({...mutation, reason: v})} />
                      </div>
                      <button type="submit" className="w-full bg-neutral-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        Commit Mutation to Ledger
                      </button>
                      <button type="button" onClick={() => setShowModal(false)} className="w-full text-neutral-400 font-black uppercase text-[10px] tracking-widest hover:text-neutral-900">Cancel Request</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

function WalletCard({ label, icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-black text-neutral-900">$0.00</p>
            </div>
        </div>
    )
}

function Input({ label, type = "text", onChange }: { label: string, type?: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">{label}</label>
            <input
                type={type}
                step="0.01"
                required
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none ring-1 ring-transparent focus:ring-neutral-900 transition-all"
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}
