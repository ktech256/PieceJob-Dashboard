"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Send,
  Calendar,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Bell,
  Users,
  Target,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function MarketingPage() {
  const { countryCode } = useCountryStore();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('promotions'); // 'promotions' or 'notifications'

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/marketing/promotions');
      setPromotions(res.data.data);
    } catch (e) {
      console.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, [countryCode]);

  const handleDelete = async (id: string) => {
    if (!confirm('Destroy this promotion?')) return;
    await api.delete(`/api/v1/marketing/promotions/${id}`);
    loadPromotions();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Growth & Marketing</h2>
          <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Acquisition, Retention & Engagement Control</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'promotions' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50 border border-neutral-200'}`}
          >
            Promotions
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notifications' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50 border border-neutral-200'}`}
          >
            Global Push
          </button>
        </div>
      </div>

      {activeTab === 'promotions' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-customer-red/10 text-brand-customer-red rounded-xl"><Megaphone size={20} /></div>
                <div>
                   <p className="text-xs font-black uppercase">Dashboard Banners</p>
                   <p className="text-[10px] text-neutral-400 font-bold uppercase">Active: {promotions.filter(p => p.isActive).length}</p>
                </div>
             </div>
             <button
                onClick={() => { setEditingPromo(null); setShowPromoModal(true); }}
                className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
             >
                <Plus size={14} /> Create Promotion
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div key={promo._id} className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="h-40 bg-neutral-100 relative">
                  {promo.imageUrl ? (
                    <img src={promo.imageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300"><ImageIcon size={40} /></div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setEditingPromo(promo); setShowPromoModal(true); }} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-neutral-600 hover:text-neutral-900 transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(promo._id)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${promo.isActive ? 'bg-green-500 text-white' : 'bg-neutral-500 text-white'}`}>
                      {promo.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-neutral-900">{promo.title}</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1 leading-relaxed">{promo.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-50">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Visibility</span>
                        <span className="text-[10px] font-bold text-neutral-800">{promo.targetRole}</span>
                     </div>
                     <div className="flex flex-col text-right">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Priority</span>
                        <span className="text-[10px] font-bold text-neutral-800">{promo.priority}</span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PushNotificationComposer />
      )}

      {showPromoModal && (
        <PromoModal
          promo={editingPromo}
          onClose={() => setShowPromoModal(false)}
          onSave={() => { setShowPromoModal(false); loadPromotions(); }}
        />
      )}
    </div>
  );
}

function PushNotificationComposer() {
  const [form, setForm] = useState({
    target: 'ALL',
    title: '',
    body: '',
    imageUrl: '',
    deepLink: '',
    countryCode: 'ZA'
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!form.title || !form.body) return alert('Title and Message required.');
    setSending(true);
    try {
      await api.post('/api/v1/marketing/notifications/push', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white border border-neutral-200 rounded-[40px] p-12 shadow-xl space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Bell size={32} /></div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Global Push Oracle</h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Immediate Fire Dispatch System</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Target Audience</label>
                   <select
                      value={form.target}
                      onChange={e => setForm({...form, target: e.target.value})}
                      className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all"
                   >
                      <option value="ALL">Everyone</option>
                      <option value="CUSTOMERS">Customers Only</option>
                      <option value="PROVIDERS">Providers Only</option>
                   </select>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Title</label>
                   <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                      placeholder="e.g. Flash Sale Alert!"
                      className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all"
                   />
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Deep Link / Action</label>
                   <input
                      type="text"
                      value={form.deepLink}
                      onChange={e => setForm({...form, deepLink: e.target.value})}
                      placeholder="piecejob://promos/sale"
                      className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-brand-customer-red transition-all"
                   />
                </div>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Message Body</label>
                   <textarea
                      rows={5}
                      value={form.body}
                      onChange={e => setForm({...form, body: e.target.value})}
                      placeholder="Craft your notification content here..."
                      className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-brand-customer-red transition-all resize-none"
                   />
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Image URL (Optional)</label>
                   <input
                      type="text"
                      value={form.imageUrl}
                      onChange={e => setForm({...form, imageUrl: e.target.value})}
                      placeholder="https://..."
                      className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-brand-customer-red transition-all"
                   />
                </div>
             </div>
          </div>

          <div className="pt-8 border-t border-neutral-100">
             {success ? (
               <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex items-center justify-center gap-3 animate-bounce">
                  <CheckCircle size={20} />
                  <span className="font-black uppercase text-xs">Oracle has successfully dispatched the signal.</span>
               </div>
             ) : (
               <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full bg-neutral-900 text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-neutral-200 disabled:opacity-50"
               >
                  {sending ? 'Dispatching...' : <><Send size={18} /> Execute Global Blast</>}
               </button>
             )}
          </div>
       </div>
    </div>
  );
}

function PromoModal({ promo, onClose, onSave }: any) {
  const [form, setForm] = useState(promo || {
    title: '',
    description: '',
    imageUrl: '',
    ctaText: 'Grab Now',
    deepLink: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 0,
    targetRole: 'ALL',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (promo) {
        await api.patch(`/api/v1/marketing/promotions/${promo._id}`, form);
      } else {
        await api.post('/api/v1/marketing/promotions', form);
      }
      onSave();
    } catch (e) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
      <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">{promo ? 'Update' : 'Initialize'} Promotion</h3>
            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Marketing Entity Calibration</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full transition-colors"><XCircle size={24} className="text-neutral-300" /></button>
        </div>

        <div className="p-10 grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="col-span-2">
            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Campaign Headline</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Narrative Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-brand-customer-red transition-all"
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Target Segment</label>
            <select
              value={form.targetRole}
              onChange={e => setForm({...form, targetRole: e.target.value})}
              className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all"
            >
              <option value="ALL">Omni-Channel</option>
              <option value="CUSTOMER">Customer Exclusive</option>
              <option value="PROVIDER">Provider Restricted</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Priority Weight</label>
            <input
              type="number"
              value={form.priority}
              onChange={e => setForm({...form, priority: parseInt(e.target.value)})}
              className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all"
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Deployment Date</label>
            <input
              type="date"
              value={form.startDate.split('T')[0]}
              onChange={e => setForm({...form, startDate: e.target.value})}
              className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all"
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Termination Date</label>
            <input
              type="date"
              value={form.endDate.split('T')[0]}
              onChange={e => setForm({...form, endDate: e.target.value})}
              className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-brand-customer-red transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Execution Link (DeepLink)</label>
            <input
              type="text"
              value={form.deepLink}
              onChange={e => setForm({...form, deepLink: e.target.value})}
              placeholder="piecejob://..."
              className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-brand-customer-red transition-all"
            />
          </div>
        </div>

        <div className="p-10 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 bg-white border border-neutral-200 text-neutral-500 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral-50 transition-all">Abort</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] bg-neutral-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all disabled:opacity-50"
          >
            {saving ? 'Persisting...' : 'Commit Marketing Entity'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TabSmall({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
    >
      {label}
    </button>
  );
}
