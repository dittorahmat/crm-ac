import React from "react";
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

export function AnalyticsDashboardView() {
  const technicians = [
    {
      name: "Fajar Pratama",
      title: "Senior HVAC Specialist",
      unitsServiced: 68,
      rating: 4.9,
      avgDuration: "52 Menit",
      onTimeRate: "98%",
      avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Agus Santoso",
      title: "Field Technician",
      unitsServiced: 54,
      rating: 4.8,
      avgDuration: "58 Menit",
      onTimeRate: "95%",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Budi Hermawan",
      title: "Junior Technician",
      unitsServiced: 39,
      rating: 4.7,
      avgDuration: "64 Menit",
      onTimeRate: "92%",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section with Real Commercial HVAC Imagery */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0c1320] shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80" 
            alt="Commercial Rooftop Chillers" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06090e] via-[#06090e]/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Snowflake className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Real-time B2B Fleet Management</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Command Center Servis AC & Manajemen Armada Gedung
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Memantau jadwal berkala 148 unit pendingin udara di seluruh gedung kantor pelanggan, kinerja teknisi lapangan, dan pendapatan bulanan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md shrink-0 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Status Operasi Cloudflare</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              100% Edge Isolated (D1 + R2)
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Next Cron Scan: 01:00 UTC
            </div>
          </div>
        </div>
      </section>

      {/* Financial Overview Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Metrik Finansial & Potensi Arus Kas
          </h2>
          <span className="text-xs text-cyan-400 font-mono font-bold">November 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-[#0b111c] border border-slate-800/80 interactive-card space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Total Pendapatan Servis</span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              Rp 38.850.000
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Jasa Pembersihan: <strong>Rp 29.4M</strong></span>
              <span>Suku Cadang & Freon: <strong>Rp 9.45M</strong></span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0b111c] border border-slate-800/80 interactive-card space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Faktur Lunas vs Piutang</span>
              <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                91% Tertagih
              </span>
            </div>
            <div className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
              Rp 35.400.000
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>24 Faktur Lunas</span>
              <span className="text-amber-400 font-medium">Pending: Rp 3.450.000</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0b111c] border border-slate-800/80 interactive-card space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Proyeksi Omset Servis (30 Hari)</span>
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              Rp 21.600.000
            </div>
            <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              Estimasi 62 unit AC di 5 gedung customer yang masuk jadwal reminder
            </div>
          </div>
        </div>
      </section>

      {/* Technician Productivity Leaderboard */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0b111c] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Leaderboard Produktivitas & Kinerja Teknisi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dihitung berdasarkan kecepatan pengerjaan, akurasi input parameter teknis (PSI/Ampere), dan rating PIC gedung.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 font-semibold text-slate-300">
            3 Teknisi Tersertifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {technicians.map((t, idx) => (
            <div
              key={t.name}
              className="p-5 rounded-2xl bg-[#070b12] border border-slate-800/80 interactive-card space-y-4"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/30"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.title}</p>
                </div>
                <div className="h-7 w-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-mono font-bold">
                  #{idx + 1}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0d1420] border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Unit Diservis</span>
                  <span className="font-extrabold text-white text-sm">{t.unitsServiced} Unit</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1420] border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Rating Kepuasan</span>
                  <span className="font-extrabold text-amber-400 text-sm flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {t.rating}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1420] border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Rata-rata Durasi</span>
                  <span className="font-bold text-slate-300">{t.avgDuration}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1420] border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">On-Time SLA</span>
                  <span className="font-bold text-emerald-400">{t.onTimeRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
