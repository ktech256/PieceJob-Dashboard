"use client";

import { useState, useEffect } from 'react';

interface Provider {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  tier: string;
  verificationStatus: string;
  isOnline: boolean;
  ratingAvg: number;
}

export default function ProviderManagement() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SECTION 6 & 16: Fetch Provider List
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Provider Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-600">
            <tr>
              <th className="px-6 py-3">Provider</th>
              <th className="px-6 py-3">Tier</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Verify</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {providers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">No providers found.</td>
              </tr>
            ) : (
              providers.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-4">
                    <p className="font-medium">{p.userId.firstName} {p.userId.lastName}</p>
                    <p className="text-xs text-gray-500">{p.userId.phoneNumber}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-black uppercase text-blue-600">{p.tier}</td>
                  <td className="px-6 py-4">
                     <span className={`w-2 h-2 rounded-full inline-block mr-2 ${p.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                     <span className="text-sm font-medium">{p.isOnline ? 'Online' : 'Offline'}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        p.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                     }`}>
                        {p.verificationStatus}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-500">⭐ {p.ratingAvg.toFixed(1)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                    View Profile
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
