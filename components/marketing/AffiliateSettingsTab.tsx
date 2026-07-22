"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api/axios';
import { ShieldCheck, Save, RefreshCcw, Info } from 'lucide-react';

export default function AffiliateSettingsTab({ countryCode }: { countryCode: string }) {
    const [settings, setSettings] = useState({
        referralRewardCustomer: 10,
        referralRewardProvider: 20,
        referralRewardBusiness: 50,
        referralMaxRewardsPerUser: 5,
        referralMinCompletedJobs: 1,
        referralProgramEnabled: true,
        referralRewardDelayDays: 0,
        referralExpiryDays: 0,
        minimumWithdrawalAmount: 50
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/marketing/affiliate/settings?countryCode=${countryCode}`);
            setSettings(res.data.data);
        } catch (e) {
            console.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, [countryCode]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/api/v1/marketing/affiliate/settings', {
                ...settings,
                countryCode
            });
            alert('Settings updated successfully');
        } catch (e) {
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <RefreshCcw className="animate-spin text-neutral-300" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Loading protocol configuration...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white border border-neutral-200 rounded-[40px] p-12 shadow-xl space-y-12">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-brand-customer-red/10 text-brand-customer-red rounded-2xl"><ShieldCheck size={32} /></div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-neutral-900">Affiliate Commission Logic</h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Workspace: {countryCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSettings({...settings, referralProgramEnabled: !settings.referralProgramEnabled})}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.referralProgramEnabled ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-neutral-200 text-neutral-400'}`}
                    >
                        {settings.referralProgramEnabled ? 'Active Protocol' : 'Protocol Suspended'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 border-b pb-4">Reward Matrix (Per Job)</h4>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Customer Referral Reward (R)</label>
                            <input
                                type="number"
                                value={settings.referralRewardCustomer}
                                onChange={e => setSettings({...settings, referralRewardCustomer: parseFloat(e.target.value)})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Provider Referral Reward (R)</label>
                            <input
                                type="number"
                                value={settings.referralRewardProvider}
                                onChange={e => setSettings({...settings, referralRewardProvider: parseFloat(e.target.value)})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Business Referral Reward (R)</label>
                            <input
                                type="number"
                                value={settings.referralRewardBusiness}
                                onChange={e => setSettings({...settings, referralRewardBusiness: parseFloat(e.target.value)})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 border-b pb-4">Lifecycle Constraints</h4>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Maximum Rewardable Jobs</label>
                            <input
                                type="number"
                                value={settings.referralMaxRewardsPerUser}
                                onChange={e => setSettings({...settings, referralMaxRewardsPerUser: parseInt(e.target.value)})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Min. Jobs for Initial Reward</label>
                            <input
                                type="number"
                                value={settings.referralMinCompletedJobs}
                                onChange={e => setSettings({...settings, referralMinCompletedJobs: parseInt(e.target.value)})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Payout Delay (Days)</label>
                            <input
                                type="number"
                                value={settings.referralRewardDelayDays}
                                onChange={e => setSettings({...settings, referralRewardDelayDays: parseInt(e.target.value)})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Referral Expiry (Days)</label>
                            <input
                                type="number"
                                value={settings.referralExpiryDays}
                                onChange={e => setSettings({...settings, referralExpiryDays: parseInt(e.target.value)})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Minimum Withdrawal Amount (R)</label>
                            <input
                                type="number"
                                value={settings.minimumWithdrawalAmount}
                                onChange={e => setSettings({...settings, minimumWithdrawalAmount: parseFloat(e.target.value)})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-neutral-900 transition-all"
                            />
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 flex gap-4">
                            <Info size={20} className="text-neutral-400 flex-shrink-0" />
                            <p className="text-[10px] text-neutral-500 font-bold leading-relaxed uppercase">
                                Referral ownership persists indefinitely. Commission generation terminates automatically after the "Maximum Rewardable Jobs" threshold is reached for each referred signature.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-neutral-900 text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-neutral-200 disabled:opacity-50"
                    >
                        <Save size={18} /> {saving ? 'Securing Configuration...' : 'Commit Settings to Oracle'}
                    </button>
                </div>
            </div>
        </div>
    );
}
