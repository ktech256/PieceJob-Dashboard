"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import {
  DollarSign,
  Map,
  Clock,
  Zap,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Plus,
  RefreshCcw,
  Trash2,
  Edit,
  Save,
  Search,
  Play
} from 'lucide-react';

export default function PricingManagement() {
  const [activeTab, setActiveTab] = useState("country");
  const { countryCode } = useCountryStore();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/api/admin/settings?countryCode=${countryCode}`);
        setSettings(res.data.settings);
    } catch (e) {
        console.error('Failed to load settings');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (countryCode) loadSettings();
  }, [countryCode]);

  return (
    <div className="space-y-8 text-neutral-900 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Pricing Command Center</h1>
          <p className="text-neutral-500 font-medium">Configure global rules, regional surcharges, and service fee tiers for {countryCode}.</p>
        </div>
        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-2xl border border-neutral-200 shadow-inner">
            <TabButton active={activeTab === "country"} onClick={() => setActiveTab("country")} label="Country" />
            <TabButton active={activeTab === "rules"} onClick={() => setActiveTab("rules")} label="Service & Zone Rules" />
            <TabButton active={activeTab === "service-fee"} onClick={() => setActiveTab("service-fee")} label="Service Fees" />
            <TabButton active={activeTab === "pricebot"} onClick={() => setActiveTab("pricebot")} label="PriceBot AI" />
            <TabButton active={activeTab === "simulate"} onClick={() => setActiveTab("simulate")} label="Simulate" />
        </div>
      </div>

      {loading ? (
          <div className="py-20 text-center text-xs font-bold text-neutral-300 uppercase tracking-widest animate-pulse">Establishing Secure Neural Link with Pricing Engine...</div>
      ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "country" && <CountryPricingSettings settings={settings} onSave={loadSettings} />}
            {activeTab === "rules" && <PricingRulesManager />}
            {activeTab === "service-fee" && <ServiceFeeManager />}
            {activeTab === "pricebot" && <PriceBotPanel />}
            {activeTab === "simulate" && <PriceSimulationTool />}
          </div>
      )}
    </div>
  );
}

function CountryPricingSettings({ settings, onSave }: { settings: any, onSave: () => void }) {
    const [formData, setFormData] = useState(settings);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/api/admin/settings', formData);
            onSave();
            alert('Settings updated successfully');
        } catch (e) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* 4.1 – COUNTRY PRICING */}
                <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                    <h3 className="font-black text-lg uppercase tracking-tight mb-8 flex items-center gap-2">
                        <DollarSign className="text-brand-customer-red" />
                        Base Country Pricing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Booking Fee" name="bookingFee" value={formData.bookingFee} onChange={handleChange} suffix={formData.currencyCode} />
                        <InputGroup label="Platform Fee" name="platformFee" value={formData.platformFee} onChange={handleChange} suffix={formData.currencyCode} />
                        <InputGroup label="Minimum Charge" name="minimumCharge" value={formData.minimumCharge} onChange={handleChange} suffix={formData.currencyCode} />
                        <InputGroup label="Callout Fee" name="calloutFee" value={formData.calloutFee} onChange={handleChange} suffix={formData.currencyCode} />
                        <InputGroup label="Cancellation Fee" name="cancellationFee" value={formData.cancellationFee} onChange={handleChange} suffix={formData.currencyCode} />
                        <InputGroup label="Service Fee (%)" name="platformServiceFeePercent" value={formData.platformServiceFeePercent} onChange={handleChange} suffix="%" />
                    </div>
                </div>

                {/* Currency & Tax */}
                <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                    <h3 className="font-black text-lg uppercase tracking-tight mb-8 flex items-center gap-2">
                        <Settings2 className="text-neutral-500" />
                        Taxation Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Tax Name" name="taxName" value={formData.taxName} onChange={handleChange} placeholder="VAT, GST..." />
                        <InputGroup label="Tax Percentage" name="taxPercentage" value={formData.taxPercentage} onChange={handleChange} suffix="%" />
                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <input type="checkbox" name="isTaxInclusive" checked={formData.isTaxInclusive} onChange={handleChange} className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                            <label className="text-xs font-black text-neutral-800 uppercase">Inclusive of Tax</label>
                        </div>
                    </div>
                </div>

                {/* 4.4 – TIME PRICING */}
                <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white shadow-xl col-span-full">
                    <h3 className="font-black text-lg uppercase tracking-tight mb-8 flex items-center gap-2">
                        <Clock className="text-brand-customer-red" />
                        Time Surcharge Engine
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <ToggleGroup label="Night Surcharge" name="nightFeeEnabled" checked={formData.nightFeeEnabled} onChange={handleChange} />
                            <InputGroupDark label="Night Percentage" name="nightFeePercentage" value={formData.nightFeePercentage} onChange={handleChange} suffix="%" />
                            <div className="grid grid-cols-2 gap-2">
                                <InputGroupDark label="Start" name="nightFeeStart" value={formData.nightFeeStart} onChange={handleChange} placeholder="22:00" />
                                <InputGroupDark label="End" name="nightFeeEnd" value={formData.nightFeeEnd} onChange={handleChange} placeholder="05:00" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <ToggleGroup label="Weekend Surcharge" name="weekendFeeEnabled" checked={formData.weekendFeeEnabled} onChange={handleChange} />
                            <InputGroupDark label="Weekend Percentage" name="weekendFeePercentage" value={formData.weekendFeePercentage} onChange={handleChange} suffix="%" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-neutral-900 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                    {saving ? 'Syncing Rules...' : 'Save Pricing Architecture'}
                </button>
            </div>
        </form>
    );
}

function PricingRulesManager() {
    const { countryCode } = useCountryStore();
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentRule, setCurrentRule] = useState<any>(null);

    const loadRules = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/pricing/rules?countryCode=${countryCode}`);
            setRules(res.data.rules);
        } catch (e) {
            console.error('Failed to load rules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRules();
    }, [countryCode]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this rule?')) return;
        try {
            await api.delete(`/api/admin/pricing/rules/${id}`);
            loadRules();
        } catch (e) {
            alert('Delete failed');
        }
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const obj = Object.fromEntries(data.entries());
        try {
            if (currentRule?._id) {
                await api.patch(`/api/admin/pricing/rules/${currentRule._id}`, obj);
            } else {
                await api.post('/api/admin/pricing/rules', { ...obj, countryCode });
            }
            setShowModal(false);
            loadRules();
        } catch (e) {
            alert('Save failed');
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="font-black text-lg uppercase tracking-tight">Service & Zone Overrides</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Granular Pricing Control Hierarchy</p>
                </div>
                <button
                    onClick={() => { setCurrentRule(null); setShowModal(true); }}
                    className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-black transition-all"
                >
                    <Plus size={14} />
                    Add New Rule
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-[10px] uppercase font-black text-neutral-400 border-b border-neutral-100">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Level</th>
                            <th className="px-6 py-4">Context</th>
                            <th className="px-6 py-4 text-right">Base Price</th>
                            <th className="px-6 py-4 text-right">Surge</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-400">Scanning Pricing DB...</td></tr>
                        ) : rules.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-400 font-bold uppercase text-xs">No granular rules found for this workspace.</td></tr>
                        ) : (
                            rules.map((rule) => (
                                <tr key={rule._id} className="hover:bg-neutral-50/50 transition-all group">
                                    <td className="px-6 py-4 font-black text-neutral-800">{rule.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                            rule.level === 'ZONE' ? 'bg-purple-100 text-purple-700' :
                                            rule.level === 'SERVICE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>{rule.level}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-neutral-400">{rule.zoneId || rule.serviceCode || 'ALL'}</td>
                                    <td className="px-6 py-4 text-right font-black">{rule.basePrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-black text-brand-customer-red">{rule.surgeMultiplier}x</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => { setCurrentRule(rule); setShowModal(true); }} className="p-2 text-neutral-400 hover:text-neutral-900 transition-all"><Edit size={14} /></button>
                                            <button onClick={() => handleDelete(rule._id)} className="p-2 text-neutral-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-black uppercase mb-6">{currentRule ? 'Edit' : 'Create'} Pricing Rule</h3>
                        <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Rule Name</label>
                                <input name="name" defaultValue={currentRule?.name} required className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-neutral-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pricing Level</label>
                                <select name="level" defaultValue={currentRule?.level || 'SERVICE'} className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                                    <option value="COUNTRY">Country Wide</option>
                                    <option value="SERVICE">Specific Service</option>
                                    <option value="ZONE">Specific Zone</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Context ID (Zone or Service Code)</label>
                                <input name="contextId" defaultValue={currentRule?.zoneId || currentRule?.serviceCode} className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Base Price</label>
                                <input type="number" step="0.01" name="basePrice" defaultValue={currentRule?.basePrice || 0} className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Surge Multiplier</label>
                                <input type="number" step="0.1" name="surgeMultiplier" defaultValue={currentRule?.surgeMultiplier || 1.0} className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                            </div>
                            <div className="col-span-2 flex gap-4 mt-4">
                                <button type="submit" className="flex-1 bg-neutral-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Save Rule</button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 bg-neutral-100 text-neutral-600 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ServiceFeeManager() {
    const { countryCode } = useCountryStore();
    const [serviceFees, setServiceFees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadServiceFees = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/pricing/service-fees?countryCode=${countryCode}`);
            setServiceFees(res.data.rules);
        } catch (e) {
            console.error('Failed to load service fees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServiceFees();
    }, [countryCode]);

    const handleUpdate = async (tier: string, percentage: number) => {
        try {
            await api.post('/api/admin/pricing/service-fees', { countryCode, tier, serviceFeePercentage: percentage });
            loadServiceFees();
        } catch (e) {
            alert('Update failed');
        }
    };

    const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'ELITE'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {tiers.map((tier) => {
                const rule = serviceFees.find(c => c.tier === tier);
                return (
                    <div key={tier} className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm group hover:border-brand-provider-green/30 transition-all text-center">
                        <p className={`text-[10px] font-black px-3 py-1 rounded-full inline-block mb-4 ${
                            tier === 'ELITE' ? 'bg-neutral-900 text-white' :
                            tier === 'PLATINUM' ? 'bg-blue-100 text-blue-700' :
                            tier === 'GOLD' ? 'bg-yellow-100 text-yellow-700' :
                            tier === 'SILVER' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                        }`}>{tier}</p>
                        <div className="mb-6">
                            <input
                                type="number"
                                defaultValue={rule?.serviceFeePercentage || 15}
                                onBlur={(e) => handleUpdate(tier, parseFloat(e.target.value))}
                                className="text-4xl font-black text-neutral-900 bg-transparent text-center w-24 outline-none"
                            />
                            <span className="text-xl font-black text-neutral-400">%</span>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed">Service fee for {tier.toLowerCase()} tier providers.</p>
                    </div>
                );
            })}
        </div>
    );
}

function PriceBotPanel() {
    const { countryCode } = useCountryStore();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/api/admin/pricing/pricebot?countryCode=${countryCode}`);
                setSuggestions(res.data.suggestions);
            } catch (e) {} finally { setLoading(false); }
        };
        fetch();
    }, [countryCode]);

    return (
        <div className="bg-[#0A0A0A] rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_#410200_0%,_transparent_60%)]"></div>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-brand-customer-red rounded-[24px] text-white animate-pulse">
                            <Zap size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter">PriceBot AI Suggester</h3>
                            <p className="text-neutral-500 font-black uppercase tracking-[0.2em] text-xs">Autonomous Surge Intelligence (Section 321)</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {suggestions.length === 0 ? (
                        <div className="col-span-2 p-20 border-2 border-dashed border-white/10 rounded-[40px] text-center">
                            <p className="text-neutral-500 font-black uppercase text-xs tracking-widest">No active surge suggestions. Market equilibrium stable.</p>
                        </div>
                    ) : (
                        suggestions.map((s) => (
                            <div key={s._id} className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="bg-brand-customer-red text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">{s.demandLevel} Demand</span>
                                    <p className="text-2xl font-black text-brand-customer-red">+{((s.suggestedMultiplier - 1) * 100).toFixed(0)}%</p>
                                </div>
                                <p className="text-sm font-bold text-neutral-300 mb-8">{s.reason}</p>
                                <div className="flex gap-4">
                                    <button className="flex-1 bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-neutral-200 transition-all">Accept Surcharge</button>
                                    <button className="flex-1 bg-white/10 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all">Dismiss</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>
    );
}

function PriceSimulationTool() {
    const { countryCode } = useCountryStore();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runSimulation = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData(e.target);
        const q = new URLSearchParams(data as any).toString();
        try {
            const res = await api.get(`/api/admin/pricing/simulate?countryCode=${countryCode}&${q}`);
            setResult(res.data.breakdown);
        } catch (e) {
            alert('Simulation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="font-black text-lg uppercase tracking-tight mb-8">Simulation Config</h3>
                <form onSubmit={runSimulation} className="space-y-6">
                    <InputGroup label="Service Code" name="serviceCode" defaultValue="HDS-CLEAN" placeholder="e.g. HDS-CLEAN" />
                    <InputGroup label="Zone ID (Optional)" name="zoneId" placeholder="e.g. 65c..." />
                    <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <input type="checkbox" name="isEmergency" className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                        <label className="text-xs font-black text-neutral-800 uppercase">Emergency Job</label>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Play size={16} />
                        {loading ? 'Calculating...' : 'Run Simulation'}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 bg-neutral-50 border border-neutral-200 rounded-[32px] p-10 relative overflow-hidden">
                {result ? (
                    <div className="relative z-10 animate-in fade-in slide-in-from-right-8">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Projected Total</h4>
                                <p className="text-6xl font-black text-neutral-900">{result.currency} {result.totalAmount.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-brand-customer-red uppercase mb-1">Active Surge</p>
                                <p className="text-2xl font-black text-brand-customer-red">{result.surgeMultiplier}x</p>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-neutral-200 pt-8">
                            <SimRow label="Base Price" value={result.basePrice} cur={result.currency} />
                            {result.surcharges.map((s: any) => (
                                <SimRow key={s.type} label={`${s.type} Surcharge`} value={s.amount} cur={result.currency} highlight />
                            ))}
                            <SimRow label="Booking Fee" value={result.bookingFee} cur={result.currency} />
                            <SimRow label="Platform Fee" value={result.platformFee} cur={result.currency} />
                            <SimRow label="Tax Amount" value={result.taxAmount} cur={result.currency} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-300 py-20">
                        <Play size={64} className="mb-4 opacity-20" />
                        <p className="font-black uppercase text-xs tracking-widest">Awaiting Simulation Parameters</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SimRow({ label, value, cur, highlight }: { label: string, value: number, cur: string, highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</span>
            <span className={`text-sm font-black ${highlight ? 'text-brand-customer-red' : 'text-neutral-900'}`}>{cur} {value.toFixed(2)}</span>
        </div>
    )
}

function InputGroup({ label, name, value, defaultValue, onChange, placeholder, suffix }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-100 focus-within:border-neutral-900 transition-all">
                <input
                    name={name}
                    type={typeof (value || defaultValue) === 'number' ? 'number' : 'text'}
                    step="0.01"
                    value={value}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="bg-transparent font-black text-sm outline-none w-full"
                />
                {suffix && <span className="text-[10px] font-black text-neutral-300 uppercase">{suffix}</span>}
            </div>
        </div>
    );
}

function InputGroupDark({ label, name, value, onChange, placeholder, suffix }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{label}</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5 focus-within:border-white/20 transition-all">
                <input
                    name={name}
                    type={typeof value === 'number' ? 'number' : 'text'}
                    step="0.01"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="bg-transparent font-black text-sm outline-none w-full text-white"
                />
                {suffix && <span className="text-[10px] font-black text-neutral-600 uppercase">{suffix}</span>}
            </div>
        </div>
    );
}

function ToggleGroup({ label, name, checked, onChange }: any) {
    return (
        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">{label}</p>
            <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-customer-red"></div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${
                active ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-400 hover:text-neutral-700'
            }`}
        >
            {label}
        </button>
    )
}
