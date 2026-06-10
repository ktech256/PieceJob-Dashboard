"use client";

import { useState, useEffect } from 'react';

interface Provider {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  servicesOffered: string[];
  verificationStatus: string;
  documents: {
    type: string;
    url: string;
    status: string;
  }[];
}

export default function VerificationStation() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch pending verifications
    const fetchPending = async () => {
      // Placeholder for API call
      setLoading(false);
    };
    fetchPending();
  }, []);

  const handleApprove = async (providerId: string) => {
    // API call to approve
  };

  const handleReject = async (providerId: string) => {
    // API call to reject
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verification Station</h1>

      {loading ? (
        <p>Loading pending verifications...</p>
      ) : (
        <div className="grid gap-4">
          {providers.length === 0 ? (
            <p className="text-gray-500 italic">No pending verifications at the moment.</p>
          ) : (
            providers.map((p) => (
              <div key={p._id} className="border p-4 rounded-lg shadow-sm bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{p.userId.firstName} {p.userId.lastName}</h2>
                    <p className="text-sm text-gray-600">{p.userId.email}</p>
                    <div className="mt-2 flex gap-2">
                      {p.servicesOffered.map(s => (
                        <span key={s} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(p._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(p._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Documents</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {p.documents.map((doc, idx) => (
                      <div key={idx} className="min-w-[150px]">
                        <p className="text-xs font-bold uppercase">{doc.type}</p>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm underline">View Document</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
