"use client";

import { useState } from 'react';
import { Eye, ShieldAlert, Zap, UserX, Gps } from 'lucide-react';

export default function FraudMonitoring() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-tight flex items-center gap-3">
        <ShieldAlert className="text-red-600" />
        FraudSense Intelligence
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fraud Summary */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase text-gray-500 tracking-wider">High Risk Alerts</h3>
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">Action Required</span>
                </div>
                <div className="divide-y">
                    {[
                        { type: 'GPS_SPOOFING', actor: 'P-902 (Johannesburg)', details: 'Velocity: 240km/h detected between pings.', status: 'SHADOW_BANNED' },
                        { type: 'MULTI_ACCOUNT', actor: 'C-441 & C-445', details: 'Matching IMEI detected for separate registrations.', status: 'FLAGGED' },
                        { type: 'REFERRAL_FARMING', actor: 'P-881', details: '15 referrals from identical IP subnets.', status: 'INVESTIGATING' }
                    ].map((alert, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
                                    {alert.type === 'GPS_SPOOFING' ? <Gps size={18} /> : <UserX size={18} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-sm uppercase">{alert.type}</p>
                                        <span className="text-[8px] font-black bg-gray-900 text-white px-1.5 rounded">{alert.status}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-800">{alert.actor}</p>
                                    <p className="text-xs text-gray-500 mt-1">{alert.details}</p>
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-brand-customer-red transition-colors"><Eye size={18} /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#0A0A0A] rounded-2xl p-6 text-white">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-400" size={20} />
                    PRICEBOT LIVE STATUS
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-white/10 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Active Surges</p>
                        <p className="text-3xl font-black">14 Zones</p>
                        <p className="text-[10px] text-green-500 font-bold mt-2">+5.2% Daily Yield</p>
                    </div>
                    <div className="border border-white/10 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Avg. Multiplier</p>
                        <p className="text-3xl font-black">1.4x</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-2">Target: 1.2x - 1.8x</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Global Security Config */}
        <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="font-black text-sm mb-6 text-gray-500 uppercase tracking-widest">Autonomous Defense</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-bold">Auto-Ban GPS Spoofers</p>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-red-600" />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-bold">Block Emulator UUIDs</p>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-red-600" />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-bold">Velocity Shadow-Ban</p>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-red-600" />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-bold">Ref. Harvesting Lock</p>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-red-600" />
                    </div>
                </div>
                <button className="w-full mt-10 border-2 border-gray-900 text-gray-900 py-3 rounded-full text-xs font-black uppercase hover:bg-gray-900 hover:text-white transition-all">
                    Reset Defense AI
                </button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                <p className="text-[10px] font-black text-red-600 uppercase mb-2">Internal Warning</p>
                <p className="text-xs text-red-800 leading-relaxed font-medium">
                    Suspicious cancellation spikes detected in Namibia (NA-01). FraudSense recommends raising verification level for new customers in this zone.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
