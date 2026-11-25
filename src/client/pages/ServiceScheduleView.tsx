import React, { useState, useEffect } from "react";
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
  Send,
  Loader2
} from "lucide-react";

interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  locationName: string;
  address: string;
  unitCount: number;
  technicianId?: string;
  technicianName?: string;
  scheduledDate: string;
  status: "SCHEDULED" | "DISPATCHED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED";
}

interface Technician {
  id: string;
  name: string;
  email: string;
}

export function ServiceScheduleView() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [assignedTechId, setAssignedTechId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const raw = (await res.json()) as any[];
        const mapped: ServiceOrder[] = raw.map((item: any) => ({
          id: item.order.id,
          orderNumber: item.order.orderNumber,
          customerName: item.customer?.name || "Pelanggan B2B",
          locationName: item.location?.name || "Lokasi Gedung",
          address: item.location?.address || "Jakarta",
          unitCount: 1,
          technicianId: item.technician?.id,
          technicianName: item.technician?.name,
          scheduledDate: item.order.scheduledDate
            ? new Date(item.order.scheduledDate).toLocaleString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          status: item.order.status,
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to load orders from D1:", err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch("/api/technicians");
      if (res.ok) {
        const techList = (await res.json()) as Technician[];
        setTechnicians(techList);
        if (techList.length > 0) {
          setAssignedTechId(techList[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load technicians:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchOrders(), fetchTechnicians()]).finally(() => setLoading(false));
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !assignedTechId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DISPATCHED",
          technicianId: assignedTechId,
        }),
      });

      if (res.ok) {
        await fetchOrders();
        setShowDispatchModal(false);
      } else {
        alert("Gagal memperbarui status order ke D1.");
      }
    } catch (err) {
      console.error("Failed to dispatch technician:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
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
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                {order.status === "SCHEDULED" && (
                  <button
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setShowDispatchModal(true);
                    }}
                    className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    <UserCheck className="w-4 h-4" />
                    Tugaskan Teknisi
                  </button>
                )}
                {order.status === "DISPATCHED" && (
                  <span className="text-xs text-slate-500 italic py-2">
                    Menunggu teknisi check-in di lokasi
                  </span>
                )}
                {order.status === "IN_PROGRESS" && (
                  <span className="text-xs text-blue-600 font-semibold py-2">
                    Sedang dikerjakan teknisi
                  </span>
                )}
                {order.status === "COMPLETED" && (
                  <span className="text-xs text-emerald-600 font-semibold py-2">
                    Servis selesai tervalidasi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Pilih Teknisi Lapangan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih teknisi yang akan diberangkatkan untuk menangani tiket servis ini.
            </p>

            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Teknisi Tersedia</label>
                <select
                  value={assignedTechId}
                  onChange={(e) => setAssignedTechId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {technicians.length > 0 ? (
                    technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))
                  ) : (
                    <option value="">Tidak ada teknisi tersedia</option>
                  )}
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
                  disabled={submitting || !assignedTechId}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Tugaskan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
