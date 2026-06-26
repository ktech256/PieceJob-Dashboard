"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import {
    ShieldAlert,
    RotateCcw,
    Clock,
    Lock,
    Eye,
    Save,
    RefreshCcw,
    ArrowRightLeft,
    AlertTriangle
} from 'lucide-react';

const formatDate = (date: string | Date) => {
    try {
        return new Date(date).toLocaleString();
    } catch (e) {
        return 'N/A';
    }
};

export default function KeyRotationCenter() {
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadIntegrations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/integrations');
            setIntegrations(res.data.data);
        } catch (e) {
            console.error('Failed to load integrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIntegrations();
    }, []);

    const handleRotate = async (type: string) => {
        if (!confirm(`Are you sure you want to rotate keys for ${type}? This will swap the active configuration with the backup.`)) return;
        try {
            await api.post(`/api/admin/integrations/${type}/rotate`);
            alert('Key rotation successful. New configuration is now live.');
            loadIntegrations();
        } catch (e) {
            alert('Rotation failed');
        }
    };

    if (loading) return <div className="py-20 text-center animate-pulse uppercase font-black text-xs">Accessing Secure Vault...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className="text-red-600" size={24} />
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Emergency Key Rotation</h1>
                    </div>
                    <p className="text-neutral-500 font-medium">Instantly swap or replace compromised credentials across the ecosystem.</p>
                </div>
                <button onClick={loadIntegrations} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all shadow-sm">
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[32px] flex items-start gap-4">
                <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20} />
                <div>
                    <p className="text-sm font-black text-orange-900 uppercase tracking-tight">Security Protocol Advisory</p>
                    <p className="text-xs text-orange-700/80 mt-1 font-medium leading-relaxed">
                        Key rotation should only be performed during compromise incidents or planned maintenance.
                        Always ensure the <strong>Backup Config</strong> contains a valid, tested alternative before swapping.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {integrations.map((int) => (
                    <div key={int._id} className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 mb-10">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black italic text-xl">
                                    {int.type.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{int.name}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                                            <Clock size={12} />
                                            Last Rotated: {int.lastRotationDate ? formatDate(int.lastRotationDate) : 'Never'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRotate(int.type)}
                                className="bg-red-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-red-100"
                            >
                                <ArrowRightLeft size={16} />
                                Trigger Emergency Swap
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <KeySlot title="Active Configuration" config={int.config} isActive />
                            <KeySlot title="Backup configuration" config={int.backupConfig} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function KeySlot({ title, config, isActive = false }: any) {
    const keys = Object.keys(config || {});
    return (
        <div className={`p-8 rounded-[32px] border ${isActive ? 'bg-neutral-50 border-neutral-900/10' : 'bg-white border-neutral-100'}`}>
            <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{title}</p>
                {isActive && (
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div> In Use
                    </span>
                )}
            </div>
            <div className="space-y-4">
                {keys.length > 0 ? keys.map(k => (
                    <div key={k} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-neutral-100/50">
                        <span className="text-[10px] font-bold text-neutral-500">{k}</span>
                        <span className="text-[10px] font-mono text-neutral-300">••••••••••••••••</span>
                    </div>
                )) : (
                    <p className="text-[10px] font-bold text-neutral-300 italic py-2">No configuration stored in this slot.</p>
                )}
            </div>
        </div>
    );
}
