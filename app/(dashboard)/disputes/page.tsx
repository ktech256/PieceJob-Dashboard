"use client";

import { useState, useEffect } from 'react';

interface Dispute {
  _id: string;
  jobId: string;
  raisedBy: {
    firstName: string;
    lastName: string;
    role: string;
  };
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function DisputeCenter() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SECTION 11 & 16: Fetch Disputes with Country Isolation
    const fetchDisputes = async () => {
        // In production: const res = await api.get('/disputes', { headers: { 'x-country-code': user.countryCode } });
        setLoading(false);
    };
    fetchDisputes();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dispute Center</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-600">
            <tr>
              <th className="px-6 py-3">Raised By</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  No active disputes found.
                </td>
              </tr>
            ) : (
              disputes.map((d) => (
                <tr key={d._id}>
                  <td className="px-6 py-4">
                    <p className="font-medium">{d.raisedBy.firstName} {d.raisedBy.lastName}</p>
                    <p className="text-xs text-gray-500 uppercase">{d.raisedBy.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{d.reason}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{d.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      d.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-sm font-medium">Investigate</button>
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
