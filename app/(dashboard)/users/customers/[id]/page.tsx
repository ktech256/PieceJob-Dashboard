"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Activity,
  Wallet,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  History,
  Smartphone,
  ExternalLink,
  Ban,
  Shield
} from 'lucide-react';

export default function CustomerProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/users/customers/${id}`);
        setData(res.data);
    } catch (e) {
        console.error('Load failed');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <div className="p-20 text-center uppercase font-black text-xs tracking-widest text-neutral-300">Reconstructing Customer Identity...</div>;
  if (!data) return <div>Customer not found</div>;

  const { customer, activity } = data;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 font-black uppercase text-xs transition-all">
              <ArrowLeft size={16} />
              Back to Directory
          </button>
          <div className="flex gap-2">
              <button className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
                  <Ban size={14} /> Ban Customer
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* PERSONAL INFO */}
          <div className="xl:col-span-2 space-y-8">
              <div className="bg-white border border-neutral-200 rounded-[32px] p-10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5"><User size={180} /></div>
                  <div className="relative z-10 flex items-start gap-8">
                      <div className="w-24 h-24 bg-neutral-100 rounded-[32px] flex items-center justify-center text-neutral-300 font-black text-2xl uppercase">
                          {customer.firstName[0]}{customer.lastName.charAt(0)}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                              <h2 className="text-3xl font-black uppercase tracking-tight">{customer.firstName} {customer.lastName}</h2>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${customer.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {customer.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                          </div>
                          <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-6">{customer.email} • {customer.phoneNumber}</p>

                          <div className="grid grid-cols-3 gap-6">
                              <MetricMini label="Country" value={customer.countryCode} />
                              <MetricMini label="Joined" value={new Date(customer.createdAt).toLocaleDateString()} />
                              <MetricMini label="Referral" value={customer.referralCode} />
                          </div>
                      </div>
                  </div>
              </div>

              {/* FINANCIAL SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white shadow-xl">
                      <div className="flex justify-between items-start mb-8">
                          <div className="p-3 bg-white/10 rounded-xl text-brand-customer-red"><Wallet size={24} /></div>
                          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Wallet</p>
                      </div>
                      <p className="text-4xl font-black mb-2">${(activity.wallet?.balanceMain || 0).toFixed(2)}</p>
                      <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter text-neutral-400">
                          <p>Credit: <span className="text-white">${(activity.wallet?.balanceCredit || 0).toFixed(2)}</span></p>
                          <p>Bonus: <span className="text-white">${(activity.wallet?.balanceBonus || 0).toFixed(2)}</span></p>
                      </div>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                      <div className="flex justify-between items-start mb-8">
                          <div className="p-3 bg-neutral-50 rounded-xl text-neutral-400"><Smartphone size={24} /></div>
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Security Health</p>
                      </div>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs font-bold uppercase">
                              <span className="text-neutral-400">Last Device</span>
                              <span className="text-neutral-900">{customer.deviceId || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold uppercase">
                              <span className="text-neutral-400">Verified Email</span>
                              <span className="text-green-600">Yes</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* ACTIVITY HISTORY */}
              <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="p-8 border-b bg-neutral-50/50 flex justify-between items-center">
                      <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                          <History size={16} /> Activity History
                      </h3>
                      <div className="flex gap-2">
                          <TabSmall label="Jobs" active />
                          <TabSmall label="Financials" />
                          <TabSmall label="Security" />
                      </div>
                  </div>
                  <div className="divide-y divide-neutral-50 font-bold max-h-[400px] overflow-y-auto custom-scrollbar">
                      {activity.jobs.map((job: any) => (
                          <div key={job._id} className="p-6 flex justify-between items-center hover:bg-neutral-50/30 transition-all">
                              <div className="flex gap-4 items-center">
                                  <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400"><Activity size={16} /></div>
                                  <div>
                                      <p className="text-sm text-neutral-900 uppercase">{job.serviceCode}</p>
                                      <p className="text-[10px] text-neutral-400 font-medium">Job: {job._id.slice(-6)}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                      job.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                      job.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                  }`}>{job.status}</span>
                                  <p className="text-[10px] text-neutral-400 mt-1">{new Date(job.createdAt).toLocaleDateString()}</p>
                              </div>
                          </div>
                      ))}
                      {activity.jobs.length === 0 && <div className="p-20 text-center text-neutral-300 uppercase text-xs">No job history found.</div>}
                  </div>
              </div>
          </div>

          <div className="space-y-8">
              <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                  <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                      <Shield size={16} /> Trust Indicators
                  </h3>
                  <div className="space-y-6">
                      <MetricRow label="SOS Events" value={activity.sosEvents?.length || 0} color="text-red-600" />
                      <MetricRow label="Disputes Raised" value={activity.disputes?.length || 0} color="text-orange-600" />
                      <MetricRow label="Fraud Score" value={customer.referralFraudScore || 0} color="text-neutral-900" />
                  </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                  <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-6">Device Sessions</h3>
                  <div className="space-y-4">
                      {activity.logins?.map((log: any) => (
                          <div key={log._id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl">
                              <Smartphone size={16} className="text-neutral-400 mt-1" />
                              <div>
                                  <p className="text-[10px] font-black text-neutral-800">{log.deviceId}</p>
                                  <p className="text-[8px] font-bold text-neutral-400 uppercase">{log.ipAddress} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}

function MetricMini({ label, value }: any) {
    return (
        <div>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-lg font-black text-neutral-900">{value}</p>
        </div>
    )
}

function MetricRow({ label, value, color }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</span>
            <span className={`text-sm font-black ${color}`}>{value}</span>
        </div>
    )
}

function TabSmall({ label, active }: any) {
    return (
        <button className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            active ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-900'
        }`}>{label}</button>
    )
}
