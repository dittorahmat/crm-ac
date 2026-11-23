import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  Building2, 
  MapPin, 
  Layers, 
  Cpu, 
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
  Clock
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
    brandModel: "Daikin Inverter In-Room Cooling",
    modelNumber: "FTKC25TV",
    serialNumber: "SN-DKN-88219-JKT",
    acType: "Split Wall Inverter Heavy Duty",
    capacityPk: 2.0,
    refrigerantType: "R32",
    installDate: "15 Januari 2024",
    serviceIntervalMonths: 1,
    status: "active",
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
    QRCode.toDataURL(directUrl, { margin: 1, width: 180 }).then(setQrUrl).catch(console.error);
  }, [unit.assetTag]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Aset
        </button>
        <span className="text-xs text-slate-500 font-mono">
          Passport Identitas Aset AC • KoolSync Verified
        </span>
      </div>

      {/* Main Asset Header Passport */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-mono font-black px-3 py-1 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {unit.assetTag}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Unit Beroperasi Normal
              </span>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-medium">
                Siklus Servis: Tiap {unit.serviceIntervalMonths} Bulan
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {unit.brandModel}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Model: <span className="text-slate-200 font-medium">{unit.modelNumber}</span> • Serial No:{" "}
                <span className="text-slate-200 font-mono">{unit.serialNumber}</span>
              </p>
            </div>

            {/* Customer & Location Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Customer Korporat
                </span>
                <p className="font-bold text-white text-sm">{unit.customerName}</p>
                <p className="text-slate-400">{unit.customerPic}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Penempatan Fisik Gedung
                </span>
                <p className="font-bold text-white text-sm">{unit.locationName}</p>
                <p className="text-slate-400">{unit.zoneFloor}</p>
              </div>
            </div>
          </div>

          {/* QR Code Sticker Preview Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center shrink-0 self-center md:self-start text-center w-48 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1">
              <QrCode className="w-3 h-3 text-teal-400" />
              Tagging Barcode Fisik
            </span>
            {qrUrl && (
              <div className="p-2 bg-white rounded-xl shadow-inner">
                <img src={qrUrl} alt={unit.assetTag} className="w-28 h-28 object-contain" />
              </div>
            )}
            <span className="text-[11px] font-mono font-bold text-teal-400 mt-2">
              {unit.assetTag}
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5">Scan kamera HP untuk servis</span>
          </div>
        </div>
      </div>

      {/* Real-time Last Known Condition */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Diagnosa & Kondisi Terakhir Unit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Data telemetri dari hasil pengerjaan servis lapangan terakhir oleh teknisi resmi
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Skor Kesehatan: {unit.lastCondition.healthScore}%
            </span>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
              <Gauge className="w-4 h-4" />
              Tekanan Freon
            </div>
            <p className="text-sm font-bold text-white">{unit.lastCondition.pressurePsi}</p>
            <p className="text-[10px] text-slate-500">Tipe Freon {unit.refrigerantType}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <Zap className="w-4 h-4" />
              Beban Arus Listrik
            </div>
            <p className="text-sm font-bold text-white">{unit.lastCondition.ampereLoad}</p>
            <p className="text-[10px] text-slate-500">Kapasitas {unit.capacityPk} PK</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
              <Thermometer className="w-4 h-4" />
              Suhu Hembusan
            </div>
            <p className="text-sm font-bold text-white">{unit.lastCondition.deltaTemp}</p>
            <p className="text-[10px] text-slate-500">Kondisi Evaporator Bersih</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Calendar className="w-4 h-4" />
              Jadwal Servis Berikutnya
            </div>
            <p className="text-sm font-bold text-white">{unit.lastCondition.nextDueDate}</p>
            <p className="text-[10px] text-teal-400 font-medium">WhatsApp Reminder Aktif</p>
          </div>
        </div>
      </div>

      {/* Complete Historical Service Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-teal-400" />
              Riwayat Perbaikan & Perawatan Lengkap (Service History)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh rekam jejak pengerjaan teknisi, penggantian suku cadang, foto bukti, dan tanda tangan PIC untuk unit ini
            </p>
          </div>
          <span className="text-xs text-teal-400 font-semibold">
            {unit.serviceHistory.length} Riwayat Servis Tercatat
          </span>
        </div>

        {/* Timeline Items */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
          {unit.serviceHistory.map((history) => (
            <div key={history.orderNumber} className="relative flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-slate-900 border-2 border-teal-500 text-teal-400 flex items-center justify-center shrink-0 z-10 shadow-lg">
                <Wrench className="w-4 h-4" />
              </div>

              <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-teal-300 border border-slate-800">
                      {history.orderNumber}
                    </span>
                    <span className="text-sm font-bold text-white">{history.action}</span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {history.date}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                  {history.notes}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 block">Freon Tekanan</span>
                    <span className="font-semibold text-teal-300">{history.measurements.afterPsi}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 block">Beban Ampere</span>
                    <span className="font-semibold text-amber-300">{history.measurements.ampere}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 block">Suhu Output</span>
                    <span className="font-semibold text-blue-300">{history.measurements.temp}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 block">Validasi PIC</span>
                    <span className="font-semibold text-emerald-400 truncate block">
                      {history.picSignedBy}
                    </span>
                  </div>
                </div>

                {history.evidencePhotos.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">
                      Foto Bukti di R2 Storage:
                    </span>
                    <div className="flex gap-2">
                      {history.evidencePhotos.map((photo, i) => (
                        <div key={i} className="h-20 w-28 rounded-xl overflow-hidden border border-slate-800 relative group">
                          <img src={photo} alt="Bukti" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/70 text-[9px] text-white rounded">
                            {i === 0 ? "Before" : "After"}
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
      </div>
    </div>
  );
}
