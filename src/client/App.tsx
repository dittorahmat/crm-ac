import React, { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
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
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "customers" | "tags" | "schedules" | "service_flow" | "invoices" | "reminders"
  >("dashboard");
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>({
    name: "Admin Operasional",
    email: "admin@koolsync.com",
    role: "admin",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { id: "customers", label: "Aset & Klien B2B", icon: Building2 },
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
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                    Ringkasan Operasional & Pendapatan
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400">
                    Monitoring kinerja teknisi lapangan dan arus pendapatan servis AC B2B
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloudflare Edge Real-time
                  </span>
                </div>
              </div>

              {/* Stats KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-medium text-slate-400">Total Unit AC Terdata</span>
                  <div className="text-2xl font-bold text-white mt-1">148 Unit</div>
                  <span className="text-[11px] text-teal-400 mt-2 block">12 Kantor B2B Terdaftar</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-medium text-slate-400">Jadwal Servis Bulan Ini</span>
                  <div className="text-2xl font-bold text-teal-400 mt-1">42 Order</div>
                  <span className="text-[11px] text-slate-400 mt-2 block">36 Selesai • 6 Dalam Proses</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-medium text-slate-400">Pendapatan Bulan Berjalan</span>
                  <div className="text-2xl font-bold text-white mt-1">Rp 28.450.000</div>
                  <span className="text-[11px] text-emerald-400 mt-2 block">↑ 14% dari bulan lalu</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-medium text-slate-400">Reminder WA Otomatis</span>
                  <div className="text-2xl font-bold text-teal-400 mt-1">29 Terkirim</div>
                  <span className="text-[11px] text-slate-400 mt-2 block">94% Tingkat Konfirmasi Servis</span>
                </div>
              </div>

              {/* Notice */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Arsitektur Siap Beroperasi</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Semua modul tracer-bullet (Hirarki Aset B2B, Generator Barcode Tom & Jerry, Tracking Lapangan + Foto R2, Faktur PDF Email, dan WhatsApp Reminder Cron) siap diakses melalui menu navigasi samping.
                </p>
              </div>
            </div>
          )}

          {activeTab !== "dashboard" && (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <h3 className="text-lg font-bold text-white capitalize">{activeTab.replace("_", " ")}</h3>
              <p className="text-xs text-slate-400 mt-2">Komponen terhubung ke backend Hono & Drizzle D1.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
