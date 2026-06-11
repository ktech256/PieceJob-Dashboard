"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Wallet,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerManagement() {
  const { countryCode } = useCountryStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/users/customers?countryCode=${countryCode}`);
        setCustomers(res.data.customers || []);
    } catch (e) {
        console.error('Failed to load customers');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadCustomers();
  }, [countryCode]);

  const filtered = customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Customer Directory</h1>
          <p className="text-neutral-500 font-medium text-sm">Monitor lifetime spend, engagement metrics, and wallet balances.</p>
        </div>
        <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                    type="text"
                    placeholder="Search customers..."
                    className="bg-white border border-neutral-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-neutral-900 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button onClick={loadCustomers} className="bg-neutral-100 p-3 rounded-2xl hover:bg-neutral-200 transition-all">
                <RefreshCcw size={18} />
            </button>
            <button className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl">
                <Download size={16} />
                Export CSV
            </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                      <tr>
                          <th className="px-8 py-5">Customer</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Jobs (Comp/Total)</th>
                          <th className="px-8 py-5 text-right">Wallet</th>
                          <th className="px-8 py-5 text-right">Lifetime Spend</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                      {loading ? (
                          <tr><td colSpan={6} className="py-20 text-center text-neutral-300 uppercase tracking-widest text-xs">Scanning Customer Records...</td></tr>
                      ) : filtered.length === 0 ? (
                          <tr><td colSpan={6} className="py-20 text-center text-neutral-400">No customers found.</td></tr>
                      ) : (
                          filtered.map(c => (
                              <tr key={c._id} className="hover:bg-neutral-50/50 transition-all group">
                                  <td className="px-8 py-5 flex items-center gap-4">
                                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 font-black uppercase">
                                          {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="text-neutral-900">{c.firstName} {c.lastName}</p>
                                          <p className="text-[10px] text-neutral-400 font-medium">{c.email}</p>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      {c.isBanned ? (
                                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] uppercase">Banned</span>
                                      ) : c.isVerified ? (
                                          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] uppercase">Verified</span>
                                      ) : (
                                          <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded text-[10px] uppercase">Unverified</span>
                                      )}
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                      <span className="text-brand-provider-green">{c.metrics?.completedJobs}</span>
                                      <span className="text-neutral-300 mx-1">/</span>
                                      <span className="text-neutral-500">{c.metrics?.totalJobs}</span>
                                  </td>
                                  <td className="px-8 py-5 text-right text-brand-customer-red">
                                      ${c.metrics?.walletBalance.toFixed(2)}
                                  </td>
                                  <td className="px-8 py-5 text-right text-neutral-900 font-black">
                                      ${c.metrics?.lifetimeSpend.toFixed(2)}
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                      <Link href={`/users/customers/${c._id}`}>
                                          <button className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-900 hover:text-white transition-all shadow-sm">
                                              <ExternalLink size={14} />
                                          </button>
                                      </Link>
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
