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
  Loader2,
  Maximize2,
  X
} from "lucide-react";

interface FieldTrackingViewProps {
  initialUnitTag?: string;
}

// Reusable Touch-Optimized Number Stepper Input (Min 48px touch targets)
interface NumberStepperInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  step: number;
  decimals?: number;
  highlight?: boolean;
}

function NumberStepperInput({
  label,
  value,
  onChange,
  step,
  decimals = 0,
  highlight = false,
}: NumberStepperInputProps) {
  const handleStep = (direction: 1 | -1) => {
    const current = parseFloat(value) || 0;
    const next = Math.max(0, current + direction * step);
    onChange(decimals > 0 ? next.toFixed(decimals) : String(Math.round(next)));
  };

  return (
    <div>
      <label className="text-[10px] text-slate-500 font-medium">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 min-h-[48px] ${
            highlight ? "text-blue-600 font-bold" : "text-slate-900"
          }`}
        />
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            aria-label={`Kurangi ${label}`}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-lg shadow-sm active:scale-95 transition-all"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            aria-label={`Tambah ${label}`}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-lg shadow-sm active:scale-95 transition-all"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// Canvas touch/mouse coordinate helper with scale compensation
function getCanvasCoordinates(
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
) {
  const rect = canvas.getBoundingClientRect();
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
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
  const [showFullSignatureModal, setShowFullSignatureModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // Canvas drawing handlers with scaling compensation
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    targetCanvas: HTMLCanvasElement | null = canvasRef.current
  ) => {
    isDrawingRef.current = true;
    if (!targetCanvas) return;
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoordinates(e, targetCanvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    targetCanvas: HTMLCanvasElement | null = canvasRef.current
  ) => {
    if (!isDrawingRef.current || !targetCanvas) return;
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoordinates(e, targetCanvas);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigned(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = (targetCanvas: HTMLCanvasElement | null = canvasRef.current) => {
    if (!targetCanvas) return;
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
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
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-blue-600 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" />
                  Tekanan Freon (PSI)
                </span>
                <span className="text-[10px] bg-blue-100/70 text-blue-700 px-1.5 py-0.5 rounded font-mono">R32 / R410A</span>
              </div>
              <NumberStepperInput
                label="Sebelum Servis"
                value={beforePsi}
                onChange={setBeforePsi}
                step={5}
              />
              <NumberStepperInput
                label="Sesudah Servis"
                value={afterPsi}
                onChange={setAfterPsi}
                step={5}
                highlight
              />
            </div>

            {/* Current Ampere */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-amber-500 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Beban Arus (Ampere)
                </span>
                <span className="text-[10px] bg-amber-100/70 text-amber-700 px-1.5 py-0.5 rounded font-mono">Clamp Meter</span>
              </div>
              <NumberStepperInput
                label="Sebelum Servis"
                value={beforeAmp}
                onChange={setBeforeAmp}
                step={0.2}
                decimals={1}
              />
              <NumberStepperInput
                label="Sesudah Servis"
                value={afterAmp}
                onChange={setAfterAmp}
                step={0.2}
                decimals={1}
                highlight
              />
            </div>

            {/* Temperature */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-blue-600 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4" />
                  Suhu Hembusan (°C)
                </span>
                <span className="text-[10px] bg-blue-100/70 text-blue-700 px-1.5 py-0.5 rounded font-mono">Anemometer</span>
              </div>
              <NumberStepperInput
                label="Sebelum Servis"
                value={beforeTemp}
                onChange={setBeforeTemp}
                step={1}
              />
              <NumberStepperInput
                label="Sesudah Servis"
                value={afterTemp}
                onChange={setAfterTemp}
                step={1}
                highlight
              />
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFullSignatureModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 sm:hidden flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Layar Penuh
                  </button>
                  <button
                    type="button"
                    onClick={() => clearCanvas(canvasRef.current)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={160}
                  onMouseDown={(e) => startDrawing(e, canvasRef.current)}
                  onMouseMove={(e) => draw(e, canvasRef.current)}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => startDrawing(e, canvasRef.current)}
                  onTouchMove={(e) => draw(e, canvasRef.current)}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 touch-none cursor-crosshair bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center">Goreskan tanda tangan di atas kotak putih (atau buka Layar Penuh di HP)</p>
            </div>
          </div>

          {/* Fullscreen Dedicated Signature Modal for Mobile */}
          {showFullSignatureModal && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Modal Tanda Tangan Digital Layar Penuh"
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in"
            >
              <div className="bg-white w-full max-w-xl mx-auto rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">Tanda Tangan Digital PIC (Layar Penuh)</h4>
                  </div>
                  <button
                    onClick={() => setShowFullSignatureModal(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <canvas
                    ref={modalCanvasRef}
                    width={700}
                    height={260}
                    onMouseDown={(e) => startDrawing(e, modalCanvasRef.current)}
                    onMouseMove={(e) => draw(e, modalCanvasRef.current)}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => startDrawing(e, modalCanvasRef.current)}
                    onTouchMove={(e) => draw(e, modalCanvasRef.current)}
                    onTouchEnd={stopDrawing}
                    className="w-full h-56 touch-none cursor-crosshair bg-white rounded-xl border border-slate-300 shadow-inner"
                  />
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    Goreskan tanda tangan PIC pada kanvas leluasa di atas
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => clearCanvas(modalCanvasRef.current)}
                    className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                  >
                    Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Copy modal canvas to main canvas
                      const modalCanvas = modalCanvasRef.current;
                      const mainCanvas = canvasRef.current;
                      if (modalCanvas && mainCanvas) {
                        const mainCtx = mainCanvas.getContext("2d");
                        if (mainCtx) {
                          mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
                          mainCtx.drawImage(modalCanvas, 0, 0, mainCanvas.width, mainCanvas.height);
                          setSigned(true);
                        }
                      }
                      setShowFullSignatureModal(false);
                    }}
                    className="min-h-[48px] flex-1 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-95"
                  >
                    Simpan Tanda Tangan
                  </button>
                </div>
              </div>
            </div>
          )}

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
