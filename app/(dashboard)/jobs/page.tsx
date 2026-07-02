"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Briefcase,
  Search,
  Filter,
  RefreshCcw,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Play,
  Check,
  Ban,
  User,
  Wrench,
  CreditCard,
  History,
  Activity,
  Phone,
  MessageSquare,
  Star
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { io } from 'socket.io-client';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '200px',
    borderRadius: '24px'
};

export default function JobsMonitoring() {
  const { countryCode, currentCountry } = useCountryStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideData, setOverrideData] = useState<{ job: any, status: string } | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  const fetchJobs = async () => {
    try {
        const res = await api.get(`/api/admin/analytics/live-ops?countryCode=${countryCode}`);
        setJobs(res.data.data.activeJobs || []);
    } catch (e) {
        console.error('Failed to load jobs');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) {
        setLoading(true);
        fetchJobs();
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socket.on('connect', () => {
        console.log('[SOCKET] Connected to Admin Channel');
        socket.emit('join_workspace', countryCode);
    });

    socket.on('status_updated', (data) => {
        console.log('[SOCKET] Job status change detected, refreshing...', data);
        fetchJobs();
    });

    const interval = setInterval(fetchJobs, 60000); // Fallback refresh every 1 min

    return () => {
        socket.disconnect();
        clearInterval(interval);
    };
  }, [countryCode]);

  const handleOverride = async () => {
    if (!overrideData || !overrideReason) return;
    try {
        await api.patch(`/api/admin/jobs/${overrideData.job._id}/status`, {
            status: overrideData.status,
            reason: overrideReason
        });
        alert(`Job status updated to ${overrideData.status}`);
        setIsOverrideOpen(false);
        setOverrideReason('');
        fetchJobs();
    } catch (e: any) {
        alert(e.response?.data?.message || 'Override failed');
    }
  };

  const openOverride = (job: any, status: string) => {
    setOverrideData({ job, status });
    setIsOverrideOpen(true);
  };

  const openDetails = (job: any) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  const filteredJobs = jobs.filter(j => activeFilter === 'ALL' || j.status === activeFilter);

  const getCurrency = (job: any) => {
    if (job.pricingSnapshot?.currencyCode) return job.pricingSnapshot.currencyCode;
    // If the country store has a currency symbol (like 'R'), we try to use it,
    // but Intl.NumberFormat expects a 3-letter code (ZAR) for 'currency' style.
    // Our formatCurrency handles this fallback.
    return currentCountry?.currency || 'USD';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Live Engagement Monitor</h1>
          <p className="text-neutral-500 font-medium">Real-time oversight of all service requests and fulfillment cycles.</p>
        </div>
        <button onClick={fetchJobs} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all shadow-sm">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <StatCard title="Active Requests" value={jobs.length.toString()} icon={<Briefcase size={20} />} color="bg-blue-50 text-blue-600" />
          <StatCard title="En Route" value={jobs.filter(j => j.status === 'EN_ROUTE').length.toString()} icon={<Clock size={20} />} color="bg-orange-50 text-orange-600" />
          <StatCard title="In Progress" value={jobs.filter(j => j.status === 'STARTED').length.toString()} icon={<CheckCircle2 size={20} />} color="bg-green-50 text-green-600" />
          <StatCard title="Broadcasts" value={jobs.filter(j => j.status === 'BROADCASTED').length.toString()} icon={<RefreshCcw size={20} />} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
              <div className="flex gap-4">
                  {['ALL', 'BROADCASTED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'STARTED'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeFilter === f ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-400'}`}
                      >
                          {f.replace('_', ' ')}
                      </button>
                  ))}
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                      <tr>
                          <th className="px-8 py-5">Job ID</th>
                          <th className="px-8 py-5">Service</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5">Customer</th>
                          <th className="px-8 py-5">Provider</th>
                          <th className="px-8 py-5">Value</th>
                          <th className="px-8 py-5">Action</th>
                          <th className="px-8 py-5 text-right">Details</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                      {filteredJobs.map(job => (
                          <tr key={job._id} className="hover:bg-neutral-50/50 transition-all">
                              <td className="px-8 py-5 font-mono text-xs text-neutral-400">#{job._id.slice(-6).toUpperCase()}</td>
                              <td className="px-8 py-5 text-neutral-900">
                                  <div className="font-bold">{job.serviceName || 'Unknown Service'}</div>
                                  <div className="text-[10px] text-neutral-400 font-mono">{job.serviceCode}</div>
                              </td>
                              <td className="px-8 py-5">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(job.status)}`}>
                                      {job.status.replace('_', ' ')}
                                  </span>
                              </td>
                              <td className="px-8 py-5 text-neutral-500">
                                  {job.customerId?.firstName ? `${job.customerId.firstName} ${job.customerId.lastName}` : 'User'}
                              </td>
                              <td className="px-8 py-5 text-neutral-500">
                                  {job.providerId?.firstName ? `${job.providerId.firstName} ${job.providerId.lastName}` : 'Waiting...'}
                              </td>
                              <td className="px-8 py-5 text-neutral-900">
                                  {formatCurrency(job.bookingFee + (job.serviceFee || 0), getCurrency(job))}
                              </td>
                              <td className="px-8 py-5">
                                  <div className="flex gap-2">
                                      {job.status === 'BROADCASTED' && (
                                          <button onClick={() => openOverride(job, 'CANCELLED')} title="Cancel Broadcast" className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                                              <Ban size={14} />
                                          </button>
                                      )}
                                      {['ACCEPTED', 'ARRIVED', 'EN_ROUTE'].includes(job.status) && (
                                          <>
                                              <button onClick={() => openOverride(job, 'STARTED')} title="Start Job" className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all">
                                                  <Play size={14} />
                                              </button>
                                              <button onClick={() => openOverride(job, 'CANCELLED')} title="Cancel Job" className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                                                  <XCircle size={14} />
                                              </button>
                                          </>
                                      )}
                                      {job.status === 'STARTED' && (
                                          <button onClick={() => openOverride(job, 'COMPLETED')} title="End Job" className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all">
                                              <Check size={14} />
                                          </button>
                                      )}
                                  </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                  <button onClick={() => openDetails(job)} className="p-2 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all">
                                      <ChevronRight size={16} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {isOverrideOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[32px] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-4 mb-6 text-red-600">
                      <div className="p-3 bg-red-50 rounded-2xl"><ShieldAlert size={32} /></div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">System Override</h3>
                  </div>
                  <p className="text-neutral-500 font-bold mb-8">
                      Are you sure you want to manually <span className="text-neutral-900">{overrideData?.status}</span> this job? This action will be logged and notified to both parties.
                  </p>

                  <div className="space-y-4 mb-8">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Reason for Override</label>
                      <textarea
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g., GPS mismatch, Provider device failure..."
                        className="w-full h-32 bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-red-500 transition-all resize-none"
                      />
                  </div>

                  <div className="flex gap-4">
                      <button
                        onClick={handleOverride}
                        disabled={!overrideReason}
                        className="flex-1 bg-neutral-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                      >
                          Confirm Override
                      </button>
                      <button
                        onClick={() => setIsOverrideOpen(false)}
                        className="px-8 py-4 bg-neutral-100 text-neutral-600 rounded-2xl font-black uppercase tracking-widest hover:bg-neutral-200 transition-all"
                      >
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isDetailsOpen && selectedJob && (
          <JobDetailsModal
            jobId={selectedJob._id}
            onClose={() => setIsDetailsOpen(false)}
          />
      )}
    </div>
  );
}

