import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Clock, 
  Star, 
  DollarSign, 
  ArrowUpRight, 
  Calendar,
  Layers,
  Wrench
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
    },
    {
      name: "Agus Santoso",
      title: "Field Technician",
      unitsServiced: 54,
      rating: 4.8,
      avgDuration: "58 Menit",
      onTimeRate: "95%",
    },
    {
      name: "Budi Hermawan",
      title: "Junior Technician",
      unitsServiced: 39,
      rating: 4.7,
      avgDuration: "64 Menit",
      onTimeRate: "92%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-400" />
            Dashboard Performa Teknisi & Finansial Bulanan
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Analisis produktivitas lapangan, SLA on-time servis, serta rekapitulasi pendapatan jasa & suku cadang
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Periode:</span>
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white">
            November 2026
          </span>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Pendapatan Servis</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">Rp 38.850.000</div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Jasa Servis: Rp 29.400.000</span>
            <span>Freon & Parts: Rp 9.450.000</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Faktur Lunas vs Piutang</span>
            <span className="text-teal-400 font-semibold">91% Tertagih</span>
          </div>
          <div className="text-2xl font-bold text-teal-400 font-mono">Rp 35.400.000</div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Lunas: 24 Faktur</span>
            <span className="text-amber-400">Pending: Rp 3.450.000 (3 Klien)</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Estimasi Omset Servis Rutin (30 Hari ke Depan)</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">Rp 21.600.000</div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Dari 62 unit AC di 5 gedung klien yang jatuh tempo reminder
          </div>
        </div>
      </div>

      {/* Technician Productivity Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-400" />
              Tabel Kinerja & Produktivitas Teknisi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Metrik dievaluasi dari waktu penyelesaian servis, checklist parameter teknis, dan rating kepuasan PIC kantor.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {technicians.map((t, idx) => (
            <div
              key={t.name}
              className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.title}</p>
                </div>
                <div className="h-7 w-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold">
                  #{idx + 1}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-xs">
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-[10px] text-slate-500 block">Unit Diservis</span>
                  <span className="font-bold text-white">{t.unitsServiced} Unit</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-[10px] text-slate-500 block">Rating Kepuasan</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {t.rating}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-[10px] text-slate-500 block">Rata-rata Durasi</span>
                  <span className="font-bold text-slate-300">{t.avgDuration}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-[10px] text-slate-500 block">On-Time SLA</span>
                  <span className="font-bold text-emerald-400">{t.onTimeRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
