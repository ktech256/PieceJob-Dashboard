"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import {
    Shield,
    Globe,
    MessageSquare,
    Mail,
    Bell,
    Save,
    RefreshCcw,
    AlertCircle,
    CheckCircle2,
    Plus
} from 'lucide-react';

export default function IntegrationsSettings() {
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<any>(null);

    const loadIntegrations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/integrations');
            setIntegrations(res.data.data);
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to load integrations' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIntegrations();
    }, []);

    const handleUpdate = async (type: string, config: any, isActive: boolean) => {
        setSaving(true);
        try {
            await api.patch(`/api/admin/integrations/${type}`, { config, isActive });
            setMessage({ type: 'success', text: `${type} configuration updated successfully` });
            loadIntegrations();
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to update integration' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-20 text-center animate-pulse uppercase font-black text-xs">Synchronizing Core Infrastructure...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">System Integrations</h1>
                    <p className="text-neutral-500 font-medium">Manage API connections, external services, and communication protocols.</p>
                </div>
                <button onClick={loadIntegrations} className="p-3 bg-white border rounded-2xl hover:bg-neutral-50 transition-all shadow-sm">
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* GOOGLE MAPS */}
                <IntegrationCard
                    title="Google Maps Platform"
                    type="GOOGLE_MAPS"
                    icon={<Globe className="text-blue-600" />}
                    description="Core geospatial engine for address selection, tracking, and distance calculation."
                    currentConfig={integrations.find(i => i.type === 'GOOGLE_MAPS')?.config || {}}
                    onSave={handleUpdate}
                    tabs={[
                        {
                            id: 'android',
                            label: 'Android API Keys',
                            fields: [
                                { key: 'android.mapsApiKey', label: 'Maps SDK for Android', placeholder: 'AIza...' },
                                { key: 'android.placesApiKey', label: 'Places API', placeholder: 'AIza...' },
                                { key: 'android.directionsApiKey', label: 'Directions API', placeholder: 'AIza...' },
                                { key: 'android.geocodingApiKey', label: 'Geocoding API', placeholder: 'AIza...' }
                            ]
                        },
                        {
                            id: 'dashboard',
                            label: 'Dashboard API Keys',
                            fields: [
                                { key: 'dashboard.mapsJavascriptApiKey', label: 'Google Maps JavaScript API', placeholder: 'AIza...' },
                                { key: 'dashboard.placesApiKey', label: 'Places API (Web)', placeholder: 'AIza...' },
                                { key: 'dashboard.geocodingApiKey', label: 'Geocoding API', placeholder: 'AIza...' },
                                { key: 'dashboard.directionsApiKey', label: 'Directions API', placeholder: 'AIza...' }
                            ]
                        }
                    ]}
                />

                {/* FIREBASE */}
                <IntegrationCard
                    title="Firebase & Cloud Messaging"
                    type="FIREBASE"
                    icon={<Bell className="text-orange-500" />}
                    description="Identity, push notifications, and asset storage management."
                    currentConfig={integrations.find(i => i.type === 'FIREBASE')?.config || {}}
                    onSave={handleUpdate}
                    readOnly
                    fields={[
                        { key: 'PROJECT_ID', label: 'Project ID', placeholder: 'piecejob-...' },
                        { key: 'STORAGE_BUCKET', label: 'Storage Bucket', placeholder: 'piecejob.appspot.com' },
                        { key: 'MESSAGING_SENDER_ID', label: 'Messaging Sender ID', placeholder: '2886...' }
                    ]}
                />

                {/* COMMUNICATION */}
                <IntegrationCard
                    title="Communication Gateways"
                    type="SMS"
                    icon={<MessageSquare className="text-purple-600" />}
                    description="Providers for SMS, OTP verification, and Email delivery."
                    currentConfig={integrations.find(i => i.type === 'SMS')?.config || {}}
                    onSave={handleUpdate}
                    fields={[
                        { key: 'SMS_PROVIDER', label: 'SMS Provider', placeholder: 'Twilio / BulkSMS' },
                        { key: 'OTP_PROVIDER', label: 'OTP Engine', placeholder: 'Firebase / custom' },
                        { key: 'EMAIL_PROVIDER', label: 'SMTP Provider', placeholder: 'SendGrid / AWS SES' }
                    ]}
                />

                {/* FUTURE PLACEHOLDER */}
                <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-[40px] p-10 flex flex-col items-center justify-center text-center gap-4 opacity-60">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-neutral-100 shadow-sm">
                        <Plus size={24} className="text-neutral-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase text-neutral-400">Provision Future API</h3>
                        <p className="text-sm text-neutral-400 max-w-[280px]">Insurance, Fleet, or custom AI integrations can be mapped here without code changes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function IntegrationCard({ title, type, icon, description, fields, currentConfig, onSave, readOnly = false, tabs }: any) {
    const [config, setConfig] = useState(currentConfig);
    const [isActive, setIsActive] = useState(true);
    const [activeTab, setActiveTab] = useState(tabs ? tabs[0].id : null);

    const handleFieldChange = (path: string, value: string) => {
        const keys = path.split('.');
        const newConfig = { ...config };
        let current = newConfig;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setConfig(newConfig);
    };

    const getFieldValue = (path: string) => {
        const keys = path.split('.');
        let current = config;
        for (const key of keys) {
            if (!current || typeof current !== 'object') return '';
            current = current[key];
        }
        return current || '';
    };

    const currentFields = tabs
        ? tabs.find((t: any) => t.id === activeTab)?.fields || []
        : fields;

    return (
        <div className="bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm flex flex-col justify-between hover:border-neutral-900/10 transition-all">
            <div>
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">{icon}</div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
                            <p className="text-xs font-bold text-neutral-400">{type} Protocol</p>
                        </div>
                    </div>
                    {!readOnly && (
                         <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-100">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Live</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         </div>
                    )}
                </div>

                <p className="text-sm text-neutral-500 leading-relaxed mb-8">{description}</p>

                {tabs && (
                    <div className="flex gap-2 mb-8 bg-neutral-50 p-1.5 rounded-2xl border border-neutral-100">
                        {tabs.map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white shadow-sm border border-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="space-y-6">
                    {currentFields.map((field: any) => (
                        <div key={field.key} className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">{field.label}</label>
                            <input
                                type="password"
                                value={getFieldValue(field.key)}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                readOnly={readOnly}
                                placeholder={field.placeholder}
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {!readOnly && (
                <div className="mt-10 pt-10 border-t border-neutral-50">
                    <button
                        onClick={() => onSave(type, config, isActive)}
                        className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
                    >
                        <Save size={14} />
                        Update Integration State
                    </button>
                </div>
            )}
        </div>
    );
}
