"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import {
    CreditCard,
    Plus,
    RefreshCcw,
    Save,
    Trash2,
    CheckCircle2,
    XCircle,
    ArrowUp,
    ArrowDown,
    MapPin,
    Zap
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

import { useCountryStore } from '@/lib/store/countryStore';

export default function PaymentRoutingSettings() {
    const { countryCode } = useCountryStore();
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentProvider, setCurrentCategory] = useState<any>(null);

    const loadProviders = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/payment-providers?countryCode=${countryCode}`);
            setProviders(res.data.data);
        } catch (e) {
            console.error('Failed to load providers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (countryCode) loadProviders();
    }, [countryCode]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const payload = {
            ...data,
            isActive: data.isActive === 'on',
            priority: parseInt(data.priority as string) || 0,
            countryCode: countryCode, // Forced from workspace
            currency: (data.currency as string).trim().toUpperCase(),
        };

        try {
            if (currentProvider?._id) {
                await api.patch(`/api/admin/payment-providers/${currentProvider._id}`, payload);
            } else {
                await api.post('/api/admin/payment-providers', payload);
            }
            setShowModal(false);
            loadProviders();
        } catch (e) {
            alert('Failed to save provider');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Payment Routing Matrix</h1>
                    <p className="text-neutral-500 font-medium">Provision gateways, set redundancy priorities, and define country-level routing.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadProviders} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all shadow-sm"><RefreshCcw size={18} /></button>
                    <button
                        onClick={() => { setCurrentCategory(null); setShowModal(true); }}
                        className="bg-neutral-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                    >
                        <Plus size={16} />
                        Add Gateway
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {providers.map((p, index) => (
                    <div key={p._id} className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6 flex-1">
                            <div className="w-16 h-16 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black italic text-2xl">
                                {p.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black uppercase tracking-tighter">{p.name}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${p.environment === 'production' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                        {p.environment}
                                    </span>
                                    {index === 0 && (
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                                            <Zap size={8} /> Primary
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                                        <MapPin size={12} />
                                        {p.countryCode}
                                    </div>
                                    <div className="w-px h-3 bg-neutral-100"></div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                                        <CreditCard size={12} />
                                        {p.currency}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right mr-4">
                                <p className="text-[10px] font-black text-neutral-400 uppercase">Merchant ID</p>
                                <p className="text-xs font-mono font-bold text-neutral-900">{p.merchantId || 'N/A'}</p>
                            </div>

                            <button
                                onClick={() => { setCurrentCategory(p); setShowModal(true); }}
                                className="p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-all border border-neutral-100"
                            >
                                <CreditCard size={18} className="text-neutral-500" />
                            </button>

                            <button className={`p-4 rounded-2xl transition-all border ${p.isActive ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                {p.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* PROVISIONING MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">{currentProvider ? 'Modify Gateway' : 'Provision Gateway'}</h3>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Impact: Real-time Transaction Routing</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><XCircle size={24} className="text-neutral-300" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <FormGroup label="Provider Name" name="name" defaultValue={currentProvider?.name} required />
                                <FormGroup label="Provider Code (e.g. paystack)" name="code" defaultValue={currentProvider?.code} required />
                                <FormGroup label="Merchant ID" name="merchantId" defaultValue={currentProvider?.merchantId} />
                                <FormGroup label="Public Key" name="publicKey" defaultValue={currentProvider?.publicKey} />
                                <FormGroup label="Secret Key" name="secretKey" defaultValue={currentProvider?.secretKey} type="password" />
                                <FormGroup label="Webhook Secret" name="webhookSecret" defaultValue={currentProvider?.webhookSecret} type="password" />
                                <FormGroup label="ISO Country Code" name="countryCode" defaultValue={currentProvider?.countryCode || countryCode} required />
                                <FormGroup label="Currency (e.g. ZAR)" name="currency" defaultValue={currentProvider?.currency} required />
                                <FormGroup label="Priority (0=Highest)" name="priority" defaultValue={currentProvider?.priority} type="number" />
                                <SelectGroup label="Environment" name="environment" defaultValue={currentProvider?.environment} options={['sandbox', 'production']} />

                                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <input type="checkbox" name="isActive" defaultChecked={currentProvider ? currentProvider.isActive : true} className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                                    <label className="text-xs font-black text-neutral-800 uppercase">Provider Active</label>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-neutral-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                    Commit Routing Logic
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormGroup({ label, name, defaultValue, required, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">{label}</label>
            <input
                name={name}
                type={type}
                defaultValue={defaultValue}
                required={required}
                placeholder={placeholder}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
            />
        </div>
    );
}

function SelectGroup({ label, name, options, defaultValue }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">{label}</label>
            <select
                name={name}
                defaultValue={defaultValue}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-black outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all appearance-none"
            >
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                ))}
            </select>
        </div>
    );
}
