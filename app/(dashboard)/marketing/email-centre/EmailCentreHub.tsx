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
  Search,
  Copy,
  Archive,
  RotateCcw,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  ShieldCheck,
  Send,
  Check,
  X
} from 'lucide-react';

export default function EmailCentreHub() {
  const { countryCode } = useCountryStore();
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'logs' | 'analytics'>('config');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex gap-2">
            {[
            { id: 'config', label: 'Sender Config', icon: Settings },
            { id: 'templates', label: 'Template Asset Library', icon: FileText },
            { id: 'logs', label: 'Email Telemetry', icon: History },
            { id: 'analytics', label: 'Performance Matrix', icon: Activity },
            ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-200' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'}`}
            >
                <tab.icon size={16} />
                {tab.label}
            </button>
            ))}
        </div>
        <div className="px-6 py-2 bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${countryCode === 'GLOBAL' ? 'bg-blue-500' : 'bg-brand-customer-red'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Node: {countryCode}</span>
        </div>
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
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

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
      alert('Sender configuration updated successfully');
    } catch (e) {
      alert('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.get(`/api/v1/email-centre/config/test-smtp?countryCode=${countryCode}`);
      setTestResult(res.data.data);
    } catch (e: any) {
      setTestResult({ success: false, message: e.response?.data?.message || 'Connection timed out' });
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) return alert('Recipient address required');
    setSendingTest(true);
    try {
        await api.post(`/api/v1/email-centre/config/send-test?countryCode=${countryCode}`, { recipient: testEmail });
        alert('Diagnostic signal dispatched successfully');
    } catch (e) {
        alert('Transmission failure');
    } finally {
        setSendingTest(false);
    }
  };

  if (loading) return <div className="p-40 text-center animate-pulse font-black uppercase text-neutral-300 tracking-[0.2em]">Synchronizing with Workspace Oracle...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-neutral-900">
      <div className="xl:col-span-2 space-y-8">
        <section className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm space-y-10">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-8">
            <div className="flex items-center gap-5">
               <div className="p-4 bg-neutral-900 text-white rounded-3xl shadow-lg"><Settings size={24} /></div>
               <div>
                  <h3 className="font-black uppercase text-lg tracking-tight">Global Sender Protocol</h3>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Configure workspace-level SMTP and branding assets</p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-neutral-50 px-6 py-3 rounded-2xl border border-neutral-200">
               <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">System Status</span>
               <button
                  onClick={() => setConfig({...config, enabled: !config.enabled})}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${config.enabled ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-neutral-200 text-neutral-500'}`}
               >
                  {config.enabled ? <><CheckCircle size={14} /> Operational</> : <><XCircle size={14} /> Offline</>}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Friendly Sender Name</label>
              <input
                type="text"
                value={config.fromName}
                onChange={e => setConfig({...config, fromName: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-50 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">System Dispatch Email</label>
              <input
                type="email"
                value={config.fromEmail}
                onChange={e => setConfig({...config, fromEmail: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-50 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Reply-To Route</label>
              <input
                type="email"
                value={config.replyTo || ''}
                onChange={e => setConfig({...config, replyTo: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-50 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Provider Integration</label>
              <select
                value={config.smtpProvider}
                onChange={e => setConfig({...config, smtpProvider: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all appearance-none"
              >
                <option value="SMTP">Custom Enterprise SMTP</option>
                <option value="SENDGRID">Twilio SendGrid</option>
                <option value="MAILGUN">MailGun Oracle</option>
                <option value="SES">Amazon Simple Email (SES)</option>
                <option value="OFF">Transmission Disabled</option>
              </select>
            </div>
          </div>

          <div className="space-y-6 pt-10 border-t border-neutral-100">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-neutral-400">
                    <ShieldCheck size={18} />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Authentication Stack</h4>
                </div>
                <button
                    onClick={handleTestSmtp}
                    disabled={testing}
                    className="px-5 py-2.5 rounded-xl border border-neutral-200 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {testing ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} className="text-brand-customer-red" />} Run SMTP Diagnostic
                </button>
             </div>

             {testResult && (
                 <div className={`p-6 rounded-[32px] border-2 ${testResult.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'} animate-in zoom-in-95 duration-200 shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            {testResult.success ? <Check size={20} /> : <X size={20} />}
                            <p className="text-[11px] font-black uppercase tracking-widest">{testResult.message}</p>
                        </div>
                        {testResult.latency && <span className="px-3 py-1 bg-white/50 rounded-lg text-[9px] font-black">LATENCY: {testResult.latency}MS</span>}
                    </div>
                    {!testResult.success && testResult.error && <p className="text-[10px] font-bold mt-2 opacity-80 font-mono bg-white/20 p-3 rounded-xl">{testResult.error}</p>}
                 </div>
             )}

             <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">SMTP Target Host</label>
                  <input
                    type="text"
                    value={config.smtpHost || ''}
                    onChange={e => setConfig({...config, smtpHost: e.target.value})}
                    placeholder="e.g. email-smtp.us-east-1.amazonaws.com"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Port</label>
                  <input
                    type="number"
                    value={config.smtpPort || ''}
                    onChange={e => setConfig({...config, smtpPort: parseInt(e.target.value)})}
                    placeholder="587"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
                <div className="flex items-end pb-1">
                   <button
                      onClick={() => setConfig({...config, smtpSecure: !config.smtpSecure})}
                      className={`w-full py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${config.smtpSecure ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-neutral-100 border-neutral-200 text-neutral-400'}`}
                   >
                      Secure Connection (TLS/SSL): {config.smtpSecure ? 'ACTIVE' : 'DISABLED'}
                   </button>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">IAM / SMTP Username</label>
                  <input
                    type="text"
                    value={config.smtpUser || ''}
                    onChange={e => setConfig({...config, smtpUser: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Secret Access Key / Password</label>
                  <input
                    type="password"
                    value={config.smtpPass || ''}
                    onChange={e => setConfig({...config, smtpPass: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
             </div>
          </div>
        </section>

        <section className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm space-y-10">
           <div className="flex items-center gap-5 border-b border-neutral-100 pb-8">
              <div className="p-4 bg-neutral-900 text-white rounded-3xl shadow-lg"><Mail size={24} /></div>
              <div>
                <h3 className="font-black uppercase text-lg tracking-tight">Email Signature & Identity</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Global HTML wrapper assets and workspace logos</p>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">HTML Global Footer / Signature</label>
              <textarea
                value={config.emailSignature || ''}
                onChange={e => setConfig({...config, emailSignature: e.target.value})}
                rows={4}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-3xl px-6 py-5 text-xs font-medium outline-none focus:border-neutral-900 transition-all resize-none font-mono"
              />
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Company Registered Name</label>
                <input
                  type="text"
                  value={config.branding.companyName || ''}
                  onChange={e => setConfig({...config, branding: {...config.branding, companyName: e.target.value}})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Support Correspondence Email</label>
                <input
                  type="email"
                  value={config.branding.supportEmail || ''}
                  onChange={e => setConfig({...config, branding: {...config.branding, supportEmail: e.target.value}})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                />
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Workspace Logo Assets (URL)</label>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={config.branding.logoUrl || ''}
                        onChange={e => setConfig({...config, branding: {...config.branding, logoUrl: e.target.value}})}
                        className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                    />
                    <div className="w-16 h-14 bg-neutral-100 rounded-2xl border border-neutral-200 flex items-center justify-center overflow-hidden">
                        {config.branding.logoUrl ? <img src={config.branding.logoUrl} className="max-w-full max-h-full object-contain" /> : <Mail className="text-neutral-300" />}
                    </div>
                </div>
              </div>
           </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm space-y-8 sticky top-8">
           <div className="border-b border-neutral-100 pb-6">
                <h3 className="font-black uppercase text-sm tracking-widest">Protocol Deployment</h3>
                <p className="text-[9px] text-neutral-400 font-bold uppercase mt-1">Commit changes to the active workspace node</p>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-neutral-950 text-white rounded-3xl shadow-xl">
                 <div>
                    <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Configuration Target</p>
                    <p className="text-xs font-black uppercase tracking-tighter">{countryCode === 'GLOBAL' ? 'Master Oracle Node' : `Regional Node: ${countryCode}`}</p>
                 </div>
                 <ShieldCheck size={24} className="text-brand-customer-red" />
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase text-neutral-400 px-2 tracking-widest">Category Firewall</p>
                 <div className="grid grid-cols-2 gap-3">
                    {Object.entries(config.enabledCategories).map(([cat, enabled]: any) => (
                      <button
                        key={cat}
                        onClick={() => setConfig({
                          ...config,
                          enabledCategories: { ...config.enabledCategories, [cat]: !enabled }
                        })}
                        className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-between shadow-sm ${enabled ? 'bg-white border-neutral-900 text-neutral-900 hover:bg-neutral-50' : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:border-neutral-300 opacity-60'}`}
                      >
                        {cat}
                        {enabled ? <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-200" /> : <div className="w-2 h-2 rounded-full bg-neutral-300" />}
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-neutral-900 text-white h-16 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-2xl shadow-neutral-200 active:scale-95 disabled:opacity-50 mt-4"
           >
              {saving ? 'Processing Encryption...' : 'Apply System Changes'}
           </button>

           <div className="pt-10 border-t border-neutral-100 space-y-5">
                <div>
                    <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Send Test Signal</h4>
                    <p className="text-[8px] text-neutral-300 font-bold uppercase mt-1 ml-1">Validate end-to-end SMTP delivery</p>
                </div>
                <div className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                        <input
                            type="email"
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                            placeholder="recipient@example.com"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-12 pr-6 py-4 text-[11px] font-bold outline-none focus:border-neutral-900 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleSendTestEmail}
                        disabled={sendingTest || !testEmail}
                        className="w-full bg-brand-customer-red text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-red-50"
                    >
                        {sendingTest ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />} Dispatch Oracle Signal
                    </button>
                </div>
           </div>
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
  const [testRecipient, setTestRecipient] = useState('');
  const [testingCategory, setTestingCategory] = useState<string | null>(null);

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

  const handleCategoryTest = async (category: string) => {
    if (!testRecipient) return alert('Recipient address required for category bulk test');
    setTestingCategory(category);
    try {
        await api.post(`/api/v1/email-centre/config/send-category-test?countryCode=${countryCode}`, { recipient: testRecipient, category });
        alert(`Bulk Oracle signals dispatched for category: ${category}`);
    } catch (e) {
        alert('Bulk transmission failure');
    } finally {
        setTestingCategory(null);
    }
  };

  const handleDuplicate = async (id: string) => {
     try {
        await api.post(`/api/v1/email-centre/templates/${id}/duplicate`);
        loadTemplates();
        alert('Template cloned successfully');
     } catch (e) {
        alert('Cloning failed');
     }
  };

  const filteredTemplates = templates.filter(t =>
    t.templateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-neutral-900">
      <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm">
         <div className="flex items-center gap-10 flex-1">
            <div className="relative flex-1 max-w-xl">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Template Asset Library (Code, Subject, Category)..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-3xl pl-16 pr-8 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-50 transition-all shadow-inner"
                />
            </div>

            <div className="h-12 w-px bg-neutral-100" />

            <div className="flex items-center gap-6">
                <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-neutral-400 tracking-[0.2em] ml-1">Bulk Node Testing</p>
                    <div className="flex items-center gap-3">
                        <input
                            type="email"
                            value={testRecipient}
                            onChange={e => setTestRecipient(e.target.value)}
                            placeholder="test-recipient@domain.com"
                            className="bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-2.5 text-[10px] font-bold outline-none focus:border-neutral-900 w-56 transition-all"
                        />
                        <div className="flex gap-1.5">
                            {['ACCOUNT', 'CUSTOMER', 'PROVIDER', 'SECURITY'].map(cat => (
                                <button
                                    key={cat}
                                    disabled={!!testingCategory || !testRecipient}
                                    onClick={() => handleCategoryTest(cat)}
                                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${testingCategory === cat ? 'bg-brand-customer-red text-white animate-pulse' : 'bg-neutral-900 text-white hover:bg-black disabled:opacity-30'}`}
                                >
                                    {cat.slice(0, 4)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
         </div>
         <button
            onClick={() => { setEditingTemplate(null); setShowModal(true); }}
            className="bg-neutral-900 text-white px-8 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-black transition-all shadow-2xl shadow-neutral-200 active:scale-95 ml-10"
         >
            <Plus size={18} /> New Asset
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-white border border-neutral-100 rounded-[40px] animate-pulse" />
          ))
        ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full py-40 text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6"><Search size={32} className="text-neutral-300" /></div>
                <h3 className="text-lg font-black uppercase tracking-tighter">No assets found</h3>
                <p className="text-sm text-neutral-400 font-bold uppercase mt-2">Adjust your search criteria or create a new template</p>
            </div>
        ) : filteredTemplates.map((template) => (
          <div key={template._id} className="bg-white border border-neutral-200 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col h-full relative">
            {template.isFutureReady && (
                <div className="absolute top-6 left-6 z-10">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[7px] font-black uppercase tracking-widest border border-blue-100">Future Ready</span>
                </div>
            )}
            <div className="p-10 space-y-6 flex-1">
              <div className="flex justify-between items-start">
                 <div className="space-y-2">
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] ${
                        template.category === 'SECURITY' ? 'bg-red-50 text-red-600' :
                        template.category === 'ADMIN' ? 'bg-neutral-900 text-white' :
                        'bg-neutral-50 text-neutral-500'
                    }`}>{template.category}</span>
                    <h3 className="text-[13px] font-black uppercase tracking-tight text-neutral-900 line-clamp-1">{template.templateCode}</h3>
                 </div>
                 <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTemplate(template); setShowModal(true); }} className="p-2.5 bg-neutral-50 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"><Edit size={14} /></button>
                    <button onClick={() => handleDuplicate(template._id)} className="p-2.5 bg-neutral-50 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"><Copy size={14} /></button>
                    <button onClick={() => confirm('Archive this template asset?') && api.delete(`/api/v1/email-centre/templates/${template._id}`).then(loadTemplates)} className="p-2.5 bg-neutral-50 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all"><Archive size={14} /></button>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Subject Protocol</p>
                 <p className="text-[11px] font-bold text-neutral-800 line-clamp-2 leading-relaxed">{template.subject || 'NO SUBJECT DEFINED'}</p>
              </div>

              <div className="space-y-3 pt-2">
                 <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Active Placeholders</p>
                    <span className="text-[8px] font-black text-neutral-300">{template.placeholders?.length || 0} Total</span>
                 </div>
                 <div className="flex flex-wrap gap-1.5">
                    {template.placeholders?.slice(0, 4).map((p: string) => (
                       <span key={p} className="px-2 py-1 bg-neutral-50 text-neutral-500 border border-neutral-100 rounded-lg text-[8px] font-bold">{"{{" + p + "}}"}</span>
                    ))}
                    {template.placeholders?.length > 4 && <span className="text-[9px] font-black text-neutral-300 ml-1">+{template.placeholders.length - 4}</span>}
                 </div>
              </div>
            </div>
            <div className="px-10 py-5 bg-neutral-50/50 border-t border-neutral-100 flex justify-between items-center">
               <div className="flex items-center gap-3">
                    <button
                        onClick={() => api.patch(`/api/v1/email-centre/templates/${template._id}`, { active: !template.active }).then(loadTemplates)}
                        className={`w-3.5 h-3.5 rounded-full transition-all border-2 ${template.active ? 'bg-green-500 border-green-200 shadow-lg shadow-green-100' : 'bg-neutral-200 border-neutral-100'}`}
                    />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${template.active ? 'text-green-600' : 'text-neutral-400'}`}>{template.active ? 'Operational' : 'Hibernated'}</span>
               </div>
               <div className="flex items-center gap-4">
                    <div className="flex flex-col text-right">
                        <span className="text-[7px] font-black text-neutral-300 uppercase tracking-widest">Priority</span>
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-tighter">{template.priority || 'MEDIUM'}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[7px] font-black text-neutral-300 uppercase tracking-widest">Version</span>
                        <span className="text-[9px] font-black text-neutral-900 uppercase tracking-tighter">V{template.version}.0</span>
                    </div>
               </div>
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
    priority: 'MEDIUM',
    language: 'EN',
    subject: '',
    body: '',
    plainTextBody: '',
    placeholders: [],
    countryCode: countryCode,
    active: true,
    isFutureReady: false,
    attachmentSupport: false,
    pdfSupport: false,
    retryCount: 3
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTheme, setPreviewModeTheme] = useState<'light' | 'dark'>('light');
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const handleSave = async () => {
    if (!form.templateCode || !form.body) return alert('Operational parameters missing: Code and HTML Body required');
    setSaving(true);
    try {
      if (template) {
        await api.patch(`/api/v1/email-centre/templates/${template._id}`, form);
      } else {
        await api.post('/api/v1/email-centre/templates', form);
      }
      onSave();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Protocol save failure');
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
        let html = form.body;
        let text = form.plainTextBody;
        form.placeholders.forEach((p: string) => {
           const reg = new RegExp(`{{${p}}}`, 'g');
           html = html.replace(reg, `[TEST_${p.toUpperCase()}]`);
           if (text) text = text.replace(reg, `[TEST_${p.toUpperCase()}]`);
        });
        setPreview({ html, text, subject: form.subject });
        setShowPreview(true);
     }
  };

  const handleSendTest = async () => {
    if (!testRecipient) return alert('Enter destination address');
    setSendingTest(true);
    try {
        const mockData: Record<string, string> = {};
        form.placeholders.forEach((p: string) => {
            mockData[p] = `[OPERATIONAL_TEST_${p.toUpperCase()}]`;
        });

        await api.post(`/api/v1/email-centre/templates/${template?._id || 'new'}/send-test?countryCode=${countryCode}`, {
            recipient: testRecipient,
            templateCode: form.templateCode,
            mockData
        });
        alert('Test signal successfully dispatched to queue');
    } catch (e) {
        alert('Signal dispatch failure');
    } finally {
        setSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-12 text-neutral-900 overflow-hidden">
      <div className="bg-white rounded-[50px] w-full max-w-[95vw] h-full shadow-2xl overflow-hidden flex flex-col border border-neutral-100 animate-in zoom-in-95 duration-300">
        <div className="px-12 py-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-neutral-900 text-white rounded-3xl"><FileText size={28} /></div>
            <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{template ? 'Modify' : 'Initialize'} Oracle Template</h3>
                <p className="text-xs text-neutral-400 font-bold uppercase mt-1 tracking-widest">Protocol Version {form.version}.0 — Node: {form.countryCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-neutral-100 rounded-full transition-all group active:scale-90">
            <X size={32} className="text-neutral-300 group-hover:text-neutral-900" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[30%] p-12 space-y-8 overflow-y-auto border-r border-neutral-100 custom-scrollbar bg-white">
            <div className="grid grid-cols-1 gap-8">
               <div className="space-y-3">
                 <label className="text-[11px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Unique Protocol Code</label>
                 <input
                   type="text"
                   disabled={!!template}
                   value={form.templateCode}
                   onChange={e => setForm({...form, templateCode: e.target.value.toUpperCase()})}
                   placeholder="e.g. CORE_AUTH_SUCCESS"
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none focus:border-neutral-900 transition-all disabled:opacity-50 tracking-widest"
                 />
               </div>

               <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Category</label>
                        <select
                            value={form.category}
                            onChange={e => setForm({...form, category: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none focus:border-neutral-900 transition-all appearance-none"
                        >
                            {['ACCOUNT', 'CUSTOMER', 'PROVIDER', 'WALLET', 'REFERRAL', 'AFFILIATE', 'MARKETING', 'LEGAL', 'ADMIN', 'SECURITY'].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Priority</label>
                        <select
                            value={form.priority}
                            onChange={e => setForm({...form, priority: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none focus:border-neutral-900 transition-all appearance-none"
                        >
                            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[11px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Transmission Subject Line</label>
                 <input
                   type="text"
                   value={form.subject}
                   onChange={e => setForm({...form, subject: e.target.value})}
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all tracking-tight"
                 />
               </div>

               <div className="space-y-3">
                 <label className="text-[11px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Allowed Data Placeholders</label>
                 <input
                   type="text"
                   value={form.placeholders.join(', ')}
                   onChange={e => setForm({...form, placeholders: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                   placeholder="firstName, jobId, amount..."
                   className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-[10px] font-bold outline-none focus:border-neutral-900 transition-all font-mono"
                 />
               </div>

               <div className="pt-4 space-y-4 border-t border-neutral-50">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Transmission Rules</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setForm({...form, active: !form.active})}
                            className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase border transition-all flex items-center justify-between ${form.active ? 'bg-green-50 border-green-100 text-green-700' : 'bg-neutral-50 border-neutral-200 text-neutral-400'}`}
                        >
                            Operational {form.active ? <Check size={12}/> : <X size={12}/>}
                        </button>
                        <button
                            onClick={() => setForm({...form, isFutureReady: !form.isFutureReady})}
                            className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase border transition-all flex items-center justify-between ${form.isFutureReady ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-neutral-50 border-neutral-200 text-neutral-400'}`}
                        >
                            Future Ready {form.isFutureReady ? <Check size={12}/> : <X size={12}/>}
                        </button>
                        <button
                            onClick={() => setForm({...form, attachmentSupport: !form.attachmentSupport})}
                            className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase border transition-all flex items-center justify-between ${form.attachmentSupport ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-neutral-50 border-neutral-200 text-neutral-400'}`}
                        >
                            Attachments {form.attachmentSupport ? <Check size={12}/> : <X size={12}/>}
                        </button>
                        <button
                            onClick={() => setForm({...form, pdfSupport: !form.pdfSupport})}
                            className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase border transition-all flex items-center justify-between ${form.pdfSupport ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-neutral-50 border-neutral-200 text-neutral-400'}`}
                        >
                            PDF Generation {form.pdfSupport ? <Check size={12}/> : <X size={12}/>}
                        </button>
                    </div>
               </div>
            </div>
          </div>

          <div className="w-[40%] flex flex-col overflow-hidden bg-neutral-50/50">
             <div className="flex-1 p-12 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-[11px] font-black uppercase text-neutral-400 tracking-widest">Main HTML Body Protocol</label>
                        <span className="text-[8px] font-black text-neutral-300">UTF-8 ENCODED</span>
                    </div>
                    <textarea
                        value={form.body}
                        onChange={e => setForm({...form, body: e.target.value})}
                        rows={18}
                        className="w-full bg-white border border-neutral-200 rounded-[32px] px-8 py-8 text-xs font-medium outline-none focus:border-neutral-900 transition-all resize-none font-mono shadow-inner"
                    />
                </div>
                <div className="space-y-4 pt-6">
                    <label className="text-[11px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Plain Text Legacy Support</label>
                    <textarea
                        value={form.plainTextBody || ''}
                        onChange={e => setForm({...form, plainTextBody: e.target.value})}
                        rows={6}
                        className="w-full bg-white border border-neutral-200 rounded-[32px] px-8 py-8 text-xs font-medium outline-none focus:border-neutral-900 transition-all resize-none font-mono shadow-inner"
                    />
                </div>
             </div>
          </div>

          <div className="w-[30%] bg-neutral-900 p-12 flex flex-col overflow-hidden">
             <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                <p className="text-[11px] font-black uppercase text-neutral-500 tracking-[0.2em]">Oracle Simulation Output</p>
                <div className="flex gap-4">
                    <button onClick={() => setPreviewModeTheme('light')} className={`p-2 rounded-lg transition-all ${previewTheme === 'light' ? 'bg-white text-neutral-950 shadow-xl' : 'text-neutral-500 hover:text-white'}`}><Sun size={16} /></button>
                    <button onClick={() => setPreviewModeTheme('dark')} className={`p-2 rounded-lg transition-all ${previewTheme === 'dark' ? 'bg-white text-neutral-950 shadow-xl' : 'text-neutral-500 hover:text-white'}`}><Moon size={16} /></button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white text-neutral-950 shadow-xl' : 'text-neutral-500 hover:text-white'}`}><Monitor size={16} /></button>
                    <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white text-neutral-950 shadow-xl' : 'text-neutral-500 hover:text-white'}`}><Smartphone size={16} /></button>
                </div>
             </div>

             <div className="flex-1 flex justify-center items-start overflow-hidden pt-4">
                <div className={`transition-all duration-500 shadow-2xl overflow-hidden flex flex-col ${
                    previewMode === 'mobile' ? 'w-[320px] h-[568px] rounded-[40px] border-8 border-neutral-800' : 'w-full h-full rounded-2xl'
                } ${previewTheme === 'dark' ? 'bg-neutral-800' : 'bg-white'}`}>
                   {!showPreview ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-20">
                         <div className="p-8 bg-white/5 rounded-[40px] text-neutral-700"><RotateCcw size={48} className="animate-spin-slow" /></div>
                         <div>
                            <p className="text-[11px] font-black uppercase text-neutral-600 tracking-widest">Simulator Offline</p>
                            <button onClick={handlePreview} className="mt-4 text-xs font-black uppercase text-brand-customer-red hover:underline tracking-widest">Initialize Engine</button>
                         </div>
                      </div>
                   ) : (
                      <div className="h-full flex flex-col animate-in fade-in duration-500">
                         <div className={`p-6 border-b ${previewTheme === 'dark' ? 'border-white/5 bg-neutral-950/20' : 'border-neutral-50 bg-neutral-50/30'}`}>
                            <p className="text-[8px] font-black uppercase text-neutral-500 mb-1 tracking-widest">System Subject Target</p>
                            <p className={`text-[10px] font-black uppercase tracking-tight ${previewTheme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>{preview.subject || 'NO SUBJECT'}</p>
                         </div>
                         <div className={`flex-1 overflow-y-auto p-8 prose prose-sm max-w-none ${previewTheme === 'dark' ? 'prose-invert text-neutral-300' : 'text-neutral-700'}`} dangerouslySetInnerHTML={{ __html: preview.html || '' }} />
                         <div className={`p-6 border-t text-[8px] font-black uppercase tracking-widest text-center ${previewTheme === 'dark' ? 'border-white/5 text-neutral-600' : 'border-neutral-50 text-neutral-300'}`}>
                            Simulation mode: {previewMode} / {previewTheme}
                         </div>
                      </div>
                   )}
                </div>
             </div>

             <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
                <p className="text-[9px] font-black uppercase text-neutral-500 tracking-[0.2em]">Telemetry Validation</p>
                <button onClick={handlePreview} className="bg-white/5 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                    <RefreshCw size={14} /> Refresh Simulation
                </button>
             </div>
          </div>
        </div>

        <div className="px-12 py-10 border-t border-neutral-100 bg-white flex items-center justify-between gap-12">
          <div className="flex items-center gap-6 flex-1 max-w-xl">
             <div className="relative flex-1">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                <input
                    type="email"
                    value={testRecipient}
                    onChange={e => setTestRecipient(e.target.value)}
                    placeholder="Enter destination for trial transmission..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-14 pr-8 py-4 text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                />
             </div>
             <button
                onClick={handleSendTest}
                disabled={sendingTest || !testRecipient || !template}
                className="bg-neutral-900 text-white h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
             >
                {sendingTest ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />} Dispatch Test
             </button>
          </div>

          <div className="flex gap-4">
             <button onClick={onClose} className="bg-neutral-50 border border-neutral-100 text-neutral-400 h-16 px-12 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-neutral-100 hover:text-neutral-900 transition-all active:scale-95 shadow-sm">Abort</button>
             <button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-customer-red text-white h-16 px-16 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-red-700 transition-all disabled:opacity-50 active:scale-95 shadow-2xl shadow-red-100"
             >
                {saving ? 'Synchronizing Asset...' : 'Commit Protocol Auth'}
             </button>
          </div>
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
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    loadLogs();
  }, [countryCode, page, activeCategory]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/email-centre/logs?countryCode=${countryCode}&page=${page}&category=${activeCategory}`);
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
    <div className="space-y-8 text-neutral-900">
      <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-5">
                <div className="p-4 bg-neutral-900 text-white rounded-3xl shadow-lg"><History size={24} /></div>
                <div>
                   <p className="text-sm font-black uppercase tracking-tight">Active Queue History</p>
                   <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Real-time status of all workspace dispatch nodes</p>
                </div>
            </div>

            <div className="h-12 w-px bg-neutral-100" />

            <div className="flex gap-2">
                {['ALL', 'ACCOUNT', 'CUSTOMER', 'PROVIDER', 'WALLET', 'REFERRAL', 'AFFILIATE', 'ADMIN', 'SECURITY'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setPage(1); }}
                        className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-50 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
         </div>
         <button onClick={() => loadLogs()} className="p-4 bg-neutral-50 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all border border-neutral-100"><RefreshCw size={20} /></button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[40px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50/50 border-b border-neutral-100">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Recipient / Target</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Oracle Node / Code</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Status / Telemetry</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Dispatch Window</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] text-right">Emergency Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {loading ? (
               Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="h-20 bg-white" /></tr>
               ))
            ) : logs.length === 0 ? (
               <tr><td colSpan={5} className="px-10 py-40 text-center font-black uppercase text-neutral-300 text-xs tracking-[0.3em]">Queue cache is currently empty for this configuration</td></tr>
            ) : logs.map((log) => (
              <tr key={log._id} className="hover:bg-neutral-50/50 transition-colors group">
                <td className="px-10 py-8">
                   <div className="flex flex-col">
                      <span className="text-[12px] font-black text-neutral-900 tracking-tight">{log.recipient}</span>
                      <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest mt-1">TRANSACTION ID: {log._id.toUpperCase()}</span>
                   </div>
                </td>
                <td className="px-10 py-8">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black text-neutral-900 tracking-widest">{log.templateCode}</span>
                      <span className="text-[9px] font-bold text-neutral-400 mt-1.5 line-clamp-1 italic">"{log.subject}"</span>
                   </div>
                </td>
                <td className="px-10 py-8">
                   <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        log.status === 'SENT' ? 'bg-green-50 text-green-700' :
                        log.status === 'FAILED' ? 'bg-red-50 text-red-700' :
                        'bg-neutral-100 text-neutral-500'
                        }`}>
                        {log.status}
                        </span>
                        {log.status === 'FAILED' && log.errorMessage && (
                            <div className="group/err relative">
                                <AlertCircle size={16} className="text-red-400 cursor-help" />
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 hidden group-hover/err:block w-72 p-5 bg-neutral-950 text-white text-[10px] font-bold rounded-2xl z-50 shadow-2xl leading-relaxed">
                                    <div className="text-brand-customer-red mb-2 text-[8px] font-black tracking-widest uppercase">Stack Trace / Reason</div>
                                    {log.errorMessage}
                                </div>
                            </div>
                        )}
                   </div>
                </td>
                <td className="px-10 py-8">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-neutral-600">{new Date(log.createdAt).toLocaleString()}</span>
                        {log.sentAt && <span className="text-[8px] text-green-500 font-black uppercase mt-1 tracking-widest">Resolution: {Math.round((new Date(log.sentAt).getTime() - new Date(log.createdAt).getTime()) / 1000)}S</span>}
                    </div>
                </td>
                <td className="px-10 py-8 text-right">
                   <div className="flex justify-end gap-3">
                        {log.metadata?.pdfUrl && <button className="p-3 bg-neutral-100 text-neutral-400 rounded-xl hover:text-neutral-900 hover:bg-neutral-200 transition-all shadow-sm"><FileText size={16} /></button>}
                        <button
                            onClick={() => handleResend(log._id)}
                            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 hover:bg-black transition-all shadow-xl active:scale-95"
                        >
                            Resend Signal
                        </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
         <div className="flex justify-center gap-3 pt-10">
            {Array.from({ length: totalPages }).map((_, i) => (
               <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-14 h-14 rounded-2xl font-black text-[11px] transition-all shadow-sm ${page === i + 1 ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-200 active:scale-95' : 'bg-white border border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'}`}
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
         console.error('Analytics matrix fetch failed');
      } finally {
         setLoading(false);
      }
   };

   if (loading || !stats) return <div className="p-40 text-center animate-pulse font-black uppercase text-neutral-300 tracking-[0.2em]">Synthesizing Analytics Matrix...</div>;

   const score = (100 - (stats.totalFailed / (stats.totalSent + stats.totalFailed || 1) * 100)).toFixed(1);

   return (
      <div className="space-y-10 text-neutral-900">
         <div className="grid grid-cols-4 gap-8">
            <div className="bg-white p-10 rounded-[40px] border border-neutral-200 shadow-sm space-y-4">
               <div className="flex items-center justify-between text-neutral-300"><History size={24} /> <p className="text-[10px] font-black uppercase tracking-widest">Lifetime Dispatch</p></div>
               <h4 className="text-4xl font-black text-neutral-900 tracking-tighter">{stats.totalSent.toLocaleString()}</h4>
            </div>
            <div className="bg-white p-10 rounded-[40px] border border-neutral-200 shadow-sm space-y-4">
               <div className="flex items-center justify-between text-red-300"><AlertCircle size={24} /> <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Failures</p></div>
               <h4 className="text-4xl font-black text-red-500 tracking-tighter">{stats.totalFailed.toLocaleString()}</h4>
            </div>
            <div className="bg-white p-10 rounded-[40px] border border-neutral-200 shadow-sm space-y-4">
               <div className="flex items-center justify-between text-green-300"><ShieldCheck size={24} /> <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Health Score</p></div>
               <h4 className="text-4xl font-black text-green-600 tracking-tighter">{score}%</h4>
            </div>
            <div className="bg-white p-10 rounded-[40px] border border-neutral-200 shadow-sm space-y-4">
               <div className="flex items-center justify-between text-blue-300"><Activity size={24} /> <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Active Node</p></div>
               <h4 className="text-4xl font-black text-blue-500 uppercase tracking-tighter">{countryCode}</h4>
            </div>
         </div>

         <div className="bg-white p-12 rounded-[50px] border border-neutral-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-12 relative z-10">
               <div>
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-4"><Activity size={24} className="text-neutral-400" /> Daily Dispatch Flux (7D)</h3>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-2">Real-time volume metrics across the operational window</p>
               </div>
               <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neutral-900" /> <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Success</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /> <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Failure</span></div>
               </div>
            </div>
            <div className="h-80 flex items-end gap-5 relative z-10 px-4">
               {stats.dailyStats.map((day: any) => {
                  const total = day.sent + day.failed;
                  const max = Math.max(...stats.dailyStats.map((d: any) => d.sent + d.failed)) || 1;
                  return (
                     <div key={day._id} className="flex-1 flex flex-col items-center group">
                        <div className="w-full space-y-1.5 flex flex-col items-center justify-end h-64">
                           <div
                              className="w-12 bg-neutral-900 rounded-2xl transition-all hover:bg-black hover:scale-105 shadow-lg group-hover:shadow-neutral-200"
                              style={{ height: `${(day.sent / max) * 100}%` }}
                           />
                           {day.failed > 0 && (
                            <div
                                className="w-12 bg-red-400 rounded-2xl shadow-lg"
                                style={{ height: `${Math.max(10, (day.failed / max) * 100)}%` }}
                            />
                           )}
                        </div>
                        <p className="text-[9px] font-black uppercase text-neutral-400 mt-6 tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">{day._id.split('-').slice(1).join('/')}</p>
                     </div>
                  );
               })}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-50/50 via-transparent to-transparent pointer-events-none" />
         </div>
      </div>
   );
}
