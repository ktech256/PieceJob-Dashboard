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
  Shield,
  MapPin,
  Phone,
  Settings,
  Star,
  Zap
} from 'lucide-react';

export default function CustomerProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Jobs');

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
    <div className="space-y-8 pb-20 text-neutral-900">
      <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 font-black uppercase text-xs transition-all">
              <ArrowLeft size={16} />
              Back to Directory
          </button>
          <div className="flex gap-2 text-neutral-900">
              {customer.subscription?.plan === 'PLUS' && (
                  <div className="bg-brand-customer-red text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 text-neutral-900">
                      <Zap size={14} fill="currentColor" /> PJ PLUS MEMBER
                  </div>
              )}
              <button className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
                  <Ban size={14} /> Ban Customer
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* PERSONAL INFO */}
          <div className="xl:col-span-2 space-y-8">
              <div className="bg-white border border-neutral-200 rounded-[32px] p-10 shadow-sm relative overflow-hidden text-neutral-900">
                  <div className="absolute top-0 right-0 p-10 opacity-5"><User size={180} /></div>
                  <div className="relative z-10 flex items-start gap-8">
                      <div className="w-24 h-24 bg-neutral-100 rounded-[32px] flex items-center justify-center text-neutral-300 font-black text-2xl uppercase overflow-hidden">
                          {customer.profilePhoto ? (
                              <img src={customer.profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                              <>{customer.firstName[0]}{customer.lastName.charAt(0)}</>
                          )}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                              <h2 className="text-3xl font-black uppercase tracking-tight">{customer.firstName} {customer.lastName}</h2>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${customer.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {customer.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                          </div>
                          <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-6">{customer.email} • {customer.phoneNumber}</p>

                          <div className="grid grid-cols-4 gap-6">
                              <MetricMini label="Country" value={customer.countryCode} />
                              <MetricMini label="Joined" value={new Date(customer.createdAt).toLocaleDateString()} />
                              <MetricMini label="Referral" value={customer.referralCode} />
                              <MetricMini label="Language" value={customer.language?.toUpperCase() || 'EN'} />
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
                          <p>Referral: <span className="text-white">${(activity.wallet?.balanceReferral || 0).toFixed(2)}</span></p>
                      </div>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                      <div className="flex justify-between items-start mb-8">
                          <div className="p-3 bg-neutral-50 rounded-xl text-neutral-400"><CreditCard size={24} /></div>
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Payment Methods</p>
                      </div>
                      <div className="space-y-3">
                          {customer.paymentMethods?.map((card: any) => (
                              <div key={card._id} className="flex justify-between items-center text-[10px] font-black uppercase">
                                  <span className="text-neutral-400">{card.brand} •••• {card.last4}</span>
                                  <span className="text-neutral-900">{card.expMonth}/{card.expYear}</span>
                              </div>
                          ))}
                          {(!customer.paymentMethods || customer.paymentMethods.length === 0) && (
                              <p className="text-[10px] text-neutral-300 font-bold uppercase">No cards on file</p>
                          )}
                      </div>
                  </div>
              </div>

              {/* DYNAMIC CONTENT TABS */}
              <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="p-8 border-b bg-neutral-50/50 flex justify-between items-center text-neutral-900">
                      <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                          <History size={16} /> User Context
                      </h3>
                      <div className="flex gap-2 text-neutral-900">
                          {['Jobs', 'Addresses', 'Emergency', 'Privacy'].map(tab => (
                              <TabSmall
                                key={tab}
                                label={tab}
                                active={activeTab === tab}
                                onClick={() => setActiveTab(tab)}
                              />
                          ))}
                      </div>
                  </div>

                  <div className="divide-y divide-neutral-50 font-bold max-h-[500px] overflow-y-auto custom-scrollbar">
                      {activeTab === 'Jobs' && activity.jobs.map((job: any) => (
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

                      {activeTab === 'Addresses' && (
                          <div className="p-8 space-y-6">
                              <div>
                                  <h4 className="text-[10px] font-black uppercase text-neutral-400 mb-4 tracking-tighter">Registered Addresses</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {customer.addresses?.map((addr: any) => (
                                          <div key={addr._id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                              <p className="text-[10px] font-black text-brand-customer-red mb-1 uppercase">{addr.label}</p>
                                              <p className="text-xs text-neutral-900 leading-tight mb-2">{addr.address}</p>
                                              <p className="text-[8px] text-neutral-400 font-bold uppercase">{addr.coordinates.join(', ')}</p>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <h4 className="text-[10px] font-black uppercase text-neutral-400 mb-4 tracking-tighter">Saved Locations (Favorites)</h4>
                                  <div className="space-y-3">
                                      {customer.savedLocations?.map((loc: any) => (
                                          <div key={loc._id} className="flex items-center gap-3 p-3 border border-neutral-100 rounded-xl">
                                              <Star size={14} className="text-yellow-500" />
                                              <div className="flex-1">
                                                  <p className="text-xs text-neutral-900 uppercase font-black">{loc.name}</p>
                                                  <p className="text-[10px] text-neutral-400 font-bold truncate">{loc.address}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeTab === 'Emergency' && (
                          <div className="p-8">
                              <h4 className="text-[10px] font-black uppercase text-neutral-400 mb-6 tracking-tighter">Safety Network</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {customer.emergencyContacts?.map((contact: any) => (
                                      <div key={contact._id} className="flex items-center gap-4 p-5 bg-neutral-50 rounded-[24px]">
                                          <div className="p-3 bg-white rounded-xl shadow-sm text-neutral-400"><Phone size={18} /></div>
                                          <div>
                                              <p className="text-sm font-black text-neutral-900 uppercase">{contact.name}</p>
                                              <p className="text-[10px] font-bold text-neutral-400 uppercase">{contact.relationship} • {contact.phone}</p>
                                          </div>
                                      </div>
                                  ))}
                                  {(!customer.emergencyContacts || customer.emergencyContacts.length === 0) && (
                                      <div className="col-span-2 py-10 text-center text-neutral-300 uppercase text-xs">No emergency contacts set.</div>
                                  )}
                              </div>
                          </div>
                      )}

                      {activeTab === 'Privacy' && (
                          <div className="p-8 space-y-8">
                              <div className="grid grid-cols-2 gap-8">
                                  <PrivacyItem label="Profile Visibility" value={customer.privacySettings?.profileVisibility || 'PUBLIC'} />
                                  <PrivacyItem label="Share Live Location" value={customer.privacySettings?.shareLocation ? 'ENABLED' : 'DISABLED'} />
                                  <PrivacyItem label="Anonymized Data" value={customer.privacySettings?.dataSharing ? 'ENABLED' : 'DISABLED'} />
                                  <PrivacyItem label="Marketing" value={customer.privacySettings?.marketingPreferences ? 'ENABLED' : 'DISABLED'} />
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          <div className="space-y-8 text-neutral-900">
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

              <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm text-neutral-900">
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

function TabSmall({ label, active, onClick }: any) {
    return (
        <button
          onClick={onClick}
          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            active ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-900'
        }`}>{label}</button>
    )
}

function PrivacyItem({ label, value }: any) {
    return (
        <div className="p-4 border border-neutral-100 rounded-2xl text-neutral-900">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-xs font-black uppercase ${value === 'DISABLED' || value === 'PRIVATE' ? 'text-red-500' : 'text-neutral-900'}`}>{value}</p>
        </div>
    )
}
