"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  MessageSquare,
  Phone,
  Star,
  Search,
  RefreshCcw,
  User,
  Clock,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';
import { io } from 'socket.io-client';

export default function CommunicationsHub() {
  const { countryCode } = useCountryStore();
  const [activeTab, setActiveTab] = useState("CHATS");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [monitoringJobId, setMonitoringJobId] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
        let endpoint = "";
        if (activeTab === "CHATS") endpoint = "/api/admin/communication/chats";
        else if (activeTab === "CALLS") endpoint = "/api/admin/communication/calls";
        else if (activeTab === "RATINGS") endpoint = "/api/admin/communication/reviews";

        const res = await api.get(`${endpoint}?countryCode=${countryCode}`);
        setData(res.data.chats || res.data.calls || res.data.reviews || []);
    } catch (e) {
        console.error('Failed to load communication data');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadData();
  }, [countryCode, activeTab]);

  useEffect(() => {
    if (!monitoringJobId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://piecejob-backend.onrender.com');

    socket.on('connect', () => {
        socket.emit('monitor_job_chat', monitoringJobId);
    });

    socket.on('new_message', (msg) => {
        setLiveMessages(prev => [...prev, msg]);
    });

    return () => {
        socket.disconnect();
    };
  }, [monitoringJobId]);

  const openMonitoring = (jobId: string) => {
      setMonitoringJobId(jobId);
      setLiveMessages([]);
      // Fetch history first
      api.get(`/api/v1/chat/${jobId}`).then(res => {
          setLiveMessages(res.data.messages);
      }).catch(err => console.error("History fetch failed", err));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Communication Hub</h1>
          <p className="text-neutral-500 font-medium">Monitor live chats, call records, and rating comments across the platform.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            {[
                { id: 'CHATS', icon: <MessageSquare size={14} />, label: 'Job Chats' },
                { id: 'CALLS', icon: <Phone size={14} />, label: 'Calls' },
                { id: 'RATINGS', icon: <Star size={14} />, label: 'Ratings' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        activeTab === tab.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
            <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                    className="w-full pl-12 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button onClick={loadData} className="p-2 bg-white border rounded-lg text-neutral-400 hover:text-neutral-900 transition-all"><RefreshCcw size={14} /></button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-neutral-400 hover:text-neutral-900 transition-all text-[10px] font-black uppercase"><Filter size={14} /> Filter</button>
            </div>
        </div>

        <div className="overflow-x-auto">
            {loading ? (
                <div className="p-20 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Syncing Communication Vault...</div>
            ) : data.length === 0 ? (
                <div className="p-20 text-center text-neutral-400 font-bold uppercase text-xs">No records found for this period.</div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        <tr>
                            <th className="px-6 py-4">Job Info</th>
                            {activeTab === "CHATS" && <th className="px-6 py-4">Participants</th>}
                            {activeTab === "CHATS" && <th className="px-6 py-4">Last Message</th>}
                            {activeTab === "CALLS" && <th className="px-6 py-4">Caller</th>}
                            {activeTab === "CALLS" && <th className="px-6 py-4">Receiver</th>}
                            {activeTab === "CALLS" && <th className="px-6 py-4">Duration</th>}
                            {activeTab === "RATINGS" && <th className="px-6 py-4">Reviewer</th>}
                            {activeTab === "RATINGS" && <th className="px-6 py-4">Rating</th>}
                            {activeTab === "RATINGS" && <th className="px-6 py-4">Comment</th>}
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50 transition-all">
                                <td className="px-6 py-4">
                                    <p className="text-xs font-black text-neutral-900">#{item.job?._id?.slice(-6) || item.jobId?._id?.slice(-6)}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">{item.job?.serviceCode || item.jobId?.serviceCode}</p>
                                </td>

                                {activeTab === "CHATS" && (
                                    <>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black uppercase">C: {item.customer?.firstName}</p>
                                                <p className="text-[10px] font-black uppercase">P: {item.provider?.firstName || 'None'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-xs font-medium text-neutral-600 truncate">{item.lastMessage?.text}</p>
                                        </td>
                                    </>
                                )}

                                {activeTab === "CALLS" && (
                                    <>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold">{item.callerId?.firstName} {item.callerId?.lastName}</p>
                                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 rounded uppercase">{item.callerId?.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold">{item.receiverId?.firstName} {item.receiverId?.lastName}</p>
                                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 rounded uppercase">{item.receiverId?.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-neutral-400" />
                                                <span className="text-xs font-black">{item.duration || 0}s</span>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${item.status === 'ANSWERED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{item.status}</span>
                                            </div>
                                        </td>
                                    </>
                                )}

                                {activeTab === "RATINGS" && (
                                    <>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold">{item.reviewerId?.firstName} {item.reviewerId?.lastName}</p>
                                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 rounded uppercase">{item.reviewerRole}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-xs font-black">{item.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-xs font-medium text-neutral-600 italic">"{item.comment}"</p>
                                        </td>
                                    </>
                                )}

                                <td className="px-6 py-4">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => activeTab === 'CHATS' ? openMonitoring(item._id) : null}
                                        className="p-2 hover:bg-neutral-900 hover:text-white rounded-lg transition-all text-neutral-400"
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {monitoringJobId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-2xl h-[700px] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-8 border-b flex justify-between items-center bg-neutral-900 text-white">
                      <div>
                          <h3 className="font-black uppercase tracking-tight text-xl flex items-center gap-3">
                              <MessageSquare size={20} className="text-brand-provider-green" />
                              Live Audit: Job #{monitoringJobId.slice(-6)}
                          </h3>
                          <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time surveillance mode active</p>
                      </div>
                      <button onClick={() => setMonitoringJobId(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={20} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-neutral-50">
                      {liveMessages.map((m, idx) => (
                          <div key={idx} className={`flex flex-col ${m.senderId?.role === 'CUSTOMER' ? 'items-start' : 'items-end'}`}>
                              <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${m.senderId?.role === 'CUSTOMER' ? 'bg-white text-neutral-700 shadow-sm border border-neutral-200' : 'bg-neutral-900 text-white shadow-xl'}`}>
                                  {m.text}
                              </div>
                              <p className="text-[10px] font-black text-neutral-400 uppercase mt-2 px-2">
                                  {m.senderId?.firstName} • {new Date(m.createdAt).toLocaleTimeString()}
                              </p>
                          </div>
                      ))}
                  </div>

                  <div className="p-6 bg-white border-t text-center">
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          Admins have read-only access to live conversations
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
