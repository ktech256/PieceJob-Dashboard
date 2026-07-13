"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  Mail,
  Settings,
  FileText,
  Activity,
  History,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search
} from 'lucide-react';

export default function EmailCentreHub() {
  const { countryCode } = useCountryStore();
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'logs' | 'analytics'>('config');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex gap-4 bg-white p-1 rounded-2xl border border-neutral-200 shadow-sm w-fit">
        {[
          { id: 'config', label: 'Sender Config', icon: Settings },
          { id: 'templates', label: 'Templates', icon: FileText },
          { id: 'logs', label: 'Queue Monitor', icon: History },
          { id: 'analytics', label: 'Analytics', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'config' && <SenderConfig countryCode={countryCode} />}
        {activeTab === 'templates' && <TemplateManagement countryCode={countryCode} />}
        {activeTab === 'logs' && <EmailQueueMonitor countryCode={countryCode} />}
        {activeTab === 'analytics' && <EmailAnalytics countryCode={countryCode} />}
      </div>
    </div>
  );
}

function SenderConfig({ countryCode }: { countryCode: string }) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [countryCode]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/email-centre/config?countryCode=${countryCode}`);
      setConfig(res.data.data);
    } catch (e) {
      console.error('Failed to load email config');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/v1/email-centre/config?countryCode=${countryCode}`, config);
      alert('Email configuration updated successfully');
    } catch (e) {
      alert('Failed to update email configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-neutral-400">Synchronizing with Mail Oracle...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-8">
        <section className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-neutral-900 text-white rounded-2xl"><Settings size={20} /></div>
               <h3 className="font-black uppercase text-sm tracking-tight">Global Sender Protocol</h3>
            </div>
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-200">
               <span className="text-[10px] font-black uppercase text-neutral-400">Email System</span>
               <button
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                  className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${config.enabled ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-neutral-200 text-neutral-500'}`}
               >
                  {config.enabled ? 'Enabled' : 'Disabled'}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">From Name</label>
              <input
                type="text"
                value={config.fromName}
                onChange={e => setConfig({...config, fromName: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black outline-none focus:border-neutral-900 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">From Email</label>
              <input
                type="email"
                value={config.fromEmail}
                onChange={e => setConfig({...config, fromEmail: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black outline-none focus:border-neutral-900 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Reply-To Email</label>
              <input
                type="email"
                value={config.replyTo || ''}
                onChange={e => setConfig({...config, replyTo: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black outline-none focus:border-neutral-900 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">SMTP Provider</label>
              <select
                value={config.smtpProvider}
                onChange={e => setConfig({...config, smtpProvider: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all"
              >
                <option value="SMTP">Custom SMTP</option>
                <option value="SENDGRID">SendGrid</option>
                <option value="MAILGUN">MailGun</option>
                <option value="SES">Amazon SES</option>
                <option value="OFF">Disabled</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-neutral-100">
             <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">SMTP Authentication</h4>
             <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">SMTP Host</label>
                  <input
                    type="text"
                    value={config.smtpHost || ''}
                    onChange={e => setConfig({...config, smtpHost: e.target.value})}
                    placeholder="smtp.example.com"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">SMTP Port</label>
                  <input
                    type="number"
                    value={config.smtpPort || ''}
                    onChange={e => setConfig({...config, smtpPort: parseInt(e.target.value)})}
                    placeholder="587"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
                <div className="flex items-end pb-1">
                   <button
                      onClick={() => setConfig({...config, smtpSecure: !config.smtpSecure})}
                      className={`w-full py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${config.smtpSecure ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-neutral-100 border-neutral-200 text-neutral-400'}`}
                   >
                      TLS/SSL Security: {config.smtpSecure ? 'ON' : 'OFF'}
                   </button>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">SMTP User</label>
                  <input
                    type="text"
                    value={config.smtpUser || ''}
                    onChange={e => setConfig({...config, smtpUser: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">SMTP Password</label>
                  <input
                    type="password"
                    value={config.smtpPass || ''}
                    onChange={e => setConfig({...config, smtpPass: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
             </div>
          </div>
        </section>

        <section className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm space-y-8">
           <div className="flex items-center gap-4 border-b border-neutral-100 pb-6">
              <div className="p-3 bg-neutral-900 text-white rounded-2xl"><Mail size={20} /></div>
              <h3 className="font-black uppercase text-sm tracking-tight">Email Signature & Branding</h3>
           </div>

           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">HTML Signature</label>
              <textarea
                value={config.emailSignature || ''}
                onChange={e => setConfig({...config, emailSignature: e.target.value})}
                rows={4}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-4 text-xs font-medium outline-none focus:border-neutral-900 transition-all resize-none"
              />
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Company Name</label>
                <input
                  type="text"
                  value={config.branding.companyName || ''}
                  onChange={e => setConfig({...config, branding: {...config.branding, companyName: e.target.value}})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Support Email</label>
                <input
                  type="email"
                  value={config.branding.supportEmail || ''}
                  onChange={e => setConfig({...config, branding: {...config.branding, supportEmail: e.target.value}})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                />
              </div>
           </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm space-y-6 sticky top-8">
           <h3 className="font-black uppercase text-sm tracking-tight border-b border-neutral-100 pb-4">Protocol Deployment</h3>

           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                 <div>
                    <p className="text-[10px] font-black uppercase">Configuration Node</p>
                    <p className="text-[10px] text-neutral-400 font-bold">{countryCode}</p>
                 </div>
                 <Save size={16} className="text-neutral-300" />
              </div>

              <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase text-neutral-400 px-2">Enabled Categories</p>
                 <div className="grid grid-cols-2 gap-2">
                    {Object.entries(config.enabledCategories).map(([cat, enabled]: any) => (
                      <button
                        key={cat}
                        onClick={() => setConfig({
                          ...config,
                          enabledCategories: { ...config.enabledCategories, [cat]: !enabled }
                        })}
                        className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase border transition-all flex items-center justify-between ${enabled ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-400 hover:border-neutral-300'}`}
                      >
                        {cat}
                        {enabled ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-brand-customer-red text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95 disabled:opacity-50"
           >
              {saving ? 'Processing...' : 'Apply System Changes'}
           </button>
        </section>
      </div>
    </div>
  );
}

function TemplateManagement({ countryCode }: { countryCode: string }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [countryCode]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/email-centre/templates?countryCode=${countryCode}`);
      setTemplates(res.data.data);
    } catch (e) {
      console.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.templateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
         <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
               type="text"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               placeholder="Search templates or categories..."
               className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-6 py-2.5 text-[10px] font-bold uppercase outline-none focus:border-neutral-900 transition-all"
            />
         </div>
         <button
            onClick={() => { setEditingTemplate(null); setShowModal(true); }}
            className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-neutral-200"
         >
            <Plus size={14} /> New Template
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-white border border-neutral-200 rounded-[32px] animate-pulse" />
          ))
        ) : filteredTemplates.map((template) => (
          <div key={template._id} className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
            <div className="p-8 space-y-4 flex-1">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[7px] font-black uppercase tracking-widest">{template.category}</span>
                    <h3 className="text-xs font-black uppercase tracking-tight text-neutral-900">{template.templateCode}</h3>
                 </div>
                 <div className="flex gap-1">
                    <button onClick={() => { setEditingTemplate(template); setShowModal(true); }} className="p-2 bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-900 transition-all"><Edit size={12} /></button>
                 </div>
              </div>

              <div className="space-y-2">
                 <p className="text-[9px] font-black uppercase text-neutral-400">Subject Line</p>
                 <p className="text-[10px] font-bold text-neutral-800 line-clamp-1">{template.subject || 'N/A'}</p>
              </div>

              <div className="space-y-2 pt-2">
                 <p className="text-[9px] font-black uppercase text-neutral-400">Placeholders</p>
                 <div className="flex flex-wrap gap-1">
                    {template.placeholders.slice(0, 4).map((p: string) => (
                       <span key={p} className="px-2 py-0.5 bg-neutral-50 text-neutral-400 border border-neutral-100 rounded text-[7px] font-bold">{"{{" + p + "}}"}</span>
                    ))}
                    {template.placeholders.length > 4 && <span className="text-[7px] font-bold text-neutral-300">+{template.placeholders.length - 4} more</span>}
                 </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
               <span className={`text-[8px] font-black uppercase ${template.active ? 'text-green-600' : 'text-neutral-400'}`}>{template.active ? 'Operational' : 'Inactive'}</span>
               <span className="text-[8px] font-bold text-neutral-400 uppercase">Version {template.version}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TemplateModal
          template={editingTemplate}
          countryCode={countryCode}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); loadTemplates(); }}
        />
      )}
    </div>
  );
}

function TemplateModal({ template, countryCode, onClose, onSave }: any) {
  const [form, setForm] = useState(template || {
    templateCode: '',
    channel: 'EMAIL',
    category: 'ACCOUNT',
    language: 'EN',
    subject: '',
    body: '',
    placeholders: [],
    countryCode: countryCode,
    active: true
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    if (!form.templateCode || !form.body) return alert('Code and Body required');
    setSaving(true);
    try {
      if (template) {
        await api.patch(`/api/v1/email-centre/templates/${template._id}`, form);
      } else {
        await api.post('/api/v1/email-centre/templates', form);
      }
      onSave();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
     if (template) {
        const res = await api.get(`/api/v1/email-centre/templates/${template._id}/preview`);
        setPreview(res.data.preview);
        setShowPreview(true);
     } else {
        // Simple client-side preview for new templates
        let body = form.body;
        form.placeholders.forEach((p: string) => {
           body = body.replace(new RegExp(`{{${p}}}`, 'g'), `[${p}]`);
        });
        setPreview(body);
        setShowPreview(true);
     }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 text-neutral-900">
      <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh] border border-neutral-200">
        <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">{template ? 'Modify' : 'Initialize'} Oracle Template</h3>
            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">System Channel: {form.channel} — {form.countryCode}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full transition-colors"><XCircle size={24} className="text-neutral-300" /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 p-10 space-y-6 overflow-y-auto border-r border-neutral-100 custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2 col-span-2">
                 <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Unique Template Code</label>
                 <input
                   type="text"
                   disabled={!!template}
                   value={form.templateCode}
                   onChange={e => setForm({...form, templateCode: e.target.value.toUpperCase()})}
                   placeholder="e.g. WELCOME_EMAIL"
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all disabled:opacity-50"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Category</label>
                 <select
                   value={form.category}
                   onChange={e => setForm({...form, category: e.target.value})}
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all"
                 >
                   {['ACCOUNT', 'CUSTOMER', 'PROVIDER', 'WALLET', 'REFERRAL', 'AFFILIATE', 'MARKETING', 'LEGAL', 'ADMIN'].map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                   ))}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Language</label>
                 <select
                   value={form.language}
                   onChange={e => setForm({...form, language: e.target.value})}
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all"
                 >
                   <option value="EN">English (Global)</option>
                   <option value="ZA">isiZulu (Regional)</option>
                 </select>
               </div>
               <div className="space-y-2 col-span-2">
                 <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Subject Line</label>
                 <input
                   type="text"
                   value={form.subject}
                   onChange={e => setForm({...form, subject: e.target.value})}
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                 />
               </div>
               <div className="space-y-2 col-span-2">
                 <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Allowed Placeholders (Comma Separated)</label>
                 <input
                   type="text"
                   value={form.placeholders.join(', ')}
                   onChange={e => setForm({...form, placeholders: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3 text-[10px] font-bold outline-none focus:border-neutral-900 transition-all"
                 />
               </div>
               <div className="space-y-2 col-span-2 pt-2">
                 <div className="flex items-center justify-between ml-1">
                    <label className="text-[9px] font-black uppercase text-neutral-400">Template HTML / Text Body</label>
                    <button onClick={handlePreview} className="text-[9px] font-black uppercase text-brand-customer-red hover:underline flex items-center gap-1"><Eye size={12} /> Live Preview</button>
                 </div>
                 <textarea
                   value={form.body}
                   onChange={e => setForm({...form, body: e.target.value})}
                   rows={10}
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-4 text-xs font-medium outline-none focus:border-neutral-900 transition-all resize-none font-mono"
                 />
               </div>
            </div>
          </div>
          <div className="w-1/2 bg-neutral-50 overflow-y-auto p-10 custom-scrollbar relative">
             {!showPreview ? (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-6 bg-white rounded-[32px] border border-neutral-200 text-neutral-300 shadow-sm"><FileText size={48} /></div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-neutral-400">Preview Engine Offline</p>
                     <p className="text-[9px] text-neutral-300 font-bold uppercase mt-1">Modifications pending dispatch to Oracle...</p>
                  </div>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                     <p className="text-[10px] font-black uppercase text-neutral-400">Oracle Simulation Output</p>
                     <button onClick={() => setShowPreview(false)} className="text-[9px] font-black uppercase text-neutral-400 hover:text-neutral-900 transition-all">Reset Engine</button>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-200 min-h-[400px]">
                     <div className="mb-8 pb-4 border-b border-neutral-100">
                        <p className="text-[8px] font-black uppercase text-neutral-300">Subject Target</p>
                        <p className="text-xs font-black uppercase text-neutral-900 mt-1">{form.subject || 'NO SUBJECT DEFINED'}</p>
                     </div>
                     <div className="prose prose-sm max-w-none text-neutral-700" dangerouslySetInnerHTML={{ __html: preview || '' }} />
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex gap-3">
                     <AlertCircle size={16} className="text-yellow-600 shrink-0" />
                     <p className="text-[9px] text-yellow-700 font-bold leading-relaxed">This simulation displays the body content only. Global headers, workspace logos, and footers will be injected dynamically at dispatch time based on the active Sender Configuration.</p>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="p-10 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 bg-white border border-neutral-200 text-neutral-500 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral-50 transition-all active:scale-95 shadow-sm">Abort</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] bg-neutral-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all disabled:opacity-50 active:scale-95 shadow-xl"
          >
            {saving ? 'Synchronizing Data Nodes...' : 'Commit Template Protocol'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailQueueMonitor({ countryCode }: { countryCode: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [countryCode, page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/email-centre/logs?countryCode=${countryCode}&page=${page}`);
      setLogs(res.data.data);
      setTotalPages(res.data.pages);
    } catch (e) {
      console.error('Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (id: string) => {
    try {
      await api.post(`/api/v1/email-centre/logs/${id}/resend`);
      alert('Resend protocol initiated');
      loadLogs();
    } catch (e) {
      alert('Resend failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-900 text-white rounded-xl"><History size={20} /></div>
            <div>
               <p className="text-xs font-black uppercase tracking-tight">Active Queue History</p>
               <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Real-time status of all workspace dispatch nodes</p>
            </div>
         </div>
         <button onClick={() => loadLogs()} className="p-3 bg-neutral-50 rounded-xl text-neutral-400 hover:text-neutral-900 transition-all"><RefreshCw size={16} /></button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50/50 border-b border-neutral-100">
            <tr>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-neutral-400 tracking-widest">Recipient</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-neutral-400 tracking-widest">Template / Code</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-neutral-400 tracking-widest">Status Node</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-neutral-400 tracking-widest">Dispatch Time</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-neutral-400 tracking-widest text-right">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {loading ? (
               Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16 bg-white" /></tr>
               ))
            ) : logs.length === 0 ? (
               <tr><td colSpan={5} className="px-8 py-20 text-center font-black uppercase text-neutral-300 text-[10px]">Queue cache is currently empty for this workspace</td></tr>
            ) : logs.map((log) => (
              <tr key={log._id} className="hover:bg-neutral-50/50 transition-colors group">
                <td className="px-8 py-6">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-neutral-900">{log.recipient}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-neutral-900">{log.templateCode}</span>
                      <span className="text-[8px] font-bold text-neutral-400 mt-1 line-clamp-1">{log.subject}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                      log.status === 'SENT' ? 'bg-green-100 text-green-700' :
                      log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-neutral-100 text-neutral-500'
                   }`}>
                      {log.status}
                   </span>
                </td>
                <td className="px-8 py-6 text-[10px] font-bold text-neutral-400">
                   {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-8 py-6 text-right">
                   <button
                      onClick={() => handleResend(log._id)}
                      className="p-2 bg-neutral-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 hover:bg-black transition-all shadow-lg"
                   >
                      Force Resend
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
         <div className="flex justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }).map((_, i) => (
               <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${page === i + 1 ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200' : 'bg-white border border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'}`}
               >
                  {i + 1}
               </button>
            ))}
         </div>
      )}
    </div>
  );
}

function EmailAnalytics({ countryCode }: { countryCode: string }) {
   const [stats, setStats] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadStats();
   }, [countryCode]);

   const loadStats = async () => {
      setLoading(true);
      try {
         const res = await api.get(`/api/v1/email-centre/analytics?countryCode=${countryCode}`);
         setStats(res.data.data);
      } catch (e) {
         console.error('Analytics fetch failed');
      } finally {
         setLoading(false);
      }
   };

   if (loading || !stats) return <div className="p-20 text-center animate-pulse font-black uppercase text-neutral-400">Synthesizing Analytics Matrix...</div>;

   return (
      <div className="space-y-8">
         <div className="grid grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm space-y-2">
               <p className="text-[9px] font-black uppercase text-neutral-400">Total System Dispatch</p>
               <h4 className="text-2xl font-black text-neutral-900">{stats.totalSent}</h4>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm space-y-2">
               <p className="text-[9px] font-black uppercase text-neutral-400">Transmission Failures</p>
               <h4 className="text-2xl font-black text-red-500">{stats.totalFailed}</h4>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm space-y-2">
               <p className="text-[9px] font-black uppercase text-neutral-400">Oracle Health Score</p>
               <h4 className="text-2xl font-black text-green-500">{(100 - (stats.totalFailed / (stats.totalSent + stats.totalFailed || 1) * 100)).toFixed(1)}%</h4>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm space-y-2">
               <p className="text-[9px] font-black uppercase text-neutral-400">Active Node</p>
               <h4 className="text-2xl font-black text-blue-500 uppercase">{countryCode}</h4>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[40px] border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-black uppercase mb-8 border-b border-neutral-100 pb-6 flex items-center gap-3"><Activity size={18} /> Daily Dispatch Flux (7D)</h3>
            <div className="h-64 flex items-end gap-2">
               {stats.dailyStats.map((day: any) => {
                  const max = Math.max(...stats.dailyStats.map((d: any) => d.sent + d.failed)) || 1;
                  return (
                     <div key={day._id} className="flex-1 flex flex-col items-center gap-3">
                        <div className="w-full space-y-1 flex flex-col items-center justify-end h-48">
                           <div
                              className="w-8 bg-neutral-900 rounded-t-lg transition-all hover:bg-black"
                              style={{ height: `${(day.sent / max) * 100}%` }}
                           />
                           <div
                              className="w-8 bg-red-400 rounded-b-lg"
                              style={{ height: `${(day.failed / max) * 100}%` }}
                           />
                        </div>
                        <p className="text-[8px] font-black uppercase text-neutral-400 rotate-45 mt-4">{day._id.split('-').slice(1).join('/')}</p>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
}
