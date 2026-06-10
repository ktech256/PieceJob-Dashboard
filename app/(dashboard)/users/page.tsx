"use client";

import { useState, useEffect } from 'react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isBanned: boolean;
  countryCode: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SECTION 7 & 16: Fetch User List
  }, []);

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    // API Call to ban/unban
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-600">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Country</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td className="px-6 py-4 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-4 text-sm">
                    <p>{u.email}</p>
                    <p className="text-gray-500">{u.phoneNumber}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold uppercase">{u.role}</td>
                  <td className="px-6 py-4 font-mono text-xs">{u.countryCode}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      u.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleBan(u._id, u.isBanned)}
                      className={`text-sm font-medium ${u.isBanned ? 'text-green-600' : 'text-red-600'} hover:underline`}
                    >
                      {u.isBanned ? 'Unban' : 'Ban User'}
                    </button>
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
