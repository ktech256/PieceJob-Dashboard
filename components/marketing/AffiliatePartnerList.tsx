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
  Download
} from 'lucide-react';

export default function AffiliatePartnerList({ countryCode }: { countryCode: string }) {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState<any>(null);

    const loadPartners = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/affiliate/admin?countryCode=${countryCode}`);
            setPartners(res.data.data);
        } catch (e) {
            console.error('Failed to load partners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPartners();
    }, [countryCode]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                    <div>
                        <p className="text-xs font-black uppercase">Partner Network</p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase">Authorized Affiliates: {partners.length}</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingPartner(null); setShowModal(true); }}
                    className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
                >
                    <Plus size={14} /> Onboard Partner
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {partners.map((partner) => (
                    <div key={partner._id} className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-lg transition-all p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                    {partner.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase text-neutral-900">{partner.name}</h3>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase">{partner.type} • {partner.company || 'Private Entity'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors"><Edit size={14} /></button>
                                <button className="p-2 bg-neutral-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-y border-neutral-50 py-6">
                            <div className="text-center border-r border-neutral-50">
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Registrations</p>
                                <p className="text-lg font-black mt-1">{partner.stats.registrations}</p>
                            </div>
                            <div className="text-center border-r border-neutral-50">
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Qualified</p>
                                <p className="text-lg font-black mt-1 text-green-600">{partner.stats.qualifiedUsers}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Earnings</p>
                                <p className="text-lg font-black mt-1 text-blue-600">{partner.balance.available} R</p>
                            </div>
                        </div>

                        <div className="bg-neutral-50 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Referral Code</p>
                                <p className="text-xs font-black text-neutral-900">{partner.referralCode}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white rounded-lg shadow-sm text-neutral-600 hover:text-neutral-900 transition-all"><Copy size={12} /></button>
                                <button className="p-2 bg-white rounded-lg shadow-sm text-neutral-600 hover:text-neutral-900 transition-all"><Download size={12} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
        email: '',
        phone: '',
        countryCode: countryCode,
        commissionModel: 'FIXED',
        commissionValue: 50,
        status: 'ACTIVE'
    });

    const handleSave = async () => {
        try {
            await api.post('/api/v1/affiliate/admin', form);
            onSave();
        } catch (e) {
            alert('Failed to save partner');
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
            <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden text-neutral-900">
                <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Onboard Affiliate Partner</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Assign to Node: {countryCode}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full transition-colors"><XCircle size={24} className="text-neutral-300" /></button>
                </div>

                <div className="p-10 grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Partner / Entity Name</label>
                        <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Email Address</label>
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-brand-customer-red transition-all" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Phone Number</label>
                        <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-brand-customer-red transition-all" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Partner Type</label>
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all">
                            <option value="Influencer">Influencer</option>
                            <option value="Media House">Media House</option>
                            <option value="Marketing Agency">Marketing Agency</option>
                            <option value="Corporate">Corporate</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Commission Yield</label>
                        <input type="number" value={form.commissionValue} onChange={e => setForm({...form, commissionValue: e.target.value})} className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all" />
                    </div>
                </div>

                <div className="p-10 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-white border border-neutral-200 text-neutral-500 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                    <button onClick={handleSave} className="flex-[2] bg-neutral-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl">Activate Partner</button>
                </div>
            </div>
        </div>
    );
}
