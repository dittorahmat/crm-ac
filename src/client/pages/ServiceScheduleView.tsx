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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Menunggu Teknisi
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3" />
            Teknisi Ditugaskan
          </span>
        );
      case "CHECKED_IN":
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <AlertCircle className="w-3 h-3 animate-spin" />
            Sedang Dikerjakan
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Selesai Servis
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-blue-600" />
            Penjadwalan & Penugasan Teknisi Lapangan
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Atur jadwal kunjungan servis rutin atau perbaikan darurat ke gedung pelanggan B2B
          </p>
        </div>
      </div>

      {/* Orders List */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tiket Kunjungan Servis Aktif
          </h3>
          <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">3 Kunjungan Terdaftar</span>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    {order.orderNumber}
                  </span>
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {order.scheduledDate}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {order.customerName}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {order.locationName} - {order.address}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Unit Target: <strong className="text-slate-800">{order.unitCount} Unit AC</strong></span>
                  <span>
                    Teknisi:{" "}
                    {order.technicianName ? (
                      <strong className="text-blue-700">{order.technicianName}</strong>
                    ) : (
                      <span className="text-amber-700 italic">Belum Ditugaskan</span>
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
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Tugaskan Teknisi
                  </button>
                )}
                {order.status === "DISPATCHED" && (
                  <span className="text-xs text-slate-500 italic">
                    Menunggu teknisi check-in di lokasi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Pilih Teknisi Lapangan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih teknisi yang akan diberangkatkan untuk menangani tiket servis ini.
            </p>

            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Teknisi Tersedia</label>
                <select
                  value={assignedTech}
                  onChange={(e) => setAssignedTech(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
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
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
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
