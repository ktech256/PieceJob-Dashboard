"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import {
    Activity,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCcw,
    Clock,
    Database,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';

export default function HealthMonitor() {
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHealth = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/integrations');
            setIntegrations(res.data.data);
        } catch (e) {
            console.error('Failed to load health status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHealth();
        const interval = setInterval(loadHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Integration Health Monitor</h1>
                    <p className="text-neutral-500 font-medium">Real-time status tracking for all ecosystem external dependencies.</p>
                </div>
                <button onClick={loadHealth} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all shadow-sm">
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {integrations.map((int) => (
                    <div key={int._id} className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                    int.health?.status === 'ONLINE' ? 'bg-green-50 text-green-600' :
                                    int.health?.status === 'WARNING' ? 'bg-orange-50 text-orange-600' :
                                    'bg-red-50 text-red-600'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        int.health?.status === 'ONLINE' ? 'bg-green-500 animate-pulse' :
                                        int.health?.status === 'WARNING' ? 'bg-orange-500' :
                                        'bg-red-500'
                                    }`}></div>
                                    {int.health?.status || 'UNKNOWN'}
                                </div>
                                <span className="bg-neutral-50 text-neutral-400 px-3 py-1 rounded-lg text-[9px] font-bold border border-neutral-100 uppercase">{int.type}</span>
                            </div>

                            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight mb-2">{int.name}</h3>
                            <p className="text-xs text-neutral-400 font-medium mb-6">Source: Dashboard Configuration</p>

                            <div className="space-y-4">
                                <HealthRow
                                    label="Last Success"
                                    value={int.health?.lastSuccess ? format(new Date(int.health.lastSuccess), 'HH:mm:ss, d MMM') : 'Never'}
                                    icon={<CheckCircle2 size={12} className="text-green-500" />}
                                />
                                <HealthRow
                                    label="Last Failure"
                                    value={int.health?.lastFailure ? format(new Date(int.health.lastFailure), 'HH:mm:ss, d MMM') : 'None'}
                                    icon={<XCircle size={12} className={int.health?.lastFailure ? "text-red-500" : "text-neutral-300"} />}
                                />
                            </div>
                        </div>

                        {int.health?.lastError && (
                            <div className="mt-6 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                                <p className="text-[10px] font-black text-red-600 uppercase mb-1 flex items-center gap-1.5">
                                    <AlertCircle size={10} /> Latest Error Message
                                </p>
                                <p className="text-[10px] font-bold text-red-400 leading-relaxed truncate">{int.health.lastError}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function HealthRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center bg-neutral-50/50 p-3 rounded-xl border border-neutral-100/50">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tight">{label}</span>
            </div>
            <span className="text-[10px] font-bold text-neutral-800">{value}</span>
        </div>
    );
}
