import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Printer, Sliders, CheckSquare, Square, Info } from "lucide-react";

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
  const [startOffset, setStartOffset] = useState<number>(0); // 0-indexed cell offset
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({});

  // Preset units to print
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
      assetTag: "AC-MSF-LOB-02",
      brand: "Panasonic Cassette",
      capacityPk: 3.0,
      customerName: "PT. Mega Solusi",
      zoneName: "Lobby Utama Lt. 1",
    },
    {
      id: "ac_3",
      assetTag: "AC-MSF-DIR-03",
      brand: "Sharp Plasmacluster",
      capacityPk: 1.5,
      customerName: "PT. Mega Solusi",
      zoneName: "Ruang Direktur",
    },
    {
      id: "ac_4",
      assetTag: "AC-MSF-MTG-04",
      brand: "Daikin Multi-S",
      capacityPk: 2.5,
      customerName: "PT. Mega Solusi",
      zoneName: "Ruang Meeting A",
    },
    {
      id: "ac_5",
      assetTag: "AC-MSF-OPS-05",
      brand: "Gree Inverter",
      capacityPk: 1.0,
      customerName: "PT. Mega Solusi",
      zoneName: "Area Operasional",
    },
  ]);

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([
    "ac_1",
    "ac_2",
    "ac_3",
    "ac_4",
    "ac_5",
  ]);

  // Generate QR Code images
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

  // Tom & Jerry specs
  // TJ108: 5 columns x 8 rows = 40 labels per sheet (approx 38mm x 18mm)
  // TJ103: 3 columns x 4 rows = 12 labels per sheet (approx 64mm x 32mm)
  const totalSlots = template === "TJ108" ? 40 : 12;
  const gridColsClass = template === "TJ108" ? "grid-cols-5" : "grid-cols-3";

  const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id));

  // Build grid items considering start offset
  const gridItems: (PrintableUnit | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    gridItems.push(null); // empty cells to skip used stickers
  }
  selectedUnits.forEach((u) => gridItems.push(u));
  while (gridItems.length < totalSlots) {
    gridItems.push(null);
  }

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden when printing) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-400" />
              Generator & Cetak Stiker Tom & Jerry
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Cetak label barcode unik unit AC ke kertas stiker Tom & Jerry standar dengan offset agar stiker sisa tidak terbuang.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20"
          >
            <Printer className="w-4 h-4" />
            Cetak Label (Ctrl + P)
          </button>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Ukuran Stiker Tom & Jerry
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplate("TJ108")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  template === "TJ108"
                    ? "bg-teal-500/10 border-teal-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-xs font-bold">No. 108</div>
                <div className="text-[10px] text-slate-400">38 x 18 mm (40 Stiker/Lembar)</div>
              </button>

              <button
                type="button"
                onClick={() => setTemplate("TJ103")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  template === "TJ103"
                    ? "bg-teal-500/10 border-teal-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-xs font-bold">No. 103</div>
                <div className="text-[10px] text-slate-400">64 x 32 mm (12 Stiker/Lembar)</div>
              </button>
            </div>
          </div>

          {/* Start Grid Offset */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Mulai dari Kotak Stiker Ke-</span>
              <span className="text-teal-400 font-mono text-xs font-bold">{startOffset + 1}</span>
            </label>
            <input
              type="range"
              min={0}
              max={totalSlots - 1}
              value={startOffset}
              onChange={(e) => setStartOffset(parseInt(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Lewati stiker yang sudah terpakai di lembaran Anda.
            </p>
          </div>

          {/* Select Units */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilih Unit AC ({selectedUnits.length}/{units.length})
            </label>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-2">
              {units.map((u) => {
                const checked = selectedUnitIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleSelect(u.id)}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800/80 cursor-pointer text-xs"
                  >
                    {checked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span className="font-mono text-slate-300">{u.assetTag}</span>
                    <span className="text-[11px] text-slate-500 truncate">- {u.zoneName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sheet Preview & Printable Area */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
        <h3 className="no-print text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Lembar Pratinjau Cetak (Ukuran A4 Standar)
        </h3>

        {/* Printable Sheet Canvas */}
        <div
          className={`mx-auto bg-white text-black p-4 shadow-2xl rounded-sm grid ${gridColsClass} gap-2 w-full max-w-[800px] min-h-[550px] border border-slate-300`}
        >
          {gridItems.map((item, idx) => {
            if (!item) {
              return (
                <div
                  key={`blank_${idx}`}
                  className="border border-dashed border-slate-200 rounded p-2 flex flex-col items-center justify-center text-[10px] text-slate-300"
                >
                  <span className="no-print font-mono text-[9px]">#{idx + 1} Kosong</span>
                </div>
              );
            }

            const qrUrl = qrCodeDataUrls[item.id];

            return (
              <div
                key={`label_${item.id}_${idx}`}
                className="border border-slate-400 rounded p-1.5 flex items-center justify-between gap-1 overflow-hidden bg-white"
              >
                <div className="flex-1 min-w-0 pr-1">
                  <div className="text-[9px] font-bold tracking-tight text-slate-800 leading-tight truncate">
                    {item.customerName}
                  </div>
                  <div className="text-[10px] font-black font-mono text-black leading-tight truncate mt-0.5">
                    {item.assetTag}
                  </div>
                  <div className="text-[8px] text-slate-600 leading-tight truncate">
                    {item.brand} • {item.capacityPk} PK
                  </div>
                  <div className="text-[7.5px] text-slate-500 leading-tight truncate">
                    {item.zoneName}
                  </div>
                </div>

                {qrUrl && (
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    <img src={qrUrl} alt={item.assetTag} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
