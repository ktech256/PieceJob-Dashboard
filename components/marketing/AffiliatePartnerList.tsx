"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import {
  Users,
  Plus,
  Search,
  ExternalLink,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  ShieldAlert,
  Edit,
  Trash2,
  XCircle,
  Copy,
  Download,
  ExternalLink,
  Search,
  TrendingUp
} from 'lucide-react';

import PartnerAnalyticsDetail from './PartnerAnalyticsDetail';

export default function AffiliatePartnerList({ countryCode }: { countryCode: string }) {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState<any>(null);
    const [viewingPartnerId, setViewingPartnerId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const loadPartners = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/affiliate/admin?countryCode=${countryCode}&search=${search}&status=${statusFilter}`);
            setPartners(res.data.data);
        } catch (e) {
            console.error('Failed to load partners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => loadPartners(), 300);
        return () => clearTimeout(timer);
    }, [countryCode, search, statusFilter]);

    const exportPartners = () => {
        const headers = ["Name", "Email", "Phone", "Type", "Status", "Referrals", "Earnings"];
        const rows = partners.map(p => [
            p.name,
            p.email,
            p.phone,
            p.type,
            p.status,
            p.totalReferrals || 0,
            p.earningsLifetime || 0
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `piecejob_partners_${countryCode}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* TOOLBAR */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                    <div>
                        <p className="text-xs font-black uppercase">Partner Network</p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">Enterprise Affiliates: {partners.length}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <button
                        onClick={exportPartners}
                        className="p-2.5 bg-neutral-50 rounded-xl text-neutral-400 hover:text-neutral-900 transition-all border border-neutral-100"
                    >
                        <Download size={18} />
                    </button>
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Protocol..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-2.5 text-xs font-black uppercase outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="DORMANT">Dormant</option>
                    </select>
                    <button
                        onClick={() => { setEditingPartner(null); setShowModal(true); }}
                        className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={14} /> Onboard Partner
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {partners.map((partner) => (
                    <div key={partner._id} className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all p-8 flex flex-col gap-6 group">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-center">
                                <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl group-hover:bg-blue-600 transition-colors">
                                    {partner.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-black uppercase text-neutral-900">{partner.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${partner.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {partner.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight mt-0.5">{partner.type} • {partner.company || 'Private Entity'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingPartner(partner); setShowModal(true); }} className="p-2.5 bg-neutral-50 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"><Edit size={16} /></button>
                                <button onClick={() => setViewingPartnerId(partner._id)} className="p-2.5 bg-neutral-50 rounded-xl text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><TrendingUp size={16} /></button>
                            </div>
                        </div>

                        {/* PERFORMANCE MATRIX */}
                        <div onClick={() => setViewingPartnerId(partner._id)} className="grid grid-cols-2 gap-4 cursor-pointer">
                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100/50 group-hover:border-blue-100 transition-all">
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Total Referrals</p>
                                <p className="text-lg font-black text-neutral-900 mt-1">{partner.totalReferrals || 0}</p>
                            </div>
                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100/50 group-hover:border-blue-100 transition-all">
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Lifetime Earnings</p>
                                <p className="text-lg font-black text-blue-600 mt-1">{partner.earningsLifetime || 0} R</p>
                            </div>
                            <div className="p-4 bg-green-50/30 rounded-2xl border border-green-100/50 group-hover:border-green-200 transition-all">
                                <p className="text-[8px] font-black text-green-600/60 uppercase tracking-widest">Active Leads</p>
                                <p className="text-lg font-black text-green-700 mt-1">{partner.activeReferrals || 0}</p>
                            </div>
                            <div className="p-4 bg-yellow-50/30 rounded-2xl border border-yellow-100/50 group-hover:border-yellow-200 transition-all">
                                <p className="text-[8px] font-black text-yellow-600/60 uppercase tracking-widest">Pending Yield</p>
                                <p className="text-lg font-black text-yellow-700 mt-1">{partner.pendingCommission || 0} R</p>
                            </div>
                        </div>

                        <div className="bg-neutral-900 rounded-[24px] p-5 flex justify-between items-center text-white">
                            <div>
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Referral protocol code</p>
                                <p className="text-xs font-black tracking-widest">{partner.referralCode}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { navigator.clipboard.writeText(partner.referralCode); alert('Code Copied'); }} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Copy size={14} /></button>
                                <button onClick={() => setViewingPartnerId(partner._id)} className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"><ExternalLink size={14} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {viewingPartnerId && (
                <PartnerAnalyticsDetail
                    partnerId={viewingPartnerId}
                    onClose={() => setViewingPartnerId(null)}
                />
            )}

            {showModal && (
                <PartnerModal
                    partner={editingPartner}
                    countryCode={countryCode}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadPartners(); }}
                />
            )}
        </div>
    );
}

function PartnerModal({ partner, countryCode, onClose, onSave }: any) {
    const [form, setForm] = useState(partner || {
        name: '',
        company: '',
        type: 'Influencer',
        contactPerson: '',
        email: '',
        phone: '',
        countryCode: countryCode,
        commissionModel: 'FIXED',
        commissionValue: 50,
        status: 'ACTIVE'
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!form.name || !form.email || !form.phone || !form.contactPerson) {
            alert('Please fill in all mandatory fields.');
            return;
        }

        setSaving(true);
        try {
            await api.post('/api/v1/affiliate/admin', form);
            onSave();
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || 'Failed to onboard partner. Please verify if email/phone is already in use.';
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
            <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-200">
                <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Onboard Affiliate Partner</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Assign to Node: {countryCode}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full transition-colors"><XCircle size={24} className="text-neutral-300" /></button>
                </div>

                <div className="p-10 grid grid-cols-2 gap-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="col-span-2">
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Partner / Entity Name *</label>
                        <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all" placeholder="e.g. Acme Marketing" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Contact Person *</label>
                        <input type="text" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all" placeholder="Full Name" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Company (Optional)</label>
                        <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all" placeholder="Legal Entity Name" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Email Address *</label>
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all" placeholder="partner@example.com" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Phone Number *</label>
                        <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all" placeholder="+27..." />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Partner Type</label>
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all">
                            <option value="Influencer">Influencer</option>
                            <option value="Media House">Media House</option>
                            <option value="Marketing Agency">Marketing Agency</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Referral Agent">Referral Agent</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Commission Yield (Fixed R)</label>
                        <input type="number" value={form.commissionValue} onChange={e => setForm({...form, commissionValue: parseFloat(e.target.value)})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all" />
                    </div>
                </div>

                <div className="p-10 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
                    <button onClick={onClose} disabled={saving} className="flex-1 bg-white border border-neutral-200 text-neutral-500 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral-50 transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex-[2] bg-neutral-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl disabled:opacity-50">
                        {saving ? 'Processing...' : 'Activate Partner Protocol'}
                    </button>
                </div>
            </div>
        </div>
    );
}
