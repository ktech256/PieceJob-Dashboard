import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { name: "Analytics", href: "/analytics" },
    { name: "Finance", href: "/finance" },
    { name: "Pricing & Rules", href: "/pricing" },
    { name: "Service Catalog", href: "/services" },
    { name: "Providers", href: "/providers" },
    { name: "Users", href: "/users" },
    { name: "Verifications", href: "/verification" },
    { name: "Disputes", href: "/disputes" },
    { name: "SOS Hub", href: "/sos" },
    { name: "Zones", href: "/zones" },
    { name: "Fraud Monitoring", href: "/fraud" },
    { name: "Audit Logs", href: "/audit" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black tracking-tighter">PIECEJOB ADMIN</h1>

          {/* SECTION 16: Country Workspace Switcher */}
          <div className="mt-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Active Workspace</label>
            <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs w-full outline-none focus:border-brand-customer-red transition-colors">
                <option value="ZA">🇿🇦 South Africa</option>
                <option value="NA">🇳🇦 Namibia</option>
                <option value="BW">🇧🇼 Botswana</option>
                <option value="ZW">🇿🇼 Zimbabwe</option>
            </select>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
