import React, { useState } from "react";
import { 
  CalendarClock, 
  UserCheck, 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Calendar,
  Send
} from "lucide-react";

interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  locationName: string;
  address: string;
  unitCount: number;
  technicianName?: string;
  scheduledDate: string;
  status: "SCHEDULED" | "DISPATCHED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED";
}

export function ServiceScheduleView() {
  const [orders, setOrders] = useState<ServiceOrder[]>([
    {
      id: "so_1",
      orderNumber: "SO-202611-104",
      customerName: "PT. Mega Solusi Finansial",
      locationName: "Gedung Wisma Sudirman Lt. 8",
      address: "Jl. Jend. Sudirman Kav. 24, Jakarta Pusat",
      unitCount: 8,
      technicianName: "Fajar Pratama (Senior Tech)",
      scheduledDate: "2026-11-24 09:00",
      status: "DISPATCHED",
    },
    {
      id: "so_2",
      orderNumber: "SO-202611-105",
      customerName: "CV. Digital Niaga Nusantara",
      locationName: "Head Office Tebet",
      address: "Jl. Tebet Raya No. 45, Jakarta Selatan",
      unitCount: 4,
      technicianName: undefined,
      scheduledDate: "2026-11-24 14:00",
      status: "SCHEDULED",
    },
    {
      id: "so_3",
      orderNumber: "SO-202611-103",
      customerName: "PT. Surya Teknologi Global",
      locationName: "Graha Mandiri Lt. 12",
      address: "Jl. M.H. Thamrin No. 8, Jakarta Pusat",
      unitCount: 12,
      technicianName: "Agus Santoso",
      scheduledDate: "2026-11-23 10:00",
      status: "COMPLETED",
    },
  ]);

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [assignedTech, setAssignedTech] = useState("Fajar Pratama (Senior Tech)");

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderId
          ? { ...o, technicianName: assignedTech, status: "DISPATCHED" }
          : o
      )
    );
    setShowDispatchModal(false);
  };

  const getStatusBadge = (status: ServiceOrder["status"]) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Menunggu Teknisi
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Send className="w-3 h-3" />
            Teknisi Ditugaskan
          </span>
        );
      case "CHECKED_IN":
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <AlertCircle className="w-3 h-3" />
            Sedang Dikerjakan
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Selesai Servis
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-teal-400" />
            Penjadwalan & Penugasan Teknisi Lapangan
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Atur jadwal kunjungan servis rutin atau perbaikan darurat ke gedung pelanggan B2B
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tiket Kunjungan Servis Aktif
          </h3>
          <span className="text-[11px] text-teal-400 font-medium">3 Kunjungan Terdaftar</span>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                    {order.orderNumber}
                  </span>
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {order.scheduledDate}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {order.customerName}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {order.locationName} - {order.address}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Unit Target: <strong className="text-slate-200">{order.unitCount} Unit AC</strong></span>
                  <span>
                    Teknisi:{" "}
                    {order.technicianName ? (
                      <strong className="text-teal-400">{order.technicianName}</strong>
                    ) : (
                      <span className="text-amber-400 italic">Belum Ditugaskan</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end lg:self-center">
                {order.status === "SCHEDULED" && (
                  <button
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setShowDispatchModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/10"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Tugaskan Teknisi
                  </button>
                )}
                {order.status === "DISPATCHED" && (
                  <span className="text-xs text-slate-400 italic">
                    Menunggu teknisi check-in di lokasi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Pilih Teknisi Lapangan</h3>
            <p className="text-xs text-slate-400 mb-4">
              Pilih teknisi yang akan diberangkatkan untuk menangani tiket servis ini.
            </p>

            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Teknisi Tersedia</label>
                <select
                  value={assignedTech}
                  onChange={(e) => setAssignedTech(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Fajar Pratama (Senior Tech)">Fajar Pratama (Senior Tech) - Siap</option>
                  <option value="Agus Santoso">Agus Santoso - Siap</option>
                  <option value="Budi Hermawan">Budi Hermawan - Siap</option>
                  <option value="Dian Setiawan">Dian Setiawan - Siap</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Konfirmasi Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
