"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  ShieldCheck,
  MoreVertical,
  Plus,
  RefreshCcw,
  Search,
  ExternalLink,
  Briefcase
} from 'lucide-react';

export default function CorporateManagement() {
  const { countryCode } = useCountryStore();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCompanies = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/users/corporate?countryCode=${countryCode}`);
        setCompanies(res.data.companies || []);
    } catch (e) {
        console.error('Failed to load companies');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadCompanies();
  }, [countryCode]);

  const filtered = companies.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.registrationNumber.includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Corporate B2B Engine</h1>
          <p className="text-neutral-500 font-medium text-sm">Manage enterprise accounts, recurring schedules, and employee fleet access.</p>
        </div>
        <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                    type="text"
                    placeholder="Search companies..."
                    className="bg-white border border-neutral-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-neutral-900 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button onClick={loadCompanies} className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl">
                <Plus size={16} />
                New Corporate Account
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Active Companies" value={companies.filter(c => c.status === 'APPROVED').length} icon={<Building2 className="text-blue-600" />} />
          <StatCard label="Total Employees" value={companies.reduce((acc, curr) => acc + (curr.metrics?.employeeCount || 0), 0)} icon={<Users className="text-green-600" />} />
          <StatCard label="Monthly B2B Spend" value={`$${(companies.reduce((acc, curr) => acc + (curr.metrics?.lifetimeSpend || 0), 0) / 12).toFixed(2)}`} icon={<DollarSign className="text-brand-customer-red" />} />
          <StatCard label="Pending Approval" value={companies.filter(c => c.status === 'PENDING').length} icon={<ShieldCheck className="text-orange-600" />} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                      <tr>
                          <th className="px-8 py-5">Company Entity</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Fleet (Employees)</th>
                          <th className="px-8 py-5 text-right">Jobs Managed</th>
                          <th className="px-8 py-5 text-right">Lifetime Spend</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                      {loading ? (
                          <tr><td colSpan={6} className="py-20 text-center text-neutral-400 uppercase tracking-widest text-xs">Synchronizing B2B Ledger...</td></tr>
                      ) : filtered.length === 0 ? (
                          <tr><td colSpan={6} className="py-20 text-center text-neutral-400">No corporate accounts found.</td></tr>
                      ) : (
                          filtered.map(c => (
                              <tr key={c._id} className="hover:bg-neutral-50/50 transition-all group">
                                  <td className="px-8 py-5 flex items-center gap-4">
                                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400">
                                          <Building2 size={20} />
                                      </div>
                                      <div>
                                          <p className="text-neutral-900 uppercase">{c.name}</p>
                                          <p className="text-[10px] text-neutral-400 font-medium">Reg: {c.registrationNumber}</p>
                                      </div>
                                  </td>
                                  <td className="px-8 py-5">
                                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                                          c.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                                          c.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                      }`}>{c.status}</span>
                                  </td>
                                  <td className="px-8 py-5 text-right text-neutral-500">{c.metrics?.employeeCount}</td>
                                  <td className="px-8 py-5 text-right text-neutral-500">{c.metrics?.totalJobs}</td>
                                  <td className="px-8 py-5 text-right text-neutral-900 font-black">${c.metrics?.lifetimeSpend.toFixed(2)}</td>
                                  <td className="px-8 py-5 text-right">
                                      <button className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-900 hover:text-white transition-all shadow-sm">
                                          <ExternalLink size={14} />
                                      </button>
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

function StatCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neutral-50 rounded-xl">{icon}</div>
                <div className="text-[9px] font-black text-neutral-400 border border-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-widest">B2B</div>
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-neutral-900">{value}</p>
        </div>
    )
}
