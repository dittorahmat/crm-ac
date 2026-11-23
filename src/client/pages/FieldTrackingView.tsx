import React, { useState, useRef } from "react";
import { 
  Camera, 
  CheckCircle2, 
  PenTool, 
  Gauge, 
  Thermometer, 
  Zap, 
  Upload, 
  MapPin, 
  QrCode,
  ShieldCheck,
  Star
} from "lucide-react";

export function FieldTrackingView() {
  const [step, setStep] = useState<"scan" | "inspect" | "measure" | "signature" | "done">("inspect");
  const [activeUnitTag, setActiveUnitTag] = useState("AC-MSF-SRV-01");

  // Measurements
  const [beforePsi, setBeforePsi] = useState("65");
  const [afterPsi, setAfterPsi] = useState("125");
  const [beforeAmp, setBeforeAmp] = useState("4.2");
  const [afterAmp, setAfterAmp] = useState("3.6");
  const [beforeTemp, setBeforeTemp] = useState("25");
  const [afterTemp, setAfterTemp] = useState("16");

  // Photos
  const [beforePhoto, setBeforePhoto] = useState<string | null>("https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80");
  const [afterPhoto, setAfterPhoto] = useState<string | null>("https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80");

  // Signer
  const [signerName, setSignerName] = useState("Bpk. Rahmat (PIC Gedung)");
  const [signed, setSigned] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                {activeUnitTag}
              </span>
              <span className="text-xs text-slate-400">Daikin Inverter 2.0 PK</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Pengerjaan Servis: PT. Mega Solusi Finansial
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              Lantai 2 - Ruang Server (Siklus Rutin 1 Bulan)
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Sync R2
            </span>
          </div>
        </div>

        {/* Steps Breadcrumbs */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={() => setStep("inspect")}
            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
              step === "inspect"
                ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                : "bg-slate-950/60 border-slate-800/80 text-slate-400"
            }`}
          >
            1. Foto Bukti
          </button>
          <button
            onClick={() => setStep("measure")}
            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
              step === "measure"
                ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                : "bg-slate-950/60 border-slate-800/80 text-slate-400"
            }`}
          >
            2. Parameter PSI
          </button>
          <button
            onClick={() => setStep("signature")}
            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
              step === "signature"
                ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                : "bg-slate-950/60 border-slate-800/80 text-slate-400"
            }`}
          >
            3. Tanda Tangan
          </button>
          <button
            onClick={() => setStep("done")}
            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
              step === "done"
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : "bg-slate-950/60 border-slate-800/80 text-slate-400"
            }`}
          >
            4. Selesai
          </button>
        </div>
      </div>

      {/* Step 1: Photos Evidence */}
      {step === "inspect" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-400" />
              Upload Bukti Foto Kondisi (Before & After)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Foto dikompresi otomatis di sisi browser teknisi dan disimpan aman ke Cloudflare R2 bucket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">Foto SEBELUM Dikerjakan</span>
              {beforePhoto ? (
                <div className="relative rounded-lg overflow-hidden h-44 border border-slate-800">
                  <img src={beforePhoto} alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white">
                    Filter Kotor & Evaporator Berdebu
                  </span>
                </div>
              ) : (
                <div className="h-44 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-xs text-slate-500">
                  <Upload className="w-6 h-6 mb-1 text-slate-600" />
                  Ambil Foto Kondisi Awal
                </div>
              )}
            </div>

            {/* After Photo */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">Foto SESUDAH Dikerjakan</span>
              {afterPhoto ? (
                <div className="relative rounded-lg overflow-hidden h-44 border border-slate-800">
                  <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-teal-950/80 text-[10px] text-teal-300 border border-teal-500/30">
                    Evaporator Bersih & Aliran Lancar
                  </span>
                </div>
              ) : (
                <div className="h-44 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-xs text-slate-500">
                  <Upload className="w-6 h-6 mb-1 text-slate-600" />
                  Ambil Foto Hasil Pembersihan
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep("measure")}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              Lanjut ke Pengukuran Parameter ➔
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Measurements */}
      {step === "measure" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-teal-400" />
              Input Parameter Teknis & Hasil Diagnosa
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Catatan komparasi sebelum vs sesudah servis untuk dicetak di lembar laporan klien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PSI Pressure */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                <Gauge className="w-4 h-4" />
                Tekanan Freon (PSI)
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Sebelum Servis</label>
                <input
                  type="text"
                  value={beforePsi}
                  onChange={(e) => setBeforePsi(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Sesudah Servis</label>
                <input
                  type="text"
                  value={afterPsi}
                  onChange={(e) => setAfterPsi(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-teal-400 font-bold"
                />
              </div>
            </div>

            {/* Current Ampere */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Zap className="w-4 h-4" />
                Beban Arus (Ampere)
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Sebelum Servis</label>
                <input
                  type="text"
                  value={beforeAmp}
                  onChange={(e) => setBeforeAmp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Sesudah Servis</label>
                <input
                  type="text"
                  value={afterAmp}
                  onChange={(e) => setAfterAmp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-teal-400 font-bold"
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <Thermometer className="w-4 h-4" />
                Suhu Hembusan (°C)
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Sebelum Servis</label>
                <input
                  type="text"
                  value={beforeTemp}
                  onChange={(e) => setBeforeTemp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Sesudah Servis</label>
                <input
                  type="text"
                  value={afterTemp}
                  onChange={(e) => setAfterTemp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-teal-400 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep("inspect")}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              ← Kembali
            </button>
            <button
              onClick={() => setStep("signature")}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              Lanjut ke Persetujuan PIC ➔
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Signature */}
      {step === "signature" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PenTool className="w-4 h-4 text-teal-400" />
              Tanda Tangan Digital & Approval PIC Pelanggan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              PIC kantor menandatangani langsung di layar HP teknisi untuk memvalidasi pengerjaan telah selesai.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Terang Penandatangan (PIC)
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Signature Box Simulation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Goreskan Tanda Tangan:</span>
                <button
                  type="button"
                  onClick={() => setSigned(false)}
                  className="text-[11px] text-teal-400 hover:underline"
                >
                  Reset Tanda Tangan
                </button>
              </div>

              <div
                onClick={() => setSigned(true)}
                className="h-36 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer select-none"
              >
                {signed ? (
                  <div className="text-center">
                    <span className="text-2xl font-serif italic text-teal-400">
                      Rahmat H.
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Tanda Tangan Terekam (Digital WebP)</p>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    Ketuk atau usap di sini untuk tanda tangan
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep("measure")}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              ← Kembali
            </button>
            <button
              onClick={() => setStep("done")}
              disabled={!signed}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-500/10"
            >
              Selesaikan Tiket & Terbitkan Faktur ➔
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Servis Sukses & Tersimpan ke Edge</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Bukti foto telah terunggah ke Cloudflare R2, status unit diubah ke ACTIVE, dan faktur PDF siap diterbitkan otomatis via email.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setStep("inspect")}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
            >
              Lihat Detail Rekap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
