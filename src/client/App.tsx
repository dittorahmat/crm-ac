import React, { useState, useEffect, lazy, Suspense } from "react";
import { LoginPage } from "./pages/LoginPage";
import { CustomerAssetsView } from "./pages/CustomerAssetsView";
import { BarcodePrintView } from "./pages/BarcodePrintView";
import { ServiceScheduleView } from "./pages/ServiceScheduleView";
import { FieldTrackingView } from "./pages/FieldTrackingView";
import { InvoiceManagementView } from "./pages/InvoiceManagementView";
import { WhatsAppReminderView } from "./pages/WhatsAppReminderView";
import { AnalyticsDashboardView } from "./pages/AnalyticsDashboardView";
import { ACUnitDetailView } from "./pages/ACUnitDetailView";
import { SystemSettingsView } from "./pages/SystemSettingsView";
import { parseAssetTagFromUrl } from "./lib/scanner";

const BarcodeScanModal = lazy(() =>
  import("./components/BarcodeScanModal").then((m) => ({ default: m.BarcodeScanModal }))
);
import { 
  Building2, 
  QrCode, 
  CalendarClock, 
  ClipboardCheck, 
  FileText, 
  Bell, 
  BarChart3, 
  Settings,
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
    "dashboard" | "customers" | "tags" | "schedules" | "service_flow" | "invoices" | "reminders" | "unit_detail" | "settings"
  >("dashboard");
  const [inspectingTag, setInspectingTag] = useState<string>("AC-MSF-SRV-01");
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  // Check initial deep-linked /ac/:assetTag URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/ac/")) {
      const tag = parseAssetTagFromUrl(path);
      if (tag) {
        setInspectingTag(tag);
        if (user?.role === "technician") {
          setActiveTab("service_flow");
        } else {
          setActiveTab("unit_detail");
        }
      }
    }
  }, [user]);

  const handleScannedTag = (rawText: string) => {
    const tag = parseAssetTagFromUrl(rawText);
    setInspectingTag(tag);
    window.history.pushState({}, "", `/ac/${encodeURIComponent(tag)}`);

    // Role-based routing: Technician directed to service flow with active unit, Admin to asset passport
    if (user?.role === "technician") {
      setActiveTab("service_flow");
    } else {
      setActiveTab("unit_detail");
    }
  };

  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={(userData) => {
          if (!userData || !userData.role) {
            console.error("Login attempt with invalid user payload rejected.");
            return;
          }
          setUser(userData);
          // Auto-direct technicians to field operational workflow
          if (userData.role === "technician") {
            setActiveTab("service_flow");
          } else {
            setActiveTab("dashboard");
          }
        }}
      />
    );
  }

  // Define full navigation items with RBAC roles
  const allNavItems = [
    { id: "dashboard", label: "Dashboard Metrik", icon: BarChart3, roles: ["admin"] },
    { id: "customers", label: "Aset & Customer B2B", icon: Building2, roles: ["admin"] },
    { id: "tags", label: "Cetak Label Tom & Jerry", icon: QrCode, roles: ["admin"] },
    { id: "schedules", label: "Penjadwalan Teknisi", icon: CalendarClock, roles: ["admin", "technician"] },
    { id: "service_flow", label: "Tracking Lapangan (Real-time)", icon: ClipboardCheck, roles: ["admin", "technician"] },
    { id: "invoices", label: "Faktur & Tagihan PDF", icon: FileText, roles: ["admin"] },
    { id: "reminders", label: "Otomasi WhatsApp (3-6 Bulan)", icon: Bell, roles: ["admin"] },
    { id: "settings", label: "Pengaturan Gateway", icon: Settings, roles: ["admin"] },
  ] as const;

  const currentRole = user.role === "technician" ? "technician" : "admin";
  const navItems = allNavItems.filter((item) => (item.roles as readonly string[]).includes(currentRole));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between no-print sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-slate-900 block text-sm">KoolSync Enterprise</span>
            <span className="text-[10px] text-blue-600 font-semibold">B2B Commercial AC Service</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi Menu Mobile"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? "fixed inset-y-0 left-0 z-50 shadow-2xl flex" : "hidden"
        } md:static md:flex md:shadow-none w-72 bg-white border-r border-slate-200 flex-col shrink-0 no-print`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <Snowflake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                KoolSync
              </h1>
              <p className="text-[11px] text-blue-600 font-bold tracking-wide uppercase">Commercial AC CRM</p>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Tutup menu navigasi"
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-mono font-semibold text-slate-500">
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
                    ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white stroke-[2.5]" : "text-slate-500"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Barcode Quick Scan Action */}
        <div className="p-4 mx-4 mb-3 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Digital Asset Passport</span>
          </div>
          <button
            onClick={() => setShowScanModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 border border-blue-700 text-xs font-bold text-white interactive-button transition-all shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Pindai Barcode / QR AC</span>
          </button>
        </div>

        {/* Bottom Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Barcode & QR Code Live Scanner Modal (Code-split via React.lazy) */}
      {showScanModal && (
        <Suspense fallback={null}>
          <BarcodeScanModal
            isOpen={showScanModal}
            onClose={() => setShowScanModal(false)}
            onSelectTag={handleScannedTag}
            userRole={currentRole}
          />
        </Suspense>
      )}

      {/* Semantic Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 pb-20 md:pb-6 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto wrap">
          {activeTab === "dashboard" && (currentRole === "admin" ? <AnalyticsDashboardView /> : <FieldTrackingView initialUnitTag={inspectingTag} />)}
          {activeTab === "customers" && (currentRole === "admin" ? (
            <CustomerAssetsView
              onInspectUnit={(tag) => {
                setInspectingTag(tag);
                setActiveTab("unit_detail");
              }}
            />
          ) : <FieldTrackingView initialUnitTag={inspectingTag} />)}
          {activeTab === "tags" && (currentRole === "admin" ? <BarcodePrintView /> : <FieldTrackingView initialUnitTag={inspectingTag} />)}
          {activeTab === "schedules" && <ServiceScheduleView />}
          {activeTab === "service_flow" && <FieldTrackingView initialUnitTag={inspectingTag} />}
          {activeTab === "invoices" && (currentRole === "admin" ? <InvoiceManagementView /> : <FieldTrackingView initialUnitTag={inspectingTag} />)}
          {activeTab === "reminders" && (currentRole === "admin" ? <WhatsAppReminderView /> : <FieldTrackingView initialUnitTag={inspectingTag} />)}
          {activeTab === "settings" && (currentRole === "admin" ? <SystemSettingsView /> : <FieldTrackingView initialUnitTag={inspectingTag} />)}
          {activeTab === "unit_detail" && (
            <ACUnitDetailView
              assetTag={inspectingTag}
              onBack={() => setActiveTab(currentRole === "admin" ? "customers" : "service_flow")}
            />
          )}
        </div>
      </main>

      {/* Persistent Role-Adaptive Bottom Navigation Bar for Mobile */}
      <nav 
        aria-label="Navigasi Bawah Mobile" 
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-3 py-1.5 flex items-center justify-around shadow-lg no-print"
      >
        {currentRole === "technician" ? (
          <>
            <button
              onClick={() => setActiveTab("service_flow")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                activeTab === "service_flow" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ClipboardCheck className={`w-5 h-5 ${activeTab === "service_flow" ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] tracking-tight">Servis</span>
            </button>

            <button
              onClick={() => setActiveTab("schedules")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                activeTab === "schedules" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarClock className={`w-5 h-5 ${activeTab === "schedules" ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] tracking-tight">Jadwal</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                activeTab === "dashboard" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BarChart3 className={`w-5 h-5 ${activeTab === "dashboard" ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] tracking-tight">Metrik</span>
            </button>

            <button
              onClick={() => setActiveTab("schedules")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
                activeTab === "schedules" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarClock className={`w-5 h-5 ${activeTab === "schedules" ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] tracking-tight">Jadwal</span>
            </button>
          </>
        )}

        {/* Elevated Primary Scan Action */}
        <button
          onClick={() => setShowScanModal(true)}
          aria-label="Pindai Barcode atau QR AC"
          className="-mt-5 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30 border-2 border-white flex items-center justify-center interactive-button active:scale-95 transition-transform"
        >
          <QrCode className="w-6 h-6 stroke-[2.2]" />
        </button>

        {currentRole === "technician" ? (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Profil</span>
          </button>
        ) : (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Menu</span>
          </button>
        )}
      </nav>
    </div>
  );
}
