import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Clock, 
  Star, 
  ArrowUpRight, 
  Building2,
  CheckCircle2,
  Zap,
  Snowflake,
  ShieldCheck
} from "lucide-react";

interface TechnicianMetric {
  id: string;
  name: string;
  title: string;
  unitsServiced: number;
  rating: number;
  avgDuration: string;
  onTimeRate: string;
  avatar: string;
}

export function AnalyticsDashboardView() {
  const [metrics, setMetrics] = useState({
    totalUnits: 0,
    activeUnits: 0,
    completedOrders: 0,
    dispatchedOrders: 0,
    totalRevenue: 0,
    invoiceCount: 0,
  });
  const [technicians, setTechnicians] = useState<TechnicianMetric[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data) {
            setMetrics({
              totalUnits: data.totalUnits || 0,
              activeUnits: data.activeUnits || 0,
              completedOrders: data.completedOrders || 0,
              dispatchedOrders: data.dispatchedOrders || 0,
              totalRevenue: data.totalRevenue || 0,
              invoiceCount: data.invoiceCount || 0,
            });

            if (Array.isArray(data.technicians) && data.technicians.length > 0) {
              const mapped = data.technicians.map((t: any, idx: number) => ({
                id: t.id,
                name: t.name,
                title: idx === 0 ? "Senior HVAC Specialist" : "Field Technician",
                unitsServiced: t.unitsServiced,
                rating: t.rating,
                avgDuration: t.avgDuration,
                onTimeRate: t.onTimeRate,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0284c7&color=fff&bold=true&size=128`,
              }));
              setTechnicians(mapped);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load analytics from D1:", err);
      }
    }

    loadMetrics();
  }, []);

  return (
    <main className="space-y-8 wrap">
      {/* Hero Section with Real Commercial HVAC Imagery */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80" 
            alt="Commercial Rooftop Chillers" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Snowflake className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Real-time B2B Fleet Management</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Command Center Servis AC & Manajemen Armada Gedung
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Memantau jadwal berkala 148 unit pendingin udara di seluruh gedung kantor pelanggan, kinerja teknisi lapangan, dan pendapatan bulanan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 space-y-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Status Operasi Cloudflare</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Edge Isolated (D1 + R2)
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Next Cron Scan: 01:00 UTC
            </div>
          </div>
        </div>
      </section>

      {/* Financial Overview Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Metrik Finansial & Potensi Arus Kas
          </h2>
          <span className="text-xs text-blue-600 font-mono font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">November 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 interactive-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold text-slate-700">Total Pendapatan Servis</span>
              <span className="text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              Rp 38.850.000
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Jasa Pembersihan: <strong className="text-slate-800">Rp 29.4M</strong></span>
              <span>Suku Cadang & Freon: <strong className="text-slate-800">Rp 9.45M</strong></span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 interactive-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold text-slate-700">Faktur Lunas vs Piutang</span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                91% Tertagih
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-600 font-mono tracking-tight">
              Rp 35.400.000
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>24 Faktur Lunas</span>
              <span className="text-amber-700 font-medium">Pending: Rp 3.450.000</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 interactive-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold text-slate-700">Proyeksi Omset Servis (30 Hari)</span>
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              Rp 21.600.000
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
              Estimasi 62 unit AC di 5 gedung customer yang masuk jadwal reminder
            </div>
          </div>
        </div>
      </section>

      {/* Technician Productivity Leaderboard */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Leaderboard Produktivitas & Kinerja Teknisi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dihitung berdasarkan kecepatan pengerjaan, akurasi input parameter teknis (PSI/Ampere), dan rating PIC gedung.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 border border-slate-200 font-semibold text-slate-700">
            {technicians.length} Teknisi Tersertifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {technicians.map((t, idx) => (
            <div
              key={t.name}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 interactive-card space-y-4 hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.title}</p>
                </div>
                <div className="h-7 w-7 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xs font-mono font-bold">
                  #{idx + 1}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Unit Diservis</span>
                  <span className="font-extrabold text-slate-900 text-sm">{t.unitsServiced} Unit</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Rating Kepuasan</span>
                  <span className="font-extrabold text-amber-600 text-sm flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {t.rating}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Rata-rata Durasi</span>
                  <span className="font-bold text-slate-700">{t.avgDuration}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">On-Time SLA</span>
                  <span className="font-bold text-emerald-700">{t.onTimeRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
