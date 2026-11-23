import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { parseAssetTagFromUrl, triggerScanSuccessFeedback } from "../lib/scanner";
import { 
  Camera, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  Layers, 
  Building2, 
  MapPin, 
  Cpu, 
  Sparkles,
  ArrowRight
} from "lucide-react";

interface ACUnitSummary {
  id: string;
  assetTag: string;
  brand: string;
  capacityPk: number;
  customerName: string;
  zoneName: string;
  locationName: string;
}

interface BarcodeScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTag: (assetTag: string) => void;
  userRole?: string;
}

export function BarcodeScanModal({ isOpen, onClose, onSelectTag, userRole = "admin" }: BarcodeScanModalProps) {
  const [activeMode, setActiveMode] = useState<"camera" | "picker">("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraScanning, setCameraScanning] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null);

  // D1 Units Picker State
  const [units, setUnits] = useState<ACUnitSummary[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const scannerRefId = "html5-qrcode-reader";

  // Fetch live units from D1 when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadUnits() {
      setLoadingUnits(true);
      try {
        const res = await fetch("/api/ac-units");
        if (res.ok) {
          const data = (await res.json()) as ACUnitSummary[];
          if (Array.isArray(data)) {
            setUnits(data.map((u) => ({
              id: u.id,
              assetTag: u.assetTag,
              brand: u.brand,
              capacityPk: u.capacityPk || 1.0,
              customerName: u.customerName || "Pelanggan",
              zoneName: u.zoneName || "Ruang Operasional",
              locationName: u.locationName || "Gedung",
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load AC units from D1:", err);
      } finally {
        setLoadingUnits(false);
      }
    }

    loadUnits();
  }, [isOpen]);

  // Clean-up scanner helper
  const stopScanner = async () => {
    if (scannerInstance && scannerInstance.isScanning) {
      try {
        await scannerInstance.stop();
        scannerInstance.clear();
      } catch (e) {
        console.error("Error stopping QR scanner:", e);
      }
    }
    setCameraScanning(false);
    setScannerInstance(null);
  };

  // Start Camera Scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      const scanner = new Html5Qrcode(scannerRefId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
        ],
        verbose: false,
      });

      setScannerInstance(scanner);

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Robust tag extraction and sensory feedback
          const tag = parseAssetTagFromUrl(decodedText);
          triggerScanSuccessFeedback();

          // Stop scanner and trigger selection
          scanner.stop().then(() => {
            scanner.clear();
            setCameraScanning(false);
            onSelectTag(tag);
            onClose();
          });
        },
        () => {
          // Silent frame scan error
        }
      );

      setCameraScanning(true);
    } catch (err: any) {
      console.error("Failed to start camera scanner:", err);
      setCameraError(
        err.message?.includes("NotAllowedError")
          ? "Izin akses kamera ditolak. Silakan izinkan kamera di browser atau gunakan tab 'Pilih dari Database AC D1'."
          : "Kamera tidak terdeteksi atau tidak didukung di perangkat ini. Silakan gunakan tab 'Pilih dari Database AC D1'."
      );
      setCameraScanning(false);
    }
  };

  // Handle mode switch or modal open/close
  useEffect(() => {
    if (isOpen && activeMode === "camera") {
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  if (!isOpen) return null;

  const filteredUnits = units.filter(
    (u) =>
      u.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="barcode-scanner-title"
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 id="barcode-scanner-title" className="text-base font-bold text-slate-900 tracking-tight">
                Scan Barcode & QR Code Unit AC
              </h3>
              <p className="text-xs text-slate-500">
                Arahkan kamera ke stiker Tom & Jerry unit AC atau pilih dari database D1
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Bar */}
        <div className="px-5 pt-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveMode("camera")}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeMode === "camera"
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Kamera Riil (Live Scan)</span>
            </button>
            <button
              onClick={() => setActiveMode("picker")}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeMode === "picker"
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Database AC D1 ({units.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeMode === "camera" ? (
            <div className="space-y-4">
              {/* WebRTC Viewfinder Box */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square max-w-[320px] mx-auto border-2 border-slate-800 flex flex-col items-center justify-center text-white">
                <div id={scannerRefId} className="w-full h-full" />
                
                {cameraScanning && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                    <div className="w-48 h-48 border-2 border-dashed border-blue-400 rounded-2xl animate-pulse flex items-center justify-center bg-blue-500/5">
                      <span className="text-[11px] font-mono text-blue-200 bg-slate-950/70 px-2 py-0.5 rounded-full border border-blue-400/40">
                        Posisikan QR di dalam kotak
                      </span>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900/95 space-y-3 z-10">
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{cameraError}</p>
                    <button
                      onClick={() => setActiveMode("picker")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Buka Database AC D1
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-800">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Hasil scan otomatis mendeteksi URL paspor aset (misal: <code>https://.../ac/AC-MSF-SRV-01</code>) dan mengarahkan langsung ke sistem {userRole === "technician" ? "Pengerjaan Servis Lapangan" : "Paspor Aset"}.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search Bar for D1 Units */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Asset Tag, Pelanggan, atau Ruang..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Units List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {loadingUnits ? (
                  <div className="py-8 text-center text-xs text-slate-500">Memuat unit AC dari D1...</div>
                ) : filteredUnits.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">Tidak ada unit AC yang cocok.</div>
                ) : (
                  filteredUnits.map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => {
                        onSelectTag(unit.assetTag);
                        onClose();
                      }}
                      className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 rounded-xl transition-all cursor-pointer flex items-center justify-between group interactive-card"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                            {unit.assetTag}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{unit.brand} ({unit.capacityPk} PK)</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {unit.customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {unit.zoneName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Pilih</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Target Routing: <strong>{userRole === "technician" ? "Alur Servis Lapangan" : "Paspor Detail AC"}</strong></span>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
