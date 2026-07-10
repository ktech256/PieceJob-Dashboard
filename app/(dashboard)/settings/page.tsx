"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api/axios';
import { useCountryStore } from '../../../lib/store/countryStore';
import {
  Settings,
  Map,
  ShieldAlert,
  Percent,
  Save,
  RefreshCcw,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const { countryCode, currentCountry } = useCountryStore();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
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
    if (countryCode) fetchSettings();
  }, [countryCode]);

  if (loading) return <div className="py-20 text-center text-xs font-black uppercase">Loading Workspace Parameters...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">Workspace Control Center</h1>
          <p className="text-neutral-500 font-medium">Configure regional logic and parameters for {countryCode === 'GLOBAL' ? 'Global Defaults' : currentCountry?.name}.</p>
        </div>
        <button onClick={fetchSettings} className="bg-white border border-neutral-200 p-3 rounded-2xl hover:bg-neutral-50 transition-all shadow-sm">
            <RefreshCcw size={20} className="text-neutral-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SettingsCard
            title="Operational Radius"
            icon={<Map size={20} />}
            description="Geofencing and proximity thresholds."
          >
              <div className="space-y-4 mt-6">
                  <SettingRow label="Matching Radius" value={`${settings?.matchingRadiusKm} km`} />
                  <SettingRow label="SOS Alert Radius" value={`${settings?.sosAlertRadiusKm} km`} />
              </div>
          </SettingsCard>

          <SettingsCard
            title="Financial Logic"
            icon={<Percent size={20} />}
            description="Fee structures and cooling windows."
          >
              <div className="space-y-4 mt-6">
                  <SettingRow label="Service Fee" value={`${settings?.platformServiceFeePercent}%`} />
                  <SettingRow label="Escrow System" value={settings?.isEscrowEnabled ? 'ENABLED' : 'DISABLED'} highlight={settings?.isEscrowEnabled} />
                  <SettingRow label="Escrow Cooling" value={`${settings?.escrowCoolingPeriodHours} hours`} />
                  <SettingRow label="Currency" value={settings?.currency || 'USD'} />
              </div>
          </SettingsCard>

          <SettingsCard
            title="Safety & Risk"
            icon={<ShieldAlert size={20} />}
            description="Crisis management and fraud settings."
          >
              <div className="space-y-4 mt-6">
                  <SettingRow label="Provider Grace" value={`${settings?.cancellationGraceProviderSec} sec`} />
                  <SettingRow label="Customer Grace" value={`${settings?.cancellationGraceCustomerSec} sec`} />
                  <SettingRow label="Maintenance Mode" value={settings?.maintenanceMode ? 'ACTIVE' : 'OFF'} highlight={settings?.maintenanceMode} />
              </div>
          </SettingsCard>
      </div>

      <div className="bg-[#0A0A0A] rounded-[40px] p-10 text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-customer-red blur-[100px] opacity-20"></div>
          <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Regional Mutation Lock</h3>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Workspace changes propagate instantly to matching engine.</p>
          </div>
          <button className="bg-white text-black px-10 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
              <Save size={16} />
              Commit Changes
          </button>
      </div>
    </div>
  );
}

function SettingsCard({ title, icon, description, children }: { title: string, icon: React.ReactNode, description: string, children: React.ReactNode }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-neutral-50 rounded-2xl text-neutral-900 border border-neutral-100">{icon}</div>
                <div>
                    <h3 className="font-black uppercase tracking-tight text-sm">{title}</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{description}</p>
                </div>
            </div>
            {children}
        </div>
    )
}

function SettingRow({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-neutral-50 last:border-0">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">{label}</span>
            <span className={`text-sm font-black ${highlight ? 'text-brand-customer-red' : 'text-neutral-900'}`}>{value}</span>
        </div>
    )
}
