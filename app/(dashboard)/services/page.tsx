"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  ClipboardList,
  Users,
  ShieldCheck,
  ArrowRight,
  MoreVertical,
  Plus,
  RefreshCcw
} from 'lucide-react';

export default function ServiceCatalog() {
  const { countryCode } = useCountryStore();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/v1/admin/services?countryCode=${countryCode}`);
        setServices(res.data.services || []);
    } catch (e) {
        console.error('Failed to load services');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadServices();
  }, [countryCode]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Master Service Catalog</h1>
          <p className="text-neutral-500 font-medium">Configure operational rules, gender restrictions, and vetting levels for platform categories.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={loadServices} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all"><RefreshCcw size={18} /></button>
            <button className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                <Plus size={16} />
                Add New Service
            </button>
        </div>
      </div>

      {/* SERVICE LIST GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {loading ? (
            <div className="col-span-full py-20 text-center text-xs font-bold text-neutral-300 uppercase tracking-[0.2em]">Synchronizing catalog...</div>
        ) : services.length === 0 ? (
            <div className="col-span-full py-20 text-center text-neutral-400">No services configured for this country.</div>
        ) : (
            services.map((service) => (
                <ServiceCard
                    key={service._id}
                    code={service.serviceCode}
                    name={service.serviceName || service.serviceCode}
                    gender={service.genderRule || "Both"}
                    vetting={service.vettingLevel || "Standard"}
                    desc={service.description || "No description provided."}
                />
            ))
        )}
      </div>

      {/* BULK ACTIONS / FOOTER */}
      <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white flex justify-between items-center shadow-xl">
        <div className="flex gap-12">
            <div>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Total Catalog</p>
                <p className="text-3xl font-black">{services.length} Services</p>
            </div>
            <div>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Active Country</p>
                <p className="text-3xl font-black text-brand-provider-green">{countryCode}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button className="border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Export Rules</button>
            <button className="bg-brand-customer-red text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-customer-red/20">Audit Vetting Matrix</button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ code, name, gender, vetting, desc }: { code: string, name: string, gender: string, vetting: string, desc: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm group hover:border-brand-customer-red/20 transition-all flex flex-col justify-between h-[340px]">
            <div>
                <div className="flex justify-between items-start mb-6">
                    <span className="bg-neutral-50 px-3 py-1.5 rounded-xl font-mono text-[10px] font-black text-neutral-400 group-hover:text-brand-customer-red transition-all uppercase tracking-tighter">Code: {code}</span>
                    <button className="p-2 text-neutral-300 hover:text-neutral-900 transition-all"><MoreVertical size={16} /></button>
                </div>
                <h3 className="text-xl font-black text-neutral-800 mb-2 leading-tight">{name}</h3>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed line-clamp-3">{desc}</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Users size={10} /> Gender Rule
                        </p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            gender.includes('Women') ? 'bg-pink-50 text-pink-600' :
                            gender.includes('Men') ? 'bg-blue-50 text-blue-600' : 'bg-neutral-50 text-neutral-600'
                        }`}>
                            {gender}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldCheck size={10} /> Vetting Level
                        </p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            vetting.includes('High') ? 'bg-red-50 text-red-600 animate-pulse' :
                            vetting === 'Trade' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                        }`}>
                            {vetting}
                        </span>
                    </div>
                </div>

                <button className="w-full flex items-center justify-between group/btn text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-customer-red transition-all">
                    Regional Availability
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-all" />
                </button>
            </div>
        </div>
    )
}
