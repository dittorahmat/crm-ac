import React, { useState } from "react";
import { Bell, Send, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Settings, MessageSquare } from "lucide-react";

interface ReminderItem {
  id: string;
  customerName: string;
  picName: string;
  picPhone: string;
  locationName: string;
  unitCount: number;
  intervalMonths: number;
  nextDueDate: string;
  daysRemaining: number;
  lastSentStatus: "SENT" | "PENDING" | "FAILED";
  providerUsed: "Meta Cloud API" | "Fonnte (Fallback)";
}

export function WhatsAppReminderView() {
  const [reminders, setReminders] = useState<ReminderItem[]>([
    {
      id: "rem_1",
      customerName: "PT. Mega Solusi Finansial",
      picName: "Bpk. Rahmat",
      picPhone: "081288992211",
      locationName: "Gedung Wisma Sudirman",
      unitCount: 8,
      intervalMonths: 3,
      nextDueDate: "2026-11-28",
      daysRemaining: 5,
      lastSentStatus: "SENT",
      providerUsed: "Meta Cloud API",
    },
    {
      id: "rem_2",
      customerName: "CV. Digital Niaga Nusantara",
      picName: "Ibu Linda",
      picPhone: "081399887766",
      locationName: "Head Office Tebet",
      unitCount: 4,
      intervalMonths: 3,
      nextDueDate: "2026-11-26",
      daysRemaining: 3,
      lastSentStatus: "SENT",
      providerUsed: "Fonnte (Fallback)",
    },
    {
      id: "rem_3",
      customerName: "PT. Cahaya Abadi Prima",
      picName: "Bpk. Hendra",
      picPhone: "081912345678",
      locationName: "Pabrik Daan Mogot",
      unitCount: 16,
      intervalMonths: 2,
      nextDueDate: "2026-11-25",
      daysRemaining: 2,
      lastSentStatus: "PENDING",
      providerUsed: "Meta Cloud API",
    },
  ]);

  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleManualSend = (id: string) => {
    setSendingId(id);
    setTimeout(() => {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, lastSentStatus: "SENT" } : r
        )
      );
      setSendingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Otomasi Pengingat WhatsApp (Siklus 3-6 Bulan)
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Cloudflare Cron Trigger mendeteksi unit yang mendekati jatuh tempo dan mengirim notifikasi WhatsApp otomatis
          </p>
        </div>
      </div>

      {/* Gateway Architecture Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-blue-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Gateway Primer: Official Meta Cloud API</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Terhubung
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              WhatsApp Business Platform resmi via Cloudflare Edge fetch.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Gateway Cadangan: Fonnte / Waha API</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-500/10 text-blue-600 border border-teal-500/20">
                Siaga Otomatis
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Aktif otomatis bila terjadi kendala kuota atau jaringan di Meta API.
            </p>
          </div>
        </div>
      </div>

            {/* Reminders List */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daftar Jadwal Perawatan Mendekati Jatuh Tempo (H-7 s/d H-1)
          </h3>
          <span className="text-[11px] text-blue-600 font-medium">3 Unit Memerlukan Perhatian</span>
        </div>

        <div className="space-y-3">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">{r.customerName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {r.unitCount} Unit AC
                  </span>
                  <span className="text-[11px] text-slate-500">Siklus: Tiap {r.intervalMonths} Bulan</span>
                </div>

                <p className="text-xs text-slate-500">
                  Lokasi: <span className="text-slate-700">{r.locationName}</span> • PIC:{" "}
                  <span className="text-slate-700">{r.picName} ({r.picPhone})</span>
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Jatuh Tempo: {r.nextDueDate} (Sisa {r.daysRemaining} Hari)
                  </span>
                  <span className="text-[11px] text-slate-500">• Jalur: {r.providerUsed}</span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-3 self-end lg:self-center">
                {r.lastSentStatus === "SENT" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pesan WA Terkirim
                  </span>
                ) : (
                  <button
                    onClick={() => handleManualSend(r.id)}
                    disabled={sendingId === r.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-xs transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingId === r.id ? "Mengirim..." : "Kirim Pengingat Sekarang"}
                  </button>
                )}
              </div>
            </div>
          ))}
                </div>
      </section>
    </div>
  );
}