function JobDetailsModal({ jobId, onClose }: { jobId: string, onClose: () => void }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/api/admin/jobs/${jobId}`);
                setData(res.data.data);
            } catch (e) {
                alert('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [jobId]);

    if (loading) return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl animate-pulse flex items-center gap-4">
                <RefreshCcw className="animate-spin text-neutral-400" />
                <span className="font-black uppercase tracking-widest text-xs">Retrieving Forensic Data...</span>
            </div>
        </div>
    );

    const { job, ledger, calls, auditLogs, providerProfile, reviews, chatCount } = data;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-50 rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300">
                <div className="p-8 bg-white border-b flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Job Case File: <span className="text-neutral-400">#{job._id.slice(-8).toUpperCase()}</span></h2>
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{job.serviceName} • {formatDateTime(job.createdAt)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-neutral-100 rounded-2xl hover:bg-neutral-200 transition-all font-black uppercase text-[10px] tracking-widest">Close Record</button>
                </div>

                <div className="flex-1 overflow-y-auto p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Column */}
                        <div className="space-y-8">
                            <DetailCard title="Current Status" icon={<Activity size={18} />}>
                                <div className="flex items-center justify-between">
                                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${getStatusColor(job.status)}`}>
                                        {job.status.replace('_', ' ')}
                                    </span>
                                    <p className="text-[10px] font-bold text-neutral-400">v{job.version}</p>
                                </div>
                            </DetailCard>

                            <DetailCard title="Service Financials" icon={<CreditCard size={18} />}>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black uppercase text-neutral-400">Booking Fee</span>
                                        <span className="font-black">{formatCurrency(job.bookingFee, job.pricingSnapshot?.currencyCode || 'USD')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black uppercase text-neutral-400">Service Fee</span>
                                        <span className="font-black">{formatCurrency(job.serviceFee || 0, job.pricingSnapshot?.currencyCode || 'USD')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black uppercase text-neutral-400">Payment Status</span>
                                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-neutral-100 rounded-lg">{job.paymentStatus}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black uppercase text-neutral-400">Escrow</span>
                                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">{job.escrowStatus}</span>
                                    </div>
                                    <div className="border-t border-dashed pt-4 flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase text-neutral-900">Total Value</span>
                                        <span className="text-xl font-black text-emerald-600">{formatCurrency(job.bookingFee + (job.serviceFee || 0), job.pricingSnapshot?.currencyCode || 'USD')}</span>
                                    </div>
                                </div>
                            </DetailCard>

                            <DetailCard title="Participant Link" icon={<User size={18} />}>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">C</div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-neutral-400">Customer</p>
                                            <p className="font-black">{job.customerId?.firstName} {job.customerId?.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-black">P</div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-neutral-400">Provider</p>
                                            <p className="font-black">{job.providerId?.firstName ? `${job.providerId.firstName} ${job.providerId.lastName}` : 'UNASSIGNED'}</p>
                                        </div>
                                    </div>
                                </div>
                            </DetailCard>
                        </div>

                        {/* Middle Column: Location & Timeline */}
                        <div className="space-y-8">
                            <DetailCard title="Geospatial Data" icon={<MapPin size={18} />}>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">Location Mapping</p>
                                        <div className="p-4 bg-neutral-900 rounded-2xl text-white mb-4">
                                            <p className="text-xs font-bold leading-relaxed mb-4">{job.location?.address}</p>
                                            <div className="flex gap-4 mb-4">
                                                <div>
                                                    <p className="text-[8px] font-black uppercase text-neutral-500">Lat</p>
                                                    <p className="font-mono text-xs">{job.location?.coordinates[1]}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase text-neutral-500">Lng</p>
                                                    <p className="font-mono text-xs">{job.location?.coordinates[0]}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${job.location?.coordinates[1]},${job.location?.coordinates[0]}`}
                                                target="_blank"
                                                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all"
                                            >
                                                <MapPin size={12} />
                                                View on Maps
                                            </a>
                                        </div>
                                    </div>
                                    {job.distanceTravelled > 0 && (
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Distance Recorded</p>
                                            <p className="text-sm font-black">{(job.distanceTravelled / 1000).toFixed(2)} KM</p>
                                        </div>
                                    )}
                                    {job.pickupLocation && (
                                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Pickup Required</p>
                                            <p className="text-xs font-bold">{job.pickupLocation.address}</p>
                                        </div>
                                    )}
                                </div>
                            </DetailCard>

                            <DetailCard title="Financial Ledger" icon={<History size={18} />}>
                                <div className="space-y-3">
                                    {ledger.length === 0 ? (
                                        <p className="text-xs font-bold text-neutral-400 text-center py-2 uppercase">No movements detected.</p>
                                    ) : (
                                        ledger.map((entry: any) => (
                                            <div key={entry._id} className="flex justify-between items-center text-xs">
                                                <span className="text-neutral-500 font-bold uppercase">{entry.type}</span>
                                                <span className={`font-black ${entry.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {formatCurrency(entry.amount, entry.currency)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </DetailCard>

                            <DetailCard title="Audit Timeline" icon={<History size={18} />}>
                                <div className="space-y-4">
                                    <TimeRow label="Requested" time={job.createdAt} />
                                    <TimeRow label="Accepted" time={job.acceptedAt} />
                                    <TimeRow label="Provider Arrived" time={job.arrivedAt} />
                                    <TimeRow label="Work Started" time={job.startedAt} />
                                    <TimeRow label="Completed" time={job.completedAt} />
                                    {job.status === 'CANCELLED' && <TimeRow label="Cancelled" time={job.updatedAt} highlight />}
                                </div>
                            </DetailCard>
                        </div>

                        {/* Right Column: Comms & Overrides */}
                        <div className="space-y-8">
                            {['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'STARTED'].includes(job.status) && providerProfile?.location && (
                                <DetailCard title="Live Tracking" icon={<MapPin size={18} className="text-emerald-500 animate-pulse" />}>
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black uppercase text-emerald-600">Provider Live GPS</span>
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-neutral-400">Lat</p>
                                                <p className="font-mono text-xs font-bold">{providerProfile.location.coordinates[1]}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-neutral-400">Lng</p>
                                                <p className="font-mono text-xs font-bold">{providerProfile.location.coordinates[0]}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${providerProfile.location.coordinates[1]},${providerProfile.location.coordinates[0]}`}
                                            target="_blank"
                                            className="w-full py-2 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all hover:bg-emerald-700"
                                        >
                                            <ExternalLink size={12} />
                                            Intercept Provider
                                        </a>
                                    </div>
                                </DetailCard>
                            )}

                            <DetailCard title="Communication Audit" icon={<Phone size={18} />}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-2xl border border-neutral-100 text-center">
                                        <p className="text-2xl font-black">{calls.length}</p>
                                        <p className="text-[10px] font-black uppercase text-neutral-400">Calls Logged</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-neutral-100 text-center">
                                        <p className="text-2xl font-black">{chatCount}</p>
                                        <p className="text-[10px] font-black uppercase text-neutral-400">Messages</p>
                                    </div>
                                </div>
                            </DetailCard>

                            <DetailCard title="Admin Intervention Log" icon={<ShieldAlert size={18} />}>
                                {auditLogs.length === 0 ? (
                                    <p className="text-xs font-bold text-neutral-400 uppercase text-center py-4">No interventions recorded.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {auditLogs.map((log: any) => (
                                            <div key={log._id} className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[10px] font-black uppercase text-red-600">{log.action.replace('_', ' ')}</p>
                                                    <p className="text-[8px] font-bold text-neutral-400">{formatDateTime(log.createdAt)}</p>
                                                </div>
                                                <p className="text-xs font-bold text-neutral-800 mb-1">Reason: {log.newValue?.reason || 'N/A'}</p>
                                                <p className="text-[9px] font-black text-neutral-400 uppercase">By: {log.adminId?.firstName} {log.adminId?.lastName}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DetailCard>

                            <DetailCard title="Ratings & Feedback" icon={<Star size={18} />}>
                                {reviews.length === 0 ? (
                                    <p className="text-xs font-bold text-neutral-400 uppercase text-center py-4">No reviews yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((rev: any) => (
                                            <div key={rev._id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black uppercase text-neutral-400">{rev.reviewerRole}</span>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} className={i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {rev.comment && <p className="text-xs italic text-neutral-600">"{rev.comment}"</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DetailCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailCard({ title, icon, children }: any) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="text-neutral-400">{icon}</div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900">{title}</h4>
            </div>
            {children}
        </div>
    )
}

function TimeRow({ label, time, highlight }: any) {
    if (!time) return null;
    return (
        <div className="flex justify-between">
            <span className={`text-[10px] font-black uppercase ${highlight ? 'text-red-500' : 'text-neutral-400'}`}>{label}</span>
            <span className="text-[10px] font-bold font-mono">{formatDateTime(time)}</span>
        </div>
    )
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>{icon}</div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{title}</p>
            <p className="text-3xl font-black text-neutral-900 mt-1">{value}</p>
        </div>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'BROADCASTED': return 'bg-purple-50 text-purple-600';
        case 'ACCEPTED': return 'bg-blue-50 text-blue-600';
        case 'EN_ROUTE': return 'bg-orange-50 text-orange-600';
        case 'ARRIVED': return 'bg-green-50 text-green-600';
        case 'STARTED': return 'bg-emerald-50 text-emerald-600';
        default: return 'bg-neutral-50 text-neutral-400';
    }
}
