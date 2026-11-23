import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Printer, CheckSquare, Square, Info, Layers, Sparkles } from "lucide-react";

interface PrintableUnit {
  id: string;
  assetTag: string;
  brand: string;
  capacityPk: number;
  customerName: string;
  zoneName: string;
}

export function BarcodePrintView() {
  const [template, setTemplate] = useState<"TJ108" | "TJ103">("TJ108");
  const [startOffset, setStartOffset] = useState<number>(0);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({});

  const [units] = useState<PrintableUnit[]>([
    {
      id: "ac_1",
      assetTag: "AC-MSF-SRV-01",
      brand: "Daikin Inverter",
      capacityPk: 2.0,
      customerName: "PT. Mega Solusi",
      zoneName: "Lt. 2 Ruang Server",
    },
    {
      id: "ac_2",
      assetTag: "AC-MSF-WRK-02",
      brand: "Panasonic Inverter",
      capacityPk: 2.0,
      customerName: "PT. Mega Solusi",
      zoneName: "Lt. 8 Workstation",
    },
    {
      id: "ac_3",
      assetTag: "AC-MSF-LOB-03",
      brand: "Panasonic Cassette",
      capacityPk: 3.0,
      customerName: "PT. Mega Solusi",
      zoneName: "Lobby Utama Lt. 1",
    },
    {
      id: "ac_4",
      assetTag: "AC-DNN-OPS-01",
      brand: "Sharp Plasmacluster",
      capacityPk: 1.5,
      customerName: "CV. Digital Niaga",
      zoneName: "Head Office Tebet",
    },
    {
      id: "ac_5",
      assetTag: "AC-STG-BDR-01",
      brand: "Daikin Multi-S",
      capacityPk: 3.0,
      customerName: "PT. Surya Teknologi",
      zoneName: "Graha Mandiri Lt. 12",
    },
  ]);

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([
    "ac_1",
    "ac_2",
    "ac_3",
    "ac_4",
    "ac_5",
  ]);

  useEffect(() => {
    async function generateQrs() {
      const urls: Record<string, string> = {};
      for (const u of units) {
        try {
          const directUrl = `${window.location.origin}/ac/${encodeURIComponent(u.assetTag)}`;
          const dataUrl = await QRCode.toDataURL(directUrl, {
            margin: 1,
            width: 140,
            color: { dark: "#000000", light: "#ffffff" },
          });
          urls[u.id] = dataUrl;
        } catch (e) {
          console.error(e);
        }
      }
      setQrCodeDataUrls(urls);
    }
    generateQrs();
  }, [units]);

  const toggleSelect = (id: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const totalSlots = template === "TJ108" ? 40 : 12;
  const gridColsClass = template === "TJ108" ? "grid-cols-5" : "grid-cols-3";
  const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id));

  const gridItems: (PrintableUnit | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    gridItems.push(null);
  }
  selectedUnits.forEach((u) => gridItems.push(u));
  while (gridItems.length < totalSlots) {
    gridItems.push(null);
  }

  return (
    <div className="space-y-8">
      {/* Control Panel (Hidden when printing) */}
      <section className="no-print bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Die-Cut Label Calibration Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              Generator & Cetak Stiker Tom & Jerry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Konfigurasi layout lembar stiker Tom & Jerry standar dengan offset baris/kolom agar stiker sisa tidak terbuang.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-xs interactive-button shrink-0"
          >
            <Printer className="w-4 h-4" />
            Cetak Label Fisik (Ctrl + P)
          </button>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Format Kertas Stiker Tom & Jerry
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTemplate("TJ108")}
                className={`p-3.5 rounded-2xl border text-left transition-all interactive-card ${
                  template === "TJ108"
                    ? "bg-blue-50/80 border-blue-400 text-blue-950 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="text-sm font-extrabold text-slate-900">No. 108</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">38 x 18 mm (40 Stiker)</div>
              </button>

              <button
                type="button"
                onClick={() => setTemplate("TJ103")}
                className={`p-3.5 rounded-2xl border text-left transition-all interactive-card ${
                  template === "TJ103"
                    ? "bg-blue-50/80 border-blue-400 text-blue-950 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="text-sm font-extrabold text-slate-900">No. 103</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">64 x 32 mm (12 Stiker)</div>
              </button>
            </div>
          </div>

          {/* Start Grid Offset */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Mulai Cetak dari Stiker Ke-</span>
              <span className="text-blue-600 font-mono text-sm font-extrabold">#{startOffset + 1}</span>
            </label>
            <input
              type="range"
              min={0}
              max={totalSlots - 1}
              value={startOffset}
              onChange={(e) => setStartOffset(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              Menghemat kertas dengan melewati kotak stiker yang sudah terpakai sebelumnya.
            </p>
          </div>

          {/* Select Units */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Unit AC ({selectedUnits.length}/{units.length})
            </label>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-2">
              {units.map((u) => {
                const checked = selectedUnitIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleSelect(u.id)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs hover:border-slate-300 transition-all"
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-mono font-bold text-slate-900">{u.assetTag}</span>
                    <span className="text-[11px] text-slate-500 truncate">- {u.zoneName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Realistic Physical Sheet Preview (Paper Tabletop Simulation) */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 overflow-x-auto shadow-sm">
        <div className="no-print flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Pratinjau Lembar Fisik Tom & Jerry A4 (Skala Millimeter 1:1)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kotak bergaris putus-putus menunjukkan stiker kosong yang dilewati sesuai offset yang Anda atur.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {selectedUnits.length} Stiker Aktif
          </span>
        </div>

        {/* The Physical Sheet Canvas */}
        <div className="pt-6 flex justify-center">
          <div
            className={`bg-[#fafaf9] text-black p-6 shadow-2xl rounded-sm grid ${gridColsClass} gap-2.5 w-full max-w-[850px] min-h-[600px] border border-slate-400/80`}
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)" }}
          >
            {gridItems.map((item, idx) => {
              if (!item) {
                return (
                  <div
                    key={`blank_${idx}`}
                    className="border border-dashed border-slate-300 rounded p-2 flex flex-col items-center justify-center text-[10px] text-slate-400/70 select-none"
                  >
                    <span className="no-print font-mono text-[9px]">#{idx + 1} Kosong</span>
                  </div>
                );
              }

              const qrUrl = qrCodeDataUrls[item.id];

              return (
                <div
                  key={`label_${item.id}_${idx}`}
                  className="border border-slate-500/90 rounded p-2 flex items-center justify-between gap-1 overflow-hidden bg-white shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-[9px] font-extrabold tracking-tight text-slate-900 leading-tight truncate">
                      {item.customerName}
                    </div>
                    <div className="text-[10px] font-black font-mono text-black leading-tight truncate mt-0.5">
                      {item.assetTag}
                    </div>
                    <div className="text-[8px] text-slate-700 leading-tight truncate font-medium">
                      {item.brand} • {item.capacityPk} PK
                    </div>
                    <div className="text-[7.5px] text-slate-500 leading-tight truncate">
                      {item.zoneName}
                    </div>
                  </div>

                  {qrUrl && (
                    <div className="w-11 h-11 shrink-0 flex items-center justify-center">
                      <img src={qrUrl} alt={item.assetTag} className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
