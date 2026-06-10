"use client";

import Link from "next/link";
import { useState } from "react";
import { useCountryStore } from "@/lib/store/countryStore";
import {
  BarChart3,
  Wallet,
  Settings,
  ClipboardList,
  UserRound,
  ShieldCheck,
  MessageSquareWarning,
  BellRing,
  Map as MapIcon,
  ShieldAlert,
  History,
  LogOut,
  Globe,
  ChevronDown
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { countryCode, setCountryCode } = useCountryStore();

  const menuItems = [
    { name: "Analytics", href: "/analytics", icon: <BarChart3 size={18} /> },
    { name: "Finance", href: "/finance", icon: <Wallet size={18} /> },
    { name: "Pricing & Rules", href: "/pricing", icon: <Settings size={18} /> },
    { name: "Service Catalog", href: "/services", icon: <ClipboardList size={18} /> },
    { name: "Providers", href: "/providers", icon: <UserRound size={18} /> },
    { name: "Users", href: "/users", icon: <UserRound size={18} /> },
    { name: "Verifications", href: "/verification", icon: <ShieldCheck size={18} /> },
    { name: "Disputes", href: "/disputes", icon: <MessageSquareWarning size={18} /> },
    { name: "SOS Hub", href: "/sos", icon: <BellRing size={18} /> },
    { name: "Zones", href: "/zones", icon: <MapIcon size={18} /> },
    { name: "Fraud Monitoring", href: "/fraud", icon: <ShieldAlert size={18} /> },
    { name: "Audit Logs", href: "/audit", icon: <History size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-950 font-sans selection:bg-brand-customer-red/10">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col shadow-2xl relative z-40">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-customer-red rounded-2xl flex items-center justify-center shadow-lg shadow-brand-customer-red/20 rotate-3">
              <span className="font-black text-white italic text-xl">P</span>
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tighter uppercase leading-none">PieceJob</h1>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 text-neutral-400 hover:text-white transition-all text-sm font-black uppercase tracking-tighter group"
            >
              <span className="opacity-70 group-hover:opacity-100 group-hover:text-brand-customer-red transition-all">
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-neutral-950/50">
          <button className="flex items-center gap-3 w-full px-4 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={16} />
            Termination
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between px-10">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Logical Workspace Isolation</label>
                    <div className="relative">
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-customer-red transition-all appearance-none shadow-sm min-w-[220px]"
                        >
                            <option value="ZA">🇿🇦 South Africa (ZA)</option>
                            <option value="NA">🇳🇦 Namibia (NA)</option>
                            <option value="BW">🇧🇼 Botswana (BW)</option>
                            <option value="ZW">🇿🇼 Zimbabwe (ZW)</option>
                            <option value="GLOBAL">🌐 Global Overview</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                    </div>
                </div>

                <div className="flex flex-col">
                     <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Cross-Country Aggregator</label>
                     <button onClick={() => setCountryCode('GLOBAL')} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg group ${countryCode === 'GLOBAL' ? 'bg-brand-customer-red text-white' : 'bg-neutral-900 text-white hover:bg-black'}`}>
                        <Globe size={14} className="group-hover:text-white transition-colors" />
                        Global Overview
                     </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="w-px h-10 bg-neutral-100"></div>
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="flex flex-col items-end">
                        <p className="text-xs font-black uppercase text-neutral-900 tracking-tighter">Super Admin</p>
                        <p className="text-[10px] font-bold text-brand-customer-red uppercase tracking-widest">Master Clearance</p>
                    </div>
                    <div className="w-12 h-12 bg-neutral-100 rounded-[20px] border border-neutral-200 shadow-inner flex items-center justify-center text-neutral-300 group-hover:border-brand-customer-red transition-all">
                        <UserRound size={24} />
                    </div>
                </div>
            </div>
        </header>

        <div className="p-10 flex-1">
          {children}
        </div>

        <footer className="p-6 border-t bg-white flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-provider-green rounded-full animate-pulse"></div>
                    <span>API: OK</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-provider-green rounded-full animate-pulse"></div>
                    <span>SOCKET: ACTIVE</span>
                </div>
            </div>
            <p>© 2024 PieceJob Global WorkOS. V3.1 Locked.</p>
        </footer>
      </main>
    </div>
  );
}
