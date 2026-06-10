"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  DollarSign,
  Map,
  Clock,
  Zap,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Plus,
  RefreshCcw
} from 'lucide-react';

export default function PricingManagement() {
  const [activeTab, setActiveTab] = useState("resolver");
  const { countryCode } = useCountryStore();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/v1/admin/settings?countryCode=${countryCode}`);
        setSettings(res.data.settings);
    } catch (e) {
        console.error('Failed to load settings');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadSettings();
  }, [countryCode]);

  return (
    <div className="space-y-8 text-neutral-900">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Pricing & Commission Engine</h1>
          <p className="text-neutral-500 font-medium">Configure multipliers and regional surcharges for {countryCode}.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 shadow-inner">
            <TabButton active={activeTab === "resolver"} onClick={() => setActiveTab("resolver")} label="Pricing Resolver" />
            <TabButton active={activeTab === "commission"} onClick={() => setActiveTab("commission")} label="Commission Control" />
            <TabButton active={activeTab === "pricebot"} onClick={() => setActiveTab("pricebot")} label="PriceBot AI" />
        </div>
      </div>

      {loading ? (
          <div className="py-20 text-center text-xs font-bold text-neutral-300 uppercase tracking-widest">Fetching pricing matrix...</div>
      ) : (
          <>
            {activeTab === "resolver" && <PricingResolver settings={settings} />}
            {activeTab === "commission" && <CommissionCenter settings={settings} />}
            {activeTab === "pricebot" && <PriceBotPanel />}
          </>
      )}
    </div>
  );
}

function PricingResolver({ settings }: { settings: any }) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm group hover:border-brand-customer-red/20 transition-all">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-brand-customer-red/5 rounded-2xl text-brand-customer-red">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight">Country Base Rules</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Global Entry Point Defaults</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Base Booking Fee</label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-100">
                            <span className="text-xs font-black text-neutral-400">{settings?.currency || 'USD'}</span>
                            <input type="number" defaultValue={settings?.baseBookingFee || 5.00} className="bg-transparent font-black text-lg outline-none w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Clock size={120} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl text-brand-customer-red">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase tracking-tight">Time Surcharge Scheduler</h3>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Automatic Priority Multipliers</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <TimeSchedulerItem label="Weekend Multiplier" value={`${settings?.weekendMultiplier || 1.15}x`} active={settings?.weekendFeeEnabled} />
                        <TimeSchedulerItem label="Night Surcharge" value={`${settings?.nightFeePercentage || 10}%`} active={settings?.nightFeeEnabled} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function CommissionCenter({ settings }: { settings: any }) {
    return (
        <div className="space-y-8">
            <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-8 border-b flex justify-between items-center bg-neutral-50/30">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight text-neutral-800">Platform Commission Rate</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Base Rate Logic (Section 217)</p>
                    </div>
                </div>
                <div className="p-8">
                    <div className="flex items-center gap-6">
                        <div className="p-8 bg-neutral-900 rounded-3xl text-white">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Active Global Rate</p>
                            <p className="text-5xl font-black text-brand-provider-green">{settings?.platformCommissionPercentage || 15}%</p>
                        </div>
                        <div className="flex-1 space-y-4">
                            <p className="text-sm font-bold text-neutral-500 leading-relaxed">This rate is applied to the total job value. Adjustments propagate instantly to new job requests.</p>
                            <button className="bg-neutral-800 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">Update Global Rate</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PriceBotPanel() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#0A0A0A] rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_#410200_0%,_transparent_60%)]"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-4 bg-brand-customer-red rounded-[24px] text-white animate-pulse">
                            <Zap size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter">PriceBot AI Suggester</h3>
                            <p className="text-neutral-500 font-black uppercase tracking-[0.2em] text-xs">Autonomous Surge Intelligence (Section 321)</p>
                        </div>
                    </div>
                    <div className="p-10 border-2 border-dashed border-white/10 rounded-[40px] text-center">
                        <p className="text-neutral-500 font-black uppercase text-xs tracking-widest">Telemetry Engine Offline</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TimeSchedulerItem({ label, value, active }: { label: string, value: string, active: boolean }) {
    return (
        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-brand-customer-red shadow-[0_0_10px_#410200]' : 'bg-neutral-600'}`}></div>
                <p className="text-sm font-bold tracking-tight">{label}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs font-black text-brand-customer-red bg-brand-customer-red/10 px-3 py-1 rounded-full border border-brand-customer-red/20">{value}</span>
                <div className={`w-8 h-4 rounded-full flex items-center px-1 relative ${active ? 'bg-brand-customer-red' : 'bg-neutral-800'}`}>
                    <div className={`w-2.5 h-2.5 bg-white rounded-full transition-all ${active ? 'translate-x-3.5' : ''}`}></div>
                </div>
            </div>
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
