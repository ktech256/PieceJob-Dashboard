"use client";

import { useState } from 'react';
import { DollarSign, Clock, Zap, Map } from 'lucide-react';

export default function PricingManagement() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-tight">Pricing Resolver Config</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* SECTION 11 & 17: Base Pricing Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-customer-red/10 rounded-lg text-brand-customer-red">
                    <DollarSign size={20} />
                </div>
                <h2 className="font-bold text-lg">Country Base Rules</h2>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Local Currency</label>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none focus:border-brand-customer-red">
                            <option>ZAR (South African Rand)</option>
                            <option>NAD (Namibian Dollar)</option>
                            <option>USD (US Dollar)</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Platform Tax %</label>
                        <input type="number" defaultValue={15} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none focus:border-brand-customer-red" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Base Booking Fee</label>
                        <input type="number" defaultValue={50} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none focus:border-brand-customer-red" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Min Service Fee</label>
                        <input type="number" defaultValue={150} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none focus:border-brand-customer-red" />
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 15 & 17: PriceBot Surge Rules */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                    <Zap size={20} />
                </div>
                <h2 className="font-bold text-lg">PriceBot Surge Logic</h2>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-dashed">
                    <div>
                        <p className="text-sm font-bold">Dynamic Surcharges</p>
                        <p className="text-[10px] text-gray-500">Enable automatic multipliers based on real-time demand spikes.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-brand-customer-red" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Max Multiplier</label>
                        <input type="number" step="0.1" defaultValue={2.5} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-customer-red" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Demand Step</label>
                        <input type="number" step="0.1" defaultValue={0.2} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-customer-red" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Settlement Split</label>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-customer-red">
                            <option>50/50 Platform/Pro</option>
                            <option>70/30 Platform/Pro</option>
                            <option>100% Provider</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 17: Time Surcharges */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                    <Clock size={20} />
                </div>
                <h2 className="font-bold text-lg">Time-based Surcharges</h2>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center gap-8">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Public Holiday Surcharge</label>
                        <div className="flex items-center gap-2">
                            <input type="number" defaultValue={100} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none" />
                            <span className="text-xs font-bold">ZAR</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Emergency (24/7) Surcharge</label>
                        <div className="flex items-center gap-2">
                            <input type="number" defaultValue={250} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none" />
                            <span className="text-xs font-bold">ZAR</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 11 & 17: Zone Rules */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg text-green-700">
                    <Map size={20} />
                </div>
                <h2 className="font-bold text-lg">Zone Isolation Overrides</h2>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-4 items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 shrink-0"></div>
                <p className="text-xs text-yellow-800 leading-relaxed">
                    Zone-specific pricing overrides any country base rule. For example, "Sandton Central" can have a higher booking fee than the South Africa national default.
                </p>
            </div>

            <div className="mt-6 flex justify-end">
                <button className="bg-brand-customer-red text-white px-6 py-2 rounded-full text-sm font-black uppercase hover:scale-105 transition-transform">Save Global Rules</button>
            </div>
        </div>
      </div>
    </div>
  );
}
