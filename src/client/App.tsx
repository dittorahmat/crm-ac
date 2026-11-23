import React, { useState, useEffect } from "react";
import { LoginPage } from "./pages/LoginPage";
import { CustomerAssetsView } from "./pages/CustomerAssetsView";
import { BarcodePrintView } from "./pages/BarcodePrintView";
import { ServiceScheduleView } from "./pages/ServiceScheduleView";
import { FieldTrackingView } from "./pages/FieldTrackingView";
import { InvoiceManagementView } from "./pages/InvoiceManagementView";
import { WhatsAppReminderView } from "./pages/WhatsAppReminderView";
import { AnalyticsDashboardView } from "./pages/AnalyticsDashboardView";
import { ACUnitDetailView } from "./pages/ACUnitDetailView";
import { 
  Building2, 
  QrCode, 
  CalendarClock, 
  ClipboardCheck, 
  FileText, 
  Bell, 
  BarChart3, 
  LogOut,
  User,
  Menu,
  X,
  Snowflake,
  ShieldAlert,
  Sparkles
} from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "customers" | "tags" | "schedules" | "service_flow" | "invoices" | "reminders" | "unit_detail"
  >("dashboard");
  const [inspectingTag, setInspectingTag] = useState<string>("AC-MSF-SRV-01");
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>({
    name: "Admin Operasional",
    email: "admin@koolsync.com",
    role: "admin",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/ac/")) {
      const tag = decodeURIComponent(path.replace("/ac/", ""));
      if (tag) {
        setInspectingTag(tag);
        setActiveTab("unit_detail");
      }
    }
  }, []);

  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={() =>
          setUser({
            name: "Admin Operasional",
            email: "admin@koolsync.com",
            role: "admin",
          })
        }
      />
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard Metrik", icon: BarChart3 },
    { id: "customers", label: "Aset & Customer B2B", icon: Building2 },
    { id: "tags", label: "Cetak Label Tom & Jerry", icon: QrCode },
    { id: "schedules", label: "Penjadwalan Teknisi", icon: CalendarClock },
    { id: "service_flow", label: "Tracking Lapangan (Real-time)", icon: ClipboardCheck },
    { id: "invoices", label: "Faktur & Tagihan PDF", icon: FileText },
    { id: "reminders", label: "Otomasi WhatsApp (3-6 Bulan)", icon: Bell },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#06090e] text-slate-100">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-[#090e17] border-b border-slate-800/80 p-4 flex items-center justify-between no-print sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm">KoolSync Enterprise</span>
            <span className="text-[10px] text-cyan-400 font-medium">B2B Commercial AC Service</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-72 bg-[#090e17] border-r border-slate-800/70 flex flex-col shrink-0 no-print z-40`}
      >
        <div className="p-6 border-b border-slate-800/60 hidden md:flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-cyan-400/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cold">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
              KoolSync
            </h1>
            <p className="text-[11px] text-cyan-400 font-semibold tracking-wide uppercase">Commercial AC CRM</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-3 bg-[#0d1522] rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-400">
                {user.role} • Cloudflare Edge
              </span>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all interactive-button ${
                  active
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-glow-cold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-slate-950 stroke-[2.5]" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Barcode Quick Scan Action */}
        <div className="p-4 mx-4 mb-3 bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/20 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Asset Passport</span>
          </div>
          <button
            onClick={() => {
              setInspectingTag("AC-MSF-SRV-01");
              setActiveTab("unit_detail");
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 interactive-button transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Simulasi Scan Barcode AC</span>
          </button>
        </div>

        {/* Bottom Logout */}
        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Semantic Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 bg-[#06090e] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {activeTab === "dashboard" && <AnalyticsDashboardView />}
          {activeTab === "customers" && (
            <CustomerAssetsView
              onInspectUnit={(tag) => {
                setInspectingTag(tag);
                setActiveTab("unit_detail");
              }}
            />
          )}
          {activeTab === "tags" && <BarcodePrintView />}
          {activeTab === "schedules" && <ServiceScheduleView />}
          {activeTab === "service_flow" && <FieldTrackingView />}
          {activeTab === "invoices" && <InvoiceManagementView />}
          {activeTab === "reminders" && <WhatsAppReminderView />}
          {activeTab === "unit_detail" && (
            <ACUnitDetailView
              assetTag={inspectingTag}
              onBack={() => setActiveTab("customers")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
