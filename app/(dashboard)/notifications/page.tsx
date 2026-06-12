"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api/axios';
import { useCountryStore } from '../../../lib/store/countryStore';
import {
  BellRing,
  Plus,
  Edit,
  Eye,
  Trash2,
  Save,
  X,
  Send,
  History,
  Languages,
  CheckCircle2,
  RefreshCcw,
  Smartphone,
  MessageSquare,
  Mail
} from 'lucide-react';

export default function NotificationCenter() {
  const { countryCode } = useCountryStore();
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/notification-templates?countryCode=${countryCode}`);
        setTemplates(res.data.templates || []);
    } catch (e) {
        console.error('Failed to load templates');
    } finally {
        setLoading(false);
    }
  };

  const loadLogs = async () => {
      setLoading(true);
      try {
          const res = await api.get(`/api/v1/notifications/logs?countryCode=${countryCode}`);
          setLogs(res.data.logs || []);
      } catch (e) {
          console.error('Failed to load logs');
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    if (countryCode) {
        if (activeTab === "templates") loadTemplates();
        else loadLogs();
    }
  }, [countryCode, activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (editingTemplate._id) {
            await api.patch(`/api/admin/notification-templates/${editingTemplate._id}`, editingTemplate);
        } else {
            await api.post(`/api/admin/notification-templates`, editingTemplate);
        }
        setIsModalOpen(false);
        loadTemplates();
    } catch (e) {
        alert('Save failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Notification Center</h1>
          <p className="text-neutral-500 font-medium">Manage multi-channel communication and monitor delivery.</p>
        </div>
        <div className="flex gap-4">
            <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
                <TabButton active={activeTab === "templates"} onClick={() => setActiveTab("templates")} label="Templates" />
                <TabButton active={activeTab === "logs"} onClick={() => setActiveTab("logs")} label="Delivery Logs" />
            </div>
            <button
              onClick={() => {
                  setEditingTemplate({ templateCode: '', channel: 'PUSH', language: 'EN', title: '', body: '', placeholders: [], countryCode });
                  setIsModalOpen(true);
              }}
              className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
            >
                <Plus size={16} />
                Create Template
            </button>
        </div>
      </div>

      {activeTab === "templates" ? (
          <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-8 border-b flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Communication Registry</h3>
                <button onClick={loadTemplates} className="p-2 hover:bg-neutral-100 rounded-xl transition-all"><RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b">
                        <tr>
                            <th className="px-8 py-4">Template Code</th>
                            <th className="px-8 py-4">Channel</th>
                            <th className="px-8 py-4">Region</th>
                            <th className="px-8 py-4">Version</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm">
                        {templates.length === 0 ? (
                            <tr><td colSpan={6} className="p-10 text-center text-neutral-400">No templates defined.</td></tr>
                        ) : (
                            templates.map((t) => (
                                <tr key={t._id} className="hover:bg-neutral-50/50 transition-all">
                                    <td className="px-8 py-5 font-black text-neutral-800">{t.templateCode}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            {t.channel === 'PUSH' ? <Smartphone size={14} className="text-blue-500" /> :
                                             t.channel === 'SMS' ? <MessageSquare size={14} className="text-green-500" /> :
                                             <Mail size={14} className="text-orange-500" />}
                                            <span className="text-[10px] font-black uppercase">{t.channel}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{t.countryCode} • {t.language}</td>
                                    <td className="px-8 py-5 font-mono text-xs">v{t.version}</td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${t.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {t.active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-2">
                                        <button onClick={() => { setEditingTemplate(t); setIsModalOpen(true); }} className="p-2 text-neutral-400 hover:text-neutral-900"><Edit size={16} /></button>
                                        <button className="p-2 text-neutral-400 hover:text-blue-600"><Eye size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
      ) : (
          <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
              <div className="p-8 border-b flex justify-between items-center bg-neutral-50/50">
                  <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400">Live Delivery Logs</h3>
                  <button onClick={loadLogs} className="p-2 hover:bg-neutral-100 rounded-xl transition-all"><RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /></button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b">
                          <tr>
                              <th className="px-8 py-4">Recipient</th>
                              <th className="px-8 py-4">Message</th>
                              <th className="px-8 py-4">Type</th>
                              <th className="px-8 py-4">Status</th>
                              <th className="px-8 py-4 text-right">Timestamp</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 text-sm">
                          {logs.length === 0 ? (
                              <tr><td colSpan={5} className="p-10 text-center text-neutral-400">No delivery logs found.</td></tr>
                          ) : (
                              logs.map((log) => (
                                  <tr key={log._id} className="hover:bg-neutral-50/50 transition-all">
                                      <td className="px-8 py-5 font-bold">
                                          {log.userId?.firstName} {log.userId?.lastName}
                                          <p className="text-[9px] text-neutral-400 uppercase tracking-tighter">{log.userId?.countryCode}</p>
                                      </td>
                                      <td className="px-8 py-5 max-w-md">
                                          <p className="font-black text-neutral-800 truncate">{log.title}</p>
                                          <p className="text-xs text-neutral-500 truncate">{log.body}</p>
                                      </td>
                                      <td className="px-8 py-5">
                                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-100 rounded">{log.type}</span>
                                      </td>
                                      <td className="px-8 py-5">
                                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                              log.status === 'SENT' ? 'bg-green-50 text-green-600' :
                                              log.status === 'FAILED' ? 'bg-red-50 text-red-600' :
                                              'bg-blue-50 text-blue-600'
                                          }`}>
                                              {log.status}
                                          </span>
                                      </td>
                                      <td className="px-8 py-5 text-right text-xs font-bold text-neutral-400 uppercase">
                                          {new Date(log.createdAt).toLocaleString()}
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
              <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="p-8 border-b flex justify-between items-center bg-neutral-50/50">
                      <div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-neutral-800">Template Architect</h3>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Configure Communication Logic</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Template Code</label>
                              <input
                                  value={editingTemplate.templateCode}
                                  onChange={e => setEditingTemplate({...editingTemplate, templateCode: e.target.value.toUpperCase()})}
                                  className="w-full bg-neutral-50 border rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-neutral-900 transition-all"
                                  placeholder="e.g. AUTH_OTP"
                                  required
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Channel</label>
                              <select
                                  value={editingTemplate.channel}
                                  onChange={e => setEditingTemplate({...editingTemplate, channel: e.target.value})}
                                  className="w-full bg-neutral-50 border rounded-2xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                              >
                                  <option value="PUSH">📱 Push Notification</option>
                                  <option value="SMS">💬 SMS Message</option>
                                  <option value="EMAIL">📧 Email Dispatch</option>
                              </select>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Title / Subject</label>
                          <input
                              value={editingTemplate.title}
                              onChange={e => setEditingTemplate({...editingTemplate, title: e.target.value})}
                              className="w-full bg-neutral-50 border rounded-2xl px-4 py-3 text-sm font-bold outline-none"
                              placeholder="e.g. Your verification code"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Body Content</label>
                          <textarea
                              value={editingTemplate.body}
                              onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})}
                              rows={4}
                              className="w-full bg-neutral-50 border rounded-2xl p-4 text-sm font-medium outline-none resize-none"
                              placeholder="Use {{variable}} for dynamic content"
                              required
                          />
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                          <div className="flex gap-2">
                              <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase tracking-tighter cursor-help" title="Dynamic variables available for this template">Variables: {"{{firstName}}, {{otp}}"}</span>
                          </div>
                          <div className="flex gap-3">
                              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase text-neutral-400 hover:text-neutral-900 transition-all">Discard</button>
                              <button type="submit" className="bg-neutral-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-black/10">
                                  <Save size={14} />
                                  Commit Template
                              </button>
                          </div>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}
