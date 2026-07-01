"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  ShieldAlert,
  Globe,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Lock,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Settings,
  X
} from 'lucide-react';

export default function SystemManagement() {
  const [activeTab, setActiveTab] = useState("workspaces");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">System Governance</h1>
          <p className="text-neutral-500 font-medium">Manage country workspaces, administrative roles, and infrastructure security.</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 shadow-inner">
            <TabButton active={activeTab === "workspaces"} onClick={() => setActiveTab("workspaces")} label="Workspaces" />
            <TabButton active={activeTab === "admins"} onClick={() => setActiveTab("admins")} label="Admin Access" />
        </div>
      </div>

      {activeTab === "workspaces" && <WorkspaceManager />}
      {activeTab === "admins" && <AdminAccessManager />}
    </div>
  );
}

function WorkspaceManager() {
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<any>(null);

    const loadWorkspaces = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/countries');
            setWorkspaces(res.data.countries || []);
        } catch (e) {
            console.error('Failed to load workspaces');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadWorkspaces(); }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const obj = Object.fromEntries(data.entries());
        try {
            if (editingWorkspace) {
                await api.patch(`/api/admin/countries/${editingWorkspace._id}`, obj);
            } else {
                await api.post('/api/admin/countries', obj);
            }
            setShowForm(false);
            setEditingWorkspace(null);
            loadWorkspaces();
        } catch (e) {
            alert('Operation failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-neutral-400 uppercase font-black text-xs tracking-widest">Scanning Global Infrastructure...</div>
                ) : workspaces.map(w => (
                    <div key={w._id} className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm group hover:border-brand-customer-red/20 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-neutral-50 rounded-2xl text-2xl">{w.flagEmoji || '🌐'}</div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${w.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{w.isActive ? 'Active' : 'Suspended'}</span>
                        </div>
                        <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight">{w.name}</h3>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">ISO: {w.code} | {w.currency} ({w.currencySymbol}) | {w.timezone}</p>

                        <div className="mt-8 pt-6 border-t border-neutral-50 flex justify-between items-center">
                            <button
                                onClick={() => { setEditingWorkspace(w); setShowForm(true); }}
                                className="text-[10px] font-black uppercase text-neutral-400 hover:text-neutral-900 transition-all"
                            >
                                Edit Config
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditingWorkspace(w); setShowForm(true); }}
                                    className="p-2 bg-neutral-50 rounded-xl text-neutral-400 hover:text-brand-customer-red transition-all"
                                >
                                    <Edit size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => { setEditingWorkspace(null); setShowForm(true); }}
                    className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-all min-h-[250px]"
                >
                    <Plus size={32} />
                    <span className="text-xs font-black uppercase tracking-widest">Deploy New Workspace</span>
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b bg-neutral-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">{editingWorkspace ? 'Update' : 'Deploy'} Country Node</h3>
                                <p className="text-[10px] font-black text-neutral-400 uppercase mt-1">Authorized Super-Admin Provisioning Only</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><X size={24} className="text-neutral-300" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Country Name" name="name" defaultValue={editingWorkspace?.name} placeholder="e.g. South Africa" required />
                                <Input label="ISO Code" name="code" defaultValue={editingWorkspace?.code} placeholder="e.g. ZA" required />
                                <Input label="Currency Code" name="currency" defaultValue={editingWorkspace?.currency} placeholder="e.g. ZAR" required />
                                <Input label="Currency Symbol" name="currencySymbol" defaultValue={editingWorkspace?.currencySymbol} placeholder="e.g. R" required />
                                <Input label="Timezone" name="timezone" defaultValue={editingWorkspace?.timezone} placeholder="e.g. Africa/Johannesburg" required />
                                <Input label="Flag Emoji" name="flagEmoji" defaultValue={editingWorkspace?.flagEmoji} placeholder="🇿🇦" />
                                <Input label="Language" name="language" defaultValue={editingWorkspace?.language || 'en'} placeholder="en" />
                                <Input label="Locale" name="locale" defaultValue={editingWorkspace?.locale || 'en-ZA'} placeholder="en-ZA" />
                            </div>
                            <button type="submit" className="w-full bg-neutral-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">
                                {editingWorkspace ? 'Update Workspace' : 'Provision Workspace'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="w-full text-neutral-400 font-black uppercase text-[10px] tracking-widest hover:text-neutral-900">Cancel Deployment</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function AdminAccessManager() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const loadAdmins = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/management/admins');
            setAdmins(res.data.admins || []);
        } catch (e) {
            console.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAdmins(); }, []);

    const handleCreate = async (e: any) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const obj = Object.fromEntries(data.entries());
        try {
            await api.post('/api/admin/management/admins', obj);
            setShowForm(false);
            loadAdmins();
            alert('Admin Provisioned Successfully');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Provisioning failed');
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-[40px] overflow-hidden shadow-sm flex flex-col">
            <div className="p-8 border-b bg-neutral-50/30 flex justify-between items-center">
                <div>
                    <h3 className="font-black text-lg uppercase tracking-tight">Administrative Clearance Registry</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Manage RBAC permissions and workspace assignments</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                >
                    <Plus size={16} />
                    New Admin Account
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-8 py-5">Admin Identity</th>
                            <th className="px-8 py-5">Assigned Role</th>
                            <th className="px-8 py-5">Workspace</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm font-bold">
                        {loading ? (
                             <tr><td colSpan={5} className="py-20 text-center text-neutral-300 uppercase tracking-widest text-xs">Scanning Admin Records...</td></tr>
                        ) : admins.map(admin => (
                            <tr key={admin._id} className="hover:bg-neutral-50/50 transition-all">
                                <td className="px-8 py-5">
                                    <p className="text-neutral-900">{admin.firstName} {admin.lastName}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">{admin.email}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-[10px] font-black bg-neutral-100 px-2 py-0.5 rounded uppercase">{admin.role.replace('_', ' ')}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-[10px] font-black text-neutral-600">{admin.countryCode}</span>
                                </td>
                                <td className="px-8 py-5">
                                    {admin.isBanned ? (
                                        <span className="text-red-600 flex items-center gap-1 text-[10px] uppercase"><XCircle size={12} /> Banned</span>
                                    ) : (
                                        <span className="text-green-600 flex items-center gap-1 text-[10px] uppercase"><CheckCircle2 size={12} /> Verified</span>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-2 bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-900 transition-all shadow-sm"><Edit size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b bg-neutral-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Provision Admin Identity</h3>
                                <p className="text-[10px] font-black text-neutral-400 uppercase mt-1">Assign roles and workspace clearance.</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><X size={24} className="text-neutral-300" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="First Name" name="firstName" required />
                                <Input label="Last Name" name="lastName" required />
                                <Input label="Email Address" type="email" name="email" required />
                                <Input label="Phone Number" name="phoneNumber" required />
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Role Assignment</label>
                                    <select name="role" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none appearance-none focus:ring-1 focus:ring-neutral-900 transition-all">
                                        <option value="COUNTRY_ADMIN">Country Admin</option>
                                        <option value="FINANCE_ADMIN">Finance Admin</option>
                                        <option value="VERIFICATION_ADMIN">Verification Admin</option>
                                        <option value="SUPPORT_ADMIN">Support Admin</option>
                                        <option value="READ_ONLY_ADMIN">Read Only Admin</option>
                                    </select>
                                </div>
                                <Input label="Target Workspace" name="countryCode" placeholder="e.g. ZA" required />
                                <div className="col-span-2">
                                    <Input label="Temporary Password" type="password" name="password" required />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-neutral-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">
                                Authorize Administrator
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="w-full text-neutral-400 font-black uppercase text-[10px] tracking-widest hover:text-neutral-900">Abort Request</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${
                active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}

function Input({ label, type = "text", ...props }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">{label}</label>
            <input
                type={type}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none ring-1 ring-transparent focus:ring-neutral-900 transition-all"
                {...props}
            />
        </div>
    )
}
