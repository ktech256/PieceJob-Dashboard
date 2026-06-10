"use client";

import { useState } from 'react';
import { Search, Filter, ShieldCheck, CreditCard, Lock } from 'lucide-react';

export default function SystemAuditLogs() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">System Audit Ledger</h1>
            <p className="text-sm text-gray-400">Immutable trace of all administrative and financial mutations.</p>
        </div>

        <div className="flex gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search logs..." className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white outline-none focus:border-brand-customer-red" />
            </div>
            <button className="flex items-center gap-2 border bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                Filters
            </button>
        </div>
      </div>

      {/* SECTION 13 & 24: Audit Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={20} /></div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Admin Actions</p>
                <p className="text-lg font-black">458</p>
            </div>
        </div>
        <div className="bg-white border rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CreditCard size={20} /></div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Financial Mut.</p>
                <p className="text-lg font-black">2,104</p>
            </div>
        </div>
        <div className="bg-white border rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Lock size={20} /></div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Security Events</p>
                <p className="text-lg font-black">12</p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-500 border-b">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Event Type</th>
              <th className="px-6 py-4">Mutation (Before/After)</th>
              <th className="px-6 py-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {[
                { time: '10:45:02', actor: 'Super Admin', type: 'PRICING_CHANGE', mutation: 'Booking Fee ZA: 50 -> 60', ip: '192.168.1.45' },
                { time: '10:42:15', actor: 'Verification Admin', type: 'PROVIDER_APPROVED', mutation: 'Provider ID: P-901 Status: PENDING -> APPROVED', ip: '102.65.12.8' },
                { time: '09:12:00', actor: 'System', type: 'ESCROW_RELEASE', mutation: 'Job ID: J-882 Amount: 350.00 released', ip: '127.0.0.1' },
                { time: '08:05:33', actor: 'Finance Admin', type: 'PAYOUT_TRIGGER', mutation: 'Batch #402 Processed for ZA', ip: '196.25.1.201' }
            ].map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{log.time}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{log.actor}</td>
                    <td className="px-6 py-4">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-black uppercase text-gray-600">{log.type}</span>
                    </td>
                    <td className="px-6 py-4 text-xs italic text-gray-500">{log.mutation}</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{log.ip}</td>
                </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t bg-gray-50 text-center">
            <button className="text-blue-600 text-xs font-bold uppercase hover:underline">Load 50 More Logs</button>
        </div>
      </div>
    </div>
  );
}
