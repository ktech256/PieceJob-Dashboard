"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Briefcase,
  Search,
  Filter,
  RefreshCcw,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function JobsMonitoring() {
  const { countryCode } = useCountryStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchJobs = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/analytics/live-ops?countryCode=${countryCode}`);
        // We can reuse live-ops or create a more specific endpoint
        setJobs(res.data.data.activeJobs || []);
    } catch (e) {
        console.error('Failed to load jobs');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) fetchJobs();
    const interval = setInterval(fetchJobs, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [countryCode]);

  const filteredJobs = jobs.filter(j => activeFilter === 'ALL' || j.status === activeFilter);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Live Engagement Monitor</h1>
          <p className="text-neutral-500 font-medium">Real-time oversight of all service requests and fulfillment cycles.</p>
        </div>
        <button onClick={fetchJobs} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all shadow-sm">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <StatCard title="Active Requests" value={jobs.length.toString()} icon={<Briefcase size={20} />} color="bg-blue-50 text-blue-600" />
          <StatCard title="En Route" value={jobs.filter(j => j.status === 'EN_ROUTE').length.toString()} icon={<Clock size={20} />} color="bg-orange-50 text-orange-600" />
          <StatCard title="In Progress" value={jobs.filter(j => j.status === 'STARTED').length.toString()} icon={<CheckCircle2 size={20} />} color="bg-green-50 text-green-600" />
          <StatCard title="Broadcasts" value={jobs.filter(j => j.status === 'BROADCASTED').length.toString()} icon={<RefreshCcw size={20} />} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
              <div className="flex gap-4">
                  {['ALL', 'BROADCASTED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'STARTED'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeFilter === f ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-400'}`}
                      >
                          {f.replace('_', ' ')}
                      </button>
                  ))}
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                      <tr>
                          <th className="px-8 py-5">Job ID</th>
                          <th className="px-8 py-5">Service</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5">Customer</th>
                          <th className="px-8 py-5">Provider</th>
                          <th className="px-8 py-5">Value</th>
                          <th className="px-8 py-5 text-right">Details</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                      {filteredJobs.map(job => (
                          <tr key={job._id} className="hover:bg-neutral-50/50 transition-all">
                              <td className="px-8 py-5 font-mono text-xs text-neutral-400">#{job._id.slice(-6).toUpperCase()}</td>
                              <td className="px-8 py-5 text-neutral-900">
                                  <div className="font-bold">{job.serviceName || 'Unknown Service'}</div>
                                  <div className="text-[10px] text-neutral-400 font-mono">{job.serviceCode}</div>
                              </td>
                              <td className="px-8 py-5">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(job.status)}`}>
                                      {job.status.replace('_', ' ')}
                                  </span>
                              </td>
                              <td className="px-8 py-5 text-neutral-500">{job.customerId?.firstName || 'User'}</td>
                              <td className="px-8 py-5 text-neutral-500">{job.providerId?.firstName || 'Waiting...'}</td>
                              <td className="px-8 py-5 text-neutral-900">{formatCurrency(job.bookingFee + (job.serviceFee || 0), 'USD')}</td>
                              <td className="px-8 py-5 text-right">
                                  <button className="p-2 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all">
                                      <ChevronRight size={16} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>{icon}</div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{title}</p>
            <p className="text-3xl font-black text-neutral-900 mt-1">{value}</p>
        </div>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'BROADCASTED': return 'bg-purple-50 text-purple-600';
        case 'ACCEPTED': return 'bg-blue-50 text-blue-600';
        case 'EN_ROUTE': return 'bg-orange-50 text-orange-600';
        case 'ARRIVED': return 'bg-green-50 text-green-600';
        case 'STARTED': return 'bg-emerald-50 text-emerald-600';
        default: return 'bg-neutral-50 text-neutral-400';
    }
}
