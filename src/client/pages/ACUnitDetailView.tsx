import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  Building2, 
  MapPin, 
  History, 
  Calendar, 
  Gauge, 
  Thermometer, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Wrench, 
  QrCode,
  ArrowLeft,
  Clock,
  Sparkles,
  Layers
} from "lucide-react";

export interface ACUnitDetailProps {
  assetTag: string;
  onBack?: () => void;
  onScheduleService?: (unitTag: string) => void;
}

export function ACUnitDetailView({ assetTag, onBack }: ACUnitDetailProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  // Customer & Asset Passport
  const unit = {
    assetTag: assetTag || "AC-MSF-SRV-01",
    customerName: "PT. Mega Solusi Finansial",
    customerPic: "Bpk. Rahmat Hidayat (0812-8899-2211)",
    customerEmail: "procurement@megasolusi.co.id",
    locationName: "Gedung Wisma Sudirman",
    address: "Jl. Jend. Sudirman Kav. 24, Jakarta Pusat",
    zoneFloor: "Lantai 2 - Ruang Server Utama (Area Kritis)",
    brandModel: "Daikin Inverter In-Room Cooling Heavy Duty",
    modelNumber: "FTKC25TV",
    serialNumber: "SN-DKN-88219-JKT",
    acType: "Split Wall Inverter High-Reliability",
    capacityPk: 2.0,
    refrigerantType: "R32",
    installDate: "15 Januari 2024",
    serviceIntervalMonths: 1,
    status: "active",
    photoUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
    lastCondition: {
      healthScore: 96,
      conditionText: "Kondisi Prima (Bersih & Dingin Normal)",
      lastServiceDate: "23 Oktober 2026",
      nextDueDate: "23 November 2026",
      pressurePsi: "125 PSI (Normal)",
      ampereLoad: "3.6 A (Optimal)",
      deltaTemp: "Suhu Hembusan 16°C (Delta T 9°C)",
      technician: "Fajar Pratama (Senior HVAC)",
    },
    serviceHistory: [
      {
        orderNumber: "SO-202610-088",
        date: "23 Oktober 2026",
        action: "Cuci Rutin & Pengecekan Freon R32",
        technician: "Fajar Pratama",
        measurements: {
          beforePsi: "90 PSI (Kurang Freon)",
          afterPsi: "125 PSI (Ditambah 35 PSI)",
          ampere: "3.6 A",
          temp: "16°C",
        },
        notes: "Filter udara tertutup debu halus. Pembersihan evaporator tuntas, tambah freon R32 0.3kg.",
        evidencePhotos: [
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80"
        ],
        picSignedBy: "Rahmat Hidayat (PIC Gedung)",
      },
      {
        orderNumber: "SO-202609-042",
        date: "20 September 2026",
        action: "Inspeksi Berkala & Penggantian Kapasitor Fan",
        technician: "Agus Santoso",
        measurements: {
          beforePsi: "120 PSI",
          afterPsi: "125 PSI",
          ampere: "3.8 A",
          temp: "17°C",
        },
        notes: "Penggantian running capacitor outdoor fan 2.5uF karena putaran melemah.",
        evidencePhotos: [],
        picSignedBy: "Rahmat Hidayat",
      },
    ],
  };

  useEffect(() => {
    const directUrl = `${window.location.origin}/ac/${encodeURIComponent(unit.assetTag)}`;
    QRCode.toDataURL(directUrl, { margin: 1, width: 200 }).then(setQrUrl).catch(console.error);
  }, [unit.assetTag]);

  return (
    <div className="space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors interactive-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Aset
        </button>
        <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          KoolSync Verified Digital Passport
        </span>
      </div>

      {/* Main Asset Header Passport */}
      <section className="bg-[#0b111c] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-mono font-extrabold px-3.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/40">
                {unit.assetTag}
              </span>
              <span className="px-3.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Unit Beroperasi Normal
              </span>
              <span className="text-xs px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
                Siklus Servis: Tiap {unit.serviceIntervalMonths} Bulan
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {unit.brandModel}
              </h1>
              <p className="text-sm text-slate-400 mt-2 font-mono">
                Model: <strong className="text-slate-200">{unit.modelNumber}</strong> • Serial:{" "}
                <strong className="text-slate-200">{unit.serialNumber}</strong> • Tipe:{" "}
                <span className="text-cyan-400">{unit.acType}</span>
              </p>
            </div>

            {/* Customer & Location Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#06090e] border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Customer Korporat
                </span>
                <p className="font-bold text-white text-base">{unit.customerName}</p>
                <p className="text-slate-400">{unit.customerPic}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#06090e] border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Penempatan Fisik Gedung
                </span>
                <p className="font-bold text-white text-base">{unit.locationName}</p>
                <p className="text-slate-400">{unit.zoneFloor}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Physical QR Tag & Asset Photo Preview */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
            <div className="w-full rounded-2xl overflow-hidden border border-slate-800 relative group h-40">
              <img 
                src={unit.photoUrl} 
                alt="AC Unit" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-cyan-300">
                Unit Foto Fisik Terverifikasi
              </span>
            </div>

            <div className="w-full bg-[#06090e] p-4 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-lg">
              {qrUrl && (
                <div className="p-2 bg-white rounded-xl shadow shrink-0">
                  <img src={qrUrl} alt={unit.assetTag} className="w-20 h-20 object-contain" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Tagging Barcode Fisik
                </span>
                <p className="text-xs font-mono font-bold text-cyan-400 mt-1 truncate">
                  {unit.assetTag}
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Scan kamera HP di lapangan
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Last Known Condition */}
      <section className="bg-[#0b111c] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Diagnosa & Telemetri Terakhir Unit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Data pengerjaan servis lapangan terakhir oleh teknisi resmi bersertifikat
            </p>
          </div>
          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
            Skor Kesehatan: {unit.lastCondition.healthScore}% Prima
          </span>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#06090e] border border-slate-800/80 interactive-card space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
              <Gauge className="w-4 h-4" />
              Tekanan Freon
            </div>
            <p className="text-lg font-extrabold text-white font-mono">{unit.lastCondition.pressurePsi}</p>
            <p className="text-[11px] text-slate-500">Standar Freon {unit.refrigerantType}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#06090e] border border-slate-800/80 interactive-card space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
              <Zap className="w-4 h-4" />
              Beban Arus Listrik
            </div>
            <p className="text-lg font-extrabold text-white font-mono">{unit.lastCondition.ampereLoad}</p>
            <p className="text-[11px] text-slate-500">Kapasitas {unit.capacityPk} PK</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#06090e] border border-slate-800/80 interactive-card space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
              <Thermometer className="w-4 h-4" />
              Suhu Hembusan
            </div>
            <p className="text-lg font-extrabold text-white font-mono">{unit.lastCondition.deltaTemp}</p>
            <p className="text-[11px] text-slate-500">Evaporator Bersih Total</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#06090e] border border-slate-800/80 interactive-card space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <Calendar className="w-4 h-4" />
              Jadwal Servis Berikutnya
            </div>
            <p className="text-lg font-extrabold text-white font-mono">{unit.lastCondition.nextDueDate}</p>
            <p className="text-[11px] text-cyan-400 font-medium">WhatsApp Reminder Aktif</p>
          </div>
        </div>
      </section>

      {/* Complete Historical Service Audit Trail */}
      <section className="bg-[#0b111c] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              Riwayat Perbaikan & Perawatan Lengkap (Service History)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh rekam jejak pengerjaan teknisi, penggantian suku cadang, foto bukti R2, dan tanda tangan PIC untuk unit ini
            </p>
          </div>
          <span className="text-xs text-cyan-400 font-bold font-mono">
            {unit.serviceHistory.length} Riwayat Tercatat
          </span>
        </div>

        {/* Timeline Items */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
          {unit.serviceHistory.map((history) => (
            <div key={history.orderNumber} className="relative flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-[#0b111c] border-2 border-cyan-500 text-cyan-400 flex items-center justify-center shrink-0 z-10 shadow-glow-cold">
                <Wrench className="w-4 h-4" />
              </div>

              <div className="flex-1 bg-[#06090e] border border-slate-800 rounded-2xl p-6 space-y-4 interactive-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800">
                      {history.orderNumber}
                    </span>
                    <span className="text-base font-extrabold text-white">{history.action}</span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {history.date}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#0b111c] p-3.5 rounded-xl border border-slate-800/80">
                  {history.notes}
                </p>

                {/* Measurements Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#0b111c] border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Freon Tekanan</span>
                    <span className="font-bold text-cyan-300">{history.measurements.afterPsi}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0b111c] border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Beban Ampere</span>
                    <span className="font-bold text-amber-300">{history.measurements.ampere}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0b111c] border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Suhu Output</span>
                    <span className="font-bold text-blue-300">{history.measurements.temp}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0b111c] border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Validasi PIC</span>
                    <span className="font-bold text-emerald-400 truncate block">
                      {history.picSignedBy}
                    </span>
                  </div>
                </div>

                {/* Photo Evidence Thumbnails */}
                {history.evidencePhotos.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">
                      Foto Bukti di R2 Storage:
                    </span>
                    <div className="flex gap-3">
                      {history.evidencePhotos.map((photo, i) => (
                        <div key={i} className="h-24 w-36 rounded-xl overflow-hidden border border-slate-800 relative group">
                          <img src={photo} alt="Bukti" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className="absolute bottom-1 left-1.5 px-2 py-0.5 bg-black/80 text-[10px] font-bold text-white rounded">
                            {i === 0 ? "Sebelum Cuci" : "Sesudah Cuci"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
