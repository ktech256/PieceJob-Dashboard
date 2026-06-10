"use client";

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Users, Briefcase, AlertCircle } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeProviders: 450,
    ongoingJobs: 120,
    dailyRevenue: 5400
  });

  const chartData = [
    { name: 'Mon', jobs: 45, revenue: 2400 },
    { name: 'Tue', jobs: 52, revenue: 3100 },
    { name: 'Wed', jobs: 48, revenue: 2800 },
    { name: 'Thu', jobs: 61, revenue: 3800 },
    { name: 'Fri', jobs: 55, revenue: 3200 },
    { name: 'Sat', jobs: 70, revenue: 4500 },
    { name: 'Sun', jobs: 65, revenue: 4100 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Operational Analytics</h1>
        <div className="bg-white border rounded-lg px-4 py-2 text-sm font-medium">
          Global Overview (All Countries)
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="text-blue-600" />}
          trend="+12%"
        />
        <StatCard
          title="Active Providers"
          value={stats.activeProviders.toLocaleString()}
          icon={<TrendingUp className="text-green-600" />}
          trend="+5%"
        />
        <StatCard
          title="Ongoing Jobs"
          value={stats.ongoingJobs.toLocaleString()}
          icon={<Briefcase className="text-orange-600" />}
          trend="+8%"
        />
        <StatCard
          title="Daily Revenue"
          value={`$${stats.dailyRevenue.toLocaleString()}`}
          icon={<AlertCircle className="text-purple-600" />}
          trend="+15%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Weekly Job Volume</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jobs" fill="#410200" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Revenue Growth ($)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#006400"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#006400" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{trend}</span>
      </div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
