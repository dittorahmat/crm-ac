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
  Wrench, 
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
  X
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
    { id: "dashboard", label: "Dashboard & Metrik", icon: BarChart3 },
    { id: "customers", label: "Aset & Customer B2B", icon: Building2 },
    { id: "tags", label: "Barcode Tom & Jerry", icon: QrCode },
    { id: "schedules", label: "Penjadwalan Teknisi", icon: CalendarClock },
    { id: "service_flow", label: "Tracking Lapangan (Real-time)", icon: ClipboardCheck },
    { id: "invoices", label: "Faktur & Email PDF", icon: FileText },
    { id: "reminders", label: "Pengingat WhatsApp", icon: Bell },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white">KoolSync CRM</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 no-print`}
      >
        <div className="p-6 border-b border-slate-800/80 hidden md:flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              KoolSync
            </h1>
            <p className="text-[11px] text-teal-400 font-medium">B2B AC Management</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
            <span className="inline-block text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {user.role}
            </span>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-slate-950" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Barcode Quick Scan Action */}
        <div className="p-3 mx-3 mb-3 bg-teal-950/30 border border-teal-500/30 rounded-xl">
          <button
            onClick={() => {
              setInspectingTag("AC-MSF-SRV-01");
              setActiveTab("unit_detail");
            }}
            className="w-full flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-teal-200 transition-colors"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>Simulasi Scan Barcode AC</span>
          </button>
        </div>

        {/* Bottom Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950 min-h-screen">
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
