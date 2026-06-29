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
  X,
  Gavel,
  Calendar,
  MapPin,
  Navigation,
  Info,
  ChevronRight
} from 'lucide-react';
import { io } from 'socket.io-client';

const formatDate = (date: string | Date | undefined, formatStr: string = 'dd MMM yyyy') => {
    if (!date) return '---';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '---';
    if (formatStr === 'HH:mm') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (formatStr === 'HH:mm | dd MMM') return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | ${d.toLocaleDateString([], { day: '2-digit', month: 'short' })}`;
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function CommunicationsHub() {
  const { countryCode } = useCountryStore();
  const [activeTab, setActiveTab] = useState("CHATS");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [monitoringJobId, setMonitoringJobId] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [rating, setRating] = useState("");
  const [reviewerRole, setReviewerRole] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [disputeStatus, setDisputeStatus] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
        let endpoint = "";
        let params = new URLSearchParams({ countryCode: countryCode || 'GLOBAL' });

        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (jobStatus) params.append('jobStatus', jobStatus);
        if (serviceCode) params.append('serviceCode', serviceCode);

        if (activeTab === "CHATS") {
            endpoint = "/api/admin/communication/chats";
            if (searchTerm) params.append('messageContent', searchTerm);
        } else if (activeTab === "CALLS") {
            endpoint = "/api/admin/communication/calls";
            if (callStatus) params.append('callStatus', callStatus);
        } else if (activeTab === "RATINGS") {
            endpoint = "/api/admin/communication/reviews";
            if (rating) params.append('rating', rating);
            if (reviewerRole) params.append('reviewerRole', reviewerRole);
        } else if (activeTab === "DISPUTES") {
            endpoint = "/api/admin/communication/disputes";
            if (disputeStatus) params.append('status', disputeStatus);
        }

        const res = await api.get(`${endpoint}?${params.toString()}`);
        const resultData = res.data.data || [];
        setData(resultData);
    } catch (e) {
        console.error('Failed to load communication data');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadData();
  }, [countryCode, activeTab, startDate, endDate, jobStatus, serviceCode, rating, reviewerRole, callStatus, disputeStatus]);

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
      api.get(`/api/v1/chat/${jobId}`).then(res => {
          setLiveMessages(res.data.messages);
      }).catch(err => console.error("History fetch failed", err));
  };

  const getJobStatusColor = (status: string) => {
      switch (status) {
          case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
          case 'STARTED':
          case 'IN_PROGRESS': return 'bg-orange-100 text-orange-700 border-orange-200';
          case 'ACCEPTED': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'BROADCASTING':
          case 'BROADCASTED': return 'bg-purple-100 text-purple-700 border-purple-200';
          default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Communication Hub</h1>
          <p className="text-neutral-500 font-medium">Monitor live chats, call records, and rating comments across the platform.</p>
        </div>
        <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 shadow-sm">
            {[
                { id: 'CHATS', icon: <MessageSquare size={14} />, label: 'Job Chats' },
                { id: 'CALLS', icon: <Phone size={14} />, label: 'Calls' },
                { id: 'RATINGS', icon: <Star size={14} />, label: 'Ratings' },
                { id: 'DISPUTES', icon: <Gavel size={14} />, label: 'Disputes' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setData([]); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                        activeTab === tab.id ? 'bg-white text-neutral-900 shadow-md ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-neutral-200 rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Job Type</label>
              <select
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-bold outline-none min-w-[140px]"
              >
                  <option value="">All Services</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
              </select>
          </div>
          <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Job Status</label>
              <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-bold outline-none min-w-[140px]"
              >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="STARTED">In Progress</option>
              </select>
          </div>
          <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">From Date</label>
              <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
              />
          </div>
          <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">To Date</label>
              <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
              />
          </div>

          {activeTab === "RATINGS" && (
              <>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Stars</label>
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                    >
                        <option value="">Any</option>
                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Reviewer</label>
                    <select
                        value={reviewerRole}
                        onChange={(e) => setReviewerRole(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                    >
                        <option value="">Everyone</option>
                        <option value="CUSTOMER">Customers</option>
                        <option value="PROVIDER">Providers</option>
                    </select>
                </div>
              </>
          )}

          {activeTab === "CALLS" && (
              <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Call Status</label>
                  <select
                      value={callStatus}
                      onChange={(e) => setCallStatus(e.target.value)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                  >
                      <option value="">All Calls</option>
                      <option value="ANSWERED">Answered</option>
                      <option value="MISSED">Missed</option>
                      <option value="REJECTED">Rejected</option>
                  </select>
              </div>
          )}

          {activeTab === "DISPUTES" && (
              <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Dispute Status</label>
                  <select
                      value={disputeStatus}
                      onChange={(e) => setDisputeStatus(e.target.value)}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                  >
                      <option value="">All Disputes</option>
                      <option value="OPEN">Open</option>
                      <option value="UNDER_INVESTIGATION">Investigating</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                  </select>
              </div>
          )}

          <div className="flex-1 flex justify-end">
              <button onClick={() => {
                  setStartDate(""); setEndDate(""); setJobStatus(""); setServiceCode("");
                  setRating(""); setReviewerRole(""); setCallStatus(""); setDisputeStatus("");
                  setSearchTerm("");
              }} className="text-[10px] font-black uppercase text-neutral-400 hover:text-neutral-900 transition-all flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 rounded-xl border border-transparent hover:border-neutral-200">
                  <RefreshCcw size={14} /> Reset
              </button>
          </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b flex justify-between items-center bg-neutral-50/50">
            <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button onClick={loadData} className="p-2 bg-white border rounded-lg text-neutral-400 hover:text-neutral-900 transition-all"><RefreshCcw size={14} /></button>
            </div>
        </div>

        <div className="overflow-x-auto">
            {loading ? (
                <div className="p-20 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Syncing Communication Vault...</div>
            ) : data.length === 0 ? (
                <div className="p-20 text-center text-neutral-400 font-bold uppercase text-xs">No records found for this criteria.</div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b">
                        <tr>
                            <th className="px-6 py-4">Job / Service</th>
                            <th className="px-6 py-4">Status</th>
                            {activeTab === "CHATS" && <th className="px-6 py-4">Participants</th>}
                            {activeTab === "CHATS" && <th className="px-6 py-4">Last Message</th>}
                            {activeTab === "CALLS" && <th className="px-6 py-4">Caller</th>}
                            {activeTab === "CALLS" && <th className="px-6 py-4">Receiver</th>}
                            {activeTab === "CALLS" && <th className="px-6 py-4 text-center">Stats</th>}
                            {activeTab === "RATINGS" && <th className="px-6 py-4">Reviewer</th>}
                            {activeTab === "RATINGS" && <th className="px-6 py-4">Reviewed User</th>}
                            {activeTab === "RATINGS" && <th className="px-6 py-4">Rating</th>}
                            {activeTab === "DISPUTES" && <th className="px-6 py-4">Raised By</th>}
                            {activeTab === "DISPUTES" && <th className="px-6 py-4">Status</th>}
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50/50 transition-all group">
                                <td className="px-6 py-4">
                                    <p className="text-xs font-black text-neutral-900">#{(item.job?._id || item.jobId?._id || item.jobId)?.slice(-6).toUpperCase()}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">{item.job?.serviceCode || item.jobId?.serviceCode}</p>
                                </td>

                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border shadow-sm ${getJobStatusColor(item.job?.status || item.jobId?.status)}`}>
                                        {(item.job?.status || item.jobId?.status || 'UNKNOWN').replace('_', ' ')}
                                    </span>
                                </td>

                                {activeTab === "CHATS" && (
                                    <>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[8px] font-black">C</div>
                                                    <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">P</div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] font-black uppercase">{item.customer?.firstName}</p>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">{item.provider?.firstName || 'Pending'}</p>
                                                </div>
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
                                            <UserBadge name={`${item.callerId?.firstName} ${item.callerId?.lastName}`} role={item.callerId?.role} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <UserBadge name={`${item.receiverId?.firstName} ${item.receiverId?.lastName}`} role={item.receiverId?.role} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${item.status === 'ANSWERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{item.status}</span>
                                                <span className="text-[10px] font-bold text-neutral-400">{item.duration || 0}s</span>
                                            </div>
                                        </td>
                                    </>
                                )}

                                {activeTab === "RATINGS" && (
                                    <>
                                        <td className="px-6 py-4">
                                            <UserBadge name={`${item.reviewerId?.firstName} ${item.reviewerId?.lastName}`} role={item.reviewerRole} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <UserBadge name={`${item.reviewedUserId?.firstName} ${item.reviewedUserId?.lastName}`} role={item.reviewerRole === 'CUSTOMER' ? 'PROVIDER' : 'CUSTOMER'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-xs font-black">{item.rating}</span>
                                            </div>
                                        </td>
                                    </>
                                )}

                                {activeTab === "DISPUTES" && (
                                    <>
                                        <td className="px-6 py-4">
                                            <UserBadge name={`${item.raisedBy?.firstName} ${item.raisedBy?.lastName}`} role={item.raisedBy?.role} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-neutral-900 uppercase">{item.status.replace('_', ' ')}</span>
                                        </td>
                                    </>
                                )}

                                <td className="px-6 py-4">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">{formatDate(item.createdAt)}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        {activeTab === 'CHATS' && (
                                            <button
                                                onClick={() => openMonitoring(item._id)}
                                                className="p-2 hover:bg-neutral-900 hover:text-white rounded-lg transition-all text-neutral-400"
                                                title="Monitor Chat"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedJob(item.job || item.jobId)}
                                            className="p-2 hover:bg-neutral-100 rounded-lg transition-all text-neutral-400 hover:text-neutral-900"
                                            title="View Job Details"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {/* Monitoring Modal */}
      {monitoringJobId && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-2xl h-[700px] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-8 border-b flex justify-between items-center bg-neutral-900 text-white">
                      <div>
                          <h3 className="font-black uppercase tracking-tight text-xl flex items-center gap-3">
                              <MessageSquare size={20} className="text-emerald-400" />
                              Live Audit: Job #{monitoringJobId.slice(-6).toUpperCase()}
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
                                  {m.senderId?.firstName || 'User'} • {formatDate(m.createdAt, 'HH:mm')}
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

      {/* Job Detail Panel */}
      {selectedJob && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex justify-end">
              <div className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                  <div className="p-10 border-b flex justify-between items-center">
                      <div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm mb-4 inline-block ${getJobStatusColor(selectedJob.status)}`}>
                            {selectedJob.status.replace('_', ' ')}
                          </span>
                          <h3 className="text-3xl font-black uppercase tracking-tighter text-neutral-900">Job #{selectedJob._id?.slice(-6).toUpperCase()}</h3>
                          <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2">{selectedJob.serviceCode} Engagement</p>
                      </div>
                      <button onClick={() => setSelectedJob(null)} className="p-4 bg-neutral-100 rounded-[20px] hover:bg-neutral-200 transition-all"><X size={24} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 space-y-12">
                      {/* Timeline */}
                      <section className="space-y-6">
                        <SectionTitle icon={<Clock size={16}/>} title="Operational Timeline" />
                        <div className="grid grid-cols-2 gap-8">
                            <TimelineItem label="Created" date={selectedJob.createdAt} />
                            <TimelineItem label="Accepted" date={selectedJob.acceptedAt} />
                            <TimelineItem label="Started" date={selectedJob.startedAt} />
                            <TimelineItem label="Completed" date={selectedJob.completedAt} />
                        </div>
                      </section>

                      {/* Locations */}
                      <section className="space-y-6">
                        <SectionTitle icon={<MapPin size={16}/>} title="Location Audit" />
                        <div className="space-y-4">
                            <div className="p-6 bg-neutral-50 rounded-[24px] border border-neutral-100 space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0"><Navigation size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Pickup / Customer Base</p>
                                        <p className="text-sm font-bold text-neutral-900">{selectedJob.pickupLocation?.address || selectedJob.location?.address || 'No Address Data'}</p>
                                        {selectedJob.location?.coordinates && (
                                            <p className="text-[10px] font-medium text-neutral-400 mt-1">{selectedJob.location.coordinates[1].toFixed(6)}, {selectedJob.location.coordinates[0].toFixed(6)}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0"><MapPin size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Work Destination</p>
                                        <p className="text-sm font-bold text-neutral-900">{selectedJob.location?.address || 'Same as Pickup'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </section>

                      {/* Performance */}
                      <section className="space-y-6">
                         <SectionTitle icon={<Activity size={16}/>} title="Fulfillment Data" />
                         <div className="grid grid-cols-2 gap-4">
                             <div className="bg-neutral-900 rounded-[24px] p-6 text-white shadow-xl">
                                 <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-2">Distance Travelled</p>
                                 <p className="text-2xl font-black">{selectedJob.distanceTravelled ? (selectedJob.distanceTravelled / 1000).toFixed(2) : '0.00'} <span className="text-xs text-neutral-400">KM</span></p>
                             </div>
                             <div className="bg-white border border-neutral-200 rounded-[24px] p-6 shadow-sm">
                                 <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2">Duration</p>
                                 <p className="text-2xl font-black text-neutral-900">{calculateDuration(selectedJob.startedAt, selectedJob.completedAt)}</p>
                             </div>
                         </div>
                      </section>
                  </div>

                  <div className="p-10 border-t bg-neutral-50/50">
                      <button
                        onClick={() => window.open(`/jobs?id=${selectedJob._id}`, '_blank')}
                        className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3"
                      >
                          Audit Full Lifecycle <ExternalLink size={16} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function UserBadge({ name, role }: { name: string, role: string }) {
    return (
        <div className="flex flex-col">
            <p className="text-xs font-black text-neutral-900">{name}</p>
            <span className="text-[8px] font-black uppercase text-neutral-400">{role}</span>
        </div>
    )
}

function SectionTitle({ icon, title }: { icon: any, title: string }) {
    return (
        <div className="flex items-center gap-3 text-neutral-400">
            {icon}
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">{title}</h4>
        </div>
    )
}

function TimelineItem({ label, date }: { label: string, date?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{label}</p>
            <p className="text-sm font-bold text-neutral-900">{date ? formatDate(date, 'HH:mm | dd MMM') : '---'}</p>
        </div>
    )
}

function calculateDuration(start?: string, end?: string) {
    if (!start || !end) return 'N/A';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
}

function Activity({ size }: { size: number }) { return <Clock size={size} /> }
