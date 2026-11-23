import React, { useState, useRef, useEffect } from "react";
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
  Star,
  Loader2
} from "lucide-react";

interface FieldTrackingViewProps {
  initialUnitTag?: string;
}

export function FieldTrackingView({ initialUnitTag }: FieldTrackingViewProps = {}) {
  const [step, setStep] = useState<"inspect" | "measure" | "signature" | "done">("inspect");
  const [activeUnitTag, setActiveUnitTag] = useState(initialUnitTag || "AC-MSF-SRV-01");
  const [serviceItemId, setServiceItemId] = useState<string>("item_demo_1");
  const [serviceOrderId, setServiceOrderId] = useState<string>("so_1");

  // Keep activeUnitTag in sync if prop changes
  useEffect(() => {
    if (initialUnitTag) {
      setActiveUnitTag(initialUnitTag);
    }
  }, [initialUnitTag]);

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
  const [uploading, setUploading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("Siap Sinkron R2");

  // Signer & Real Canvas
  const [signerName, setSignerName] = useState("Bpk. Rahmat (PIC Gedung)");
  const [signed, setSigned] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Load active service order and service items from D1
  useEffect(() => {
    async function loadActiveOrder() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const list = (await res.json()) as any[];
          const inProgressOrDispatched = list.find(
            (item: any) => item.order.status === "DISPATCHED" || item.order.status === "IN_PROGRESS"
          );
          const targetOrder = inProgressOrDispatched || list[0];
          if (targetOrder) {
            setServiceOrderId(targetOrder.order.id);
            if (targetOrder.customer?.picName) {
              setSignerName(`${targetOrder.customer.picName} (PIC Gedung)`);
            }

            // Fetch actual service item for this order
            const itemsRes = await fetch(`/api/orders/${targetOrder.order.id}/items`);
            if (itemsRes.ok) {
              const items = (await itemsRes.json()) as any[];
              if (Array.isArray(items) && items.length > 0) {
                setServiceItemId(items[0].serviceItem.id);
                if (items[0].acUnit?.assetTag) {
                  setActiveUnitTag(items[0].acUnit.assetTag);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load active order from D1:", err);
      }
    }
    loadActiveOrder();
  }, []);

  // Upload handler for R2
  const handleUploadPhoto = async (type: "before" | "after", file: File) => {
    setUploading(true);
    setSyncStatus("Mengunggah ke R2...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serviceItemId", serviceItemId);
      formData.append("evidenceType", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = (await res.json()) as { photoUrl: string; key: string };
        if (type === "before") setBeforePhoto(data.photoUrl);
        else setAfterPhoto(data.photoUrl);
        setSyncStatus(`Tersimpan di R2 (${data.key})`);
      } else {
        alert("Gagal mengunggah foto ke R2.");
        setSyncStatus("Gagal sinkron");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setSyncStatus("Error jaringan");
    } finally {
      setUploading(false);
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigned(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  // Save Measurements to D1
  const handleSaveMeasurements = async () => {
    setSyncStatus("Menyimpan parameter...");
    try {
      await fetch(`/api/service-items/${serviceItemId}/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beforePressurePsi: parseFloat(beforePsi) || 65,
          afterPressurePsi: parseFloat(afterPsi) || 125,
          beforeAmpere: parseFloat(beforeAmp) || 4.2,
          afterAmpere: parseFloat(afterAmp) || 3.6,
          beforeTempC: parseFloat(beforeTemp) || 25,
          afterTempC: parseFloat(afterTemp) || 16,
          notes: "Pembersihan evaporator tuntas, freon optimal.",
        }),
      });
      setSyncStatus("Parameter tersimpan di D1");
      setStep("signature");
    } catch (err) {
      console.error("Failed to save measurements:", err);
      setStep("signature");
    }
  };

  // Complete Order & Save Signature to R2 + D1 (Technicians DO NOT call invoice generation)
  const handleCompleteOrder = async () => {
    setSubmittingFinal(true);
    setSyncStatus("Merekam tanda tangan...");
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        alert("Mohon goreskan tanda tangan PIC terlebih dahulu.");
        setSubmittingFinal(false);
        return;
      }
      const signatureDataUrl = canvas.toDataURL("image/png");

      const res = await fetch(`/api/orders/${serviceOrderId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureDataUrl,
          signerName,
          rating: 5,
          feedback: "Pekerjaan rapi dan tepat waktu.",
        }),
      });

      if (res.ok) {
        setSyncStatus("Order selesai tervalidasi");
        setStep("done");
      } else {
        alert("Gagal menyelesaikan order di server.");
      }
    } catch (err) {
      console.error("Failed to complete order:", err);
    } finally {
      setSubmittingFinal(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {activeUnitTag}
              </span>
              <span className="text-xs text-slate-500">Daikin Inverter 2.0 PK</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Pengerjaan Servis: PT. Mega Solusi Finansial
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              Lantai 2 - Ruang Server (Siklus Rutin 1 Bulan)
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {syncStatus}
            </span>
          </div>
        </div>

        {/* Steps Breadcrumbs */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-200 text-center">
          <button
            onClick={() => setStep("inspect")}
            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
              step === "inspect"
                ? "bg-blue-50 border-blue-300 text-blue-700 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            1. Foto Bukti
          </button>
          <button
            onClick={() => setStep("measure")}
            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
              step === "measure"
                ? "bg-blue-50 border-blue-300 text-blue-700 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            2. Parameter PSI
          </button>
          <button
            onClick={() => setStep("signature")}
            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
              step === "signature"
                ? "bg-blue-50 border-blue-300 text-blue-700 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            3. Tanda Tangan
          </button>
          <button
            onClick={() => setStep("done")}
            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
              step === "done"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            4. Selesai
          </button>
        </div>
      </section>

      {/* Step 1: Photos Evidence */}
      {step === "inspect" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              Upload Bukti Foto Kondisi (Before & After)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Foto dikompresi otomatis di sisi browser teknisi dan disimpan aman ke Cloudflare R2 bucket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Foto SEBELUM Dikerjakan</span>
                <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Pilih Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadPhoto("before", e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              {beforePhoto ? (
                <div className="relative rounded-lg overflow-hidden h-44 border border-slate-200">
                  <img src={beforePhoto} alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white">
                    Filter Kotor & Evaporator Berdebu
                  </span>
                </div>
              ) : (
                <div className="h-44 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-xs text-slate-500">
                  <Upload className="w-6 h-6 mb-1 text-slate-600" />
                  Ambil Foto Kondisi Awal
                </div>
              )}
            </div>

            {/* After Photo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Foto SESUDAH Dikerjakan</span>
                <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Pilih Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadPhoto("after", e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              {afterPhoto ? (
                <div className="relative rounded-lg overflow-hidden h-44 border border-slate-200">
                  <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-blue-900/80 text-[10px] text-white border border-blue-400/30">
                    Evaporator Bersih & Aliran Lancar
                  </span>
                </div>
              ) : (
                <div className="h-44 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-xs text-slate-500">
                  <Upload className="w-6 h-6 mb-1 text-slate-600" />
                  Ambil Foto Hasil Pembersihan
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep("measure")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-xs"
            >
              Lanjut ke Pengukuran Parameter ➔
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Measurements */}
      {step === "measure" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              Input Parameter Teknis & Hasil Diagnosa
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Catatan komparasi sebelum vs sesudah servis untuk dicetak di lembar laporan pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PSI Pressure */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                <Gauge className="w-4 h-4" />
                Tekanan Freon (PSI)
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Sebelum Servis</label>
                <input
                  type="text"
                  value={beforePsi}
                  onChange={(e) => setBeforePsi(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Sesudah Servis</label>
                <input
                  type="text"
                  value={afterPsi}
                  onChange={(e) => setAfterPsi(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-blue-600 font-bold"
                />
              </div>
            </div>

            {/* Current Ampere */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Zap className="w-4 h-4" />
                Beban Arus (Ampere)
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Sebelum Servis</label>
                <input
                  type="text"
                  value={beforeAmp}
                  onChange={(e) => setBeforeAmp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Sesudah Servis</label>
                <input
                  type="text"
                  value={afterAmp}
                  onChange={(e) => setAfterAmp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-blue-600 font-bold"
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <Thermometer className="w-4 h-4" />
                Suhu Hembusan (°C)
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Sebelum Servis</label>
                <input
                  type="text"
                  value={beforeTemp}
                  onChange={(e) => setBeforeTemp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Sesudah Servis</label>
                <input
                  type="text"
                  value={afterTemp}
                  onChange={(e) => setAfterTemp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-blue-600 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep("inspect")}
              className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900"
            >
              ← Kembali
            </button>
            <button
              onClick={handleSaveMeasurements}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-xs"
            >
              Simpan & Lanjut ke Persetujuan PIC ➔
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Signature */}
      {step === "signature" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              Tanda Tangan Digital & Approval PIC Pelanggan
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              PIC kantor menandatangani langsung di layar HP teknisi untuk memvalidasi pengerjaan telah selesai.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Terang Penandatangan (PIC)
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* HTML5 Signature Canvas */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Tanda Tangan PIC Pelanggan:</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700"
                >
                  Hapus Tanda Tangan
                </button>
              </div>

              <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 touch-none cursor-crosshair bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center">Goreskan tanda tangan di atas kotak putih</p>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep("measure")}
              className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900"
            >
              ← Kembali
            </button>
            <button
              onClick={handleCompleteOrder}
              disabled={!signed || submittingFinal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submittingFinal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Selesaikan Order Servis & Simpan Bukti ➔
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Servis Sukses & Tersimpan ke Edge</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Bukti foto telah terunggah ke Cloudflare R2, status unit diubah ke ACTIVE, dan faktur PDF siap diterbitkan otomatis via email.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setStep("inspect")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm"
            >
              Lihat Detail Rekap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
