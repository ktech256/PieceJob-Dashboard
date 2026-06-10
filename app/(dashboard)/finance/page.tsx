"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  transactionId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function FinanceHub() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayouts: 0,
    activeEscrow: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Fetch financial stats and transactions
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Finance Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase">Pending Payouts</p>
          <p className="text-3xl font-bold text-blue-600">${stats.pendingPayouts.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase">Active Escrow</p>
          <p className="text-3xl font-bold text-orange-500">${stats.activeEscrow.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-600">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500 italic">No transactions</td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.transactionId}>
                      <td className="px-6 py-4 text-sm uppercase">{tx.type}</td>
                      <td className="px-6 py-4 text-sm font-bold">{tx.currency} {tx.amount}</td>
                      <td className="px-6 py-4 text-sm">{tx.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SECTION 14 & 25: Revenue By Service */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Revenue By Service</h2>
            </div>
            <div className="p-4">
               <div className="space-y-4">
                  {[
                    { name: 'House Cleaning', revenue: 12500, percent: 45 },
                    { name: 'Minor Electrical', revenue: 8400, percent: 30 },
                    { name: 'Yard Cleaning', revenue: 4200, percent: 15 },
                    { name: 'TV Mounting', revenue: 2800, percent: 10 }
                  ].map((service) => (
                    <div key={service.name}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-gray-500">${service.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${service.percent}%` }}
                            ></div>
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
