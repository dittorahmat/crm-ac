import React, { useState, useEffect } from "react";
import { Building2, MapPin, Layers, Cpu, Plus, CheckCircle2, ChevronRight, Hash, Eye, QrCode } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  picName: string;
  picPhone: string;
  picEmail: string;
  defaultServiceIntervalMonths: number;
}

interface ACUnit {
  id: string;
  customerId: string;
  locationId: string;
  zoneId: string;
  assetTag: string;
  brand: string;
  modelNumber: string;
  capacityPk: number;
  refrigerantType: string;
  serviceIntervalMonths: number;
  status: string;
  lastHealthScore?: number;
  lastServiceDate?: string;
}

export function CustomerAssetsView({ onInspectUnit }: { onInspectUnit?: (tag: string) => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [units, setUnits] = useState<ACUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  const [newTag, setNewTag] = useState("");
  const [newBrand, setNewBrand] = useState("Daikin Inverter");
  const [newPk, setNewPk] = useState("1.5");
  const [newInterval, setNewInterval] = useState("3");

  // Fetch real live customers and units from Cloudflare D1
  useEffect(() => {
    async function loadData() {
      try {
        const custRes = await fetch("/api/customers");
        if (custRes.ok) {
          const custList = await custRes.json();
          if (Array.isArray(custList) && custList.length > 0) {
            setCustomers(custList);
            setSelectedCustomerId(custList[0].id);
          }
        }

        const unitsRes = await fetch("/api/ac-units");
        if (unitsRes.ok) {
          const unitsList = await unitsRes.json();
          if (Array.isArray(unitsList) && unitsList.length > 0) {
            setUnits(unitsList.map((u: any) => ({
              ...u,
              lastHealthScore: 95,
              lastServiceDate: "23 Okt 2026",
            })));
          }
        }
      } catch (e) {
        console.error("Failed to load D1 customers, falling back to local cache", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fallback defaults if D1 is empty
  const activeCustomers = customers.length > 0 ? customers : [
    {
      id: "cust_1",
      name: "PT. Mega Solusi Finansial",
      picName: "Bpk. Rahmat Hidayat",
      picPhone: "081288992211",
      picEmail: "procurement@megasolusi.co.id",
      defaultServiceIntervalMonths: 3,
    },
    {
      id: "cust_2",
      name: "CV. Digital Niaga Nusantara",
      picName: "Ibu Linda Wijaya",
      picPhone: "081399887766",
      picEmail: "ga@digitalniaga.id",
      defaultServiceIntervalMonths: 3,
    },
  ];

  const activeCustomerId = selectedCustomerId || (activeCustomers[0] ? activeCustomers[0].id : "cust_1");
  const selectedCustomer = activeCustomers.find((c) => c.id === activeCustomerId);

  const activeUnits = units.length > 0 ? units : [
    {
      id: "ac_1",
      customerId: "cust_1",
      locationId: "loc_1",
      zoneId: "zone_1",
      assetTag: "AC-MSF-SRV-01",
      brand: "Daikin Inverter",
      modelNumber: "FTKC25TV",
      capacityPk: 2.0,
      refrigerantType: "R32",
      serviceIntervalMonths: 1,
      status: "active",
      lastHealthScore: 96,
      lastServiceDate: "23 Okt 2026",
    },
    {
      id: "ac_2",
      customerId: "cust_1",
      locationId: "loc_1",
      zoneId: "zone_2",
      assetTag: "AC-MSF-WRK-02",
      brand: "Panasonic Inverter",
      modelNumber: "CS-XU18XKP",
      capacityPk: 2.0,
      refrigerantType: "R32",
      serviceIntervalMonths: 3,
      status: "active",
      lastHealthScore: 92,
      lastServiceDate: "10 Sep 2026",
    },
    {
      id: "ac_3",
      customerId: "cust_1",
      locationId: "loc_1",
      zoneId: "zone_3",
      assetTag: "AC-MSF-LOB-03",
      brand: "Panasonic Cassette",
      modelNumber: "S-24PU2H5",
      capacityPk: 3.0,
      refrigerantType: "R410A",
      serviceIntervalMonths: 3,
      status: "active",
      lastHealthScore: 94,
      lastServiceDate: "15 Agu 2026",
    },
  ];

  const filteredUnits = activeUnits.filter((u) => u.customerId === activeCustomerId);

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    const payload = {
      customerId: activeCustomerId,
      locationId: "loc_1",
      zoneId: "zone_1",
      assetTag: newTag.toUpperCase(),
      brand: newBrand,
      modelNumber: "STANDARD-MOD",
      capacityPk: parseFloat(newPk),
      refrigerantType: "R32",
      serviceIntervalMonths: parseInt(newInterval),
      status: "active",
    };

    try {
      await fetch("/api/ac-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(err);
    }

    const newUnit: ACUnit = {
      id: `ac_${Date.now()}`,
      ...payload,
      lastHealthScore: 100,
      lastServiceDate: "Baru Diinstal",
    };

    setUnits([newUnit, ...activeUnits]);
    setNewTag("");
    setShowAddUnitModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Manajemen Customer & Aset AC B2B
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Identitas Barcode AC terhubung langsung dengan Customer, lokasi gedung, spesifikasi teknis, kondisi terkini, dan riwayat servis.
          </p>
        </div>
        <button
          onClick={() => setShowAddUnitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Registrasi Unit AC Baru
        </button>
      </div>

      {/* Hierarchy Explorer Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Customer List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Customer Korporat
            </h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{activeCustomers.length} Kontrak Aktif</span>
          </div>

          <div className="space-y-2">
            {activeCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeCustomerId === c.id
                    ? "bg-blue-50/70 border-blue-300 shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                  <ChevronRight
                    className={`w-4 h-4 mt-0.5 transition-transform ${
                      activeCustomerId === c.id ? "text-blue-600 rotate-90" : "text-slate-400"
                    }`}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <p>PIC: <span className="text-slate-700 font-medium">{c.picName}</span> ({c.picPhone})</p>
                  <p>Email: <span className="text-slate-700">{c.picEmail}</span></p>
                  <p className="text-[11px] font-medium text-blue-600">Siklus Servis: {c.defaultServiceIntervalMonths} Bulan</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 & 3: AC Units inside Selected Customer */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{selectedCustomer?.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-normal">
                  {filteredUnits.length} Unit Terpasang
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lokasi: Gedung Wisma Sudirman Lt. 2 & 8, Jakarta Pusat
              </p>
            </div>
          </div>

          {/* AC Unit Table */}
          <div className="space-y-3">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                        {unit.assetTag}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">{unit.brand}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      <span>Kapasitas: <strong className="text-slate-700">{unit.capacityPk} PK</strong></span>
                      <span>Freon: <strong className="text-slate-700">{unit.refrigerantType}</strong></span>
                      <span>Servis Terakhir: <strong className="text-slate-700">{unit.lastServiceDate}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Kondisi: {unit.lastHealthScore}% Prima
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Siklus: Tiap {unit.serviceIntervalMonths} Bln</p>
                  </div>

                  <button
                    onClick={() => onInspectUnit && onInspectUnit(unit.assetTag)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Buka Riwayat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Registrasi Unit AC Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Customer: <span className="text-blue-600 font-semibold">{selectedCustomer?.name}</span>
            </p>

            <form onSubmit={handleAddUnit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Kode Asset / Tag Barcode</label>
                <input
                  type="text"
                  placeholder="Contoh: AC-MSF-FL3-01"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Merk / Tipe</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Daikin Inverter">Daikin Inverter</option>
                    <option value="Panasonic Cassette">Panasonic Cassette</option>
                    <option value="Sharp Plasmacluster">Sharp Plasmacluster</option>
                    <option value="Gree Floor Standing">Gree Floor Standing</option>
                    <option value="Mitsubishi Heavy Duty">Mitsubishi Heavy Duty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kapasitas (PK)</label>
                  <select
                    value={newPk}
                    onChange={(e) => setNewPk(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="0.5">0.5 PK</option>
                    <option value="1.0">1.0 PK</option>
                    <option value="1.5">1.5 PK</option>
                    <option value="2.0">2.0 PK</option>
                    <option value="3.0">3.0 PK</option>
                    <option value="5.0">5.0 PK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Siklus Servis Rutin</label>
                <select
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="1">Setiap 1 Bulan (Ruang Server / Zona Kritis)</option>
                  <option value="2">Setiap 2 Bulan (Zona Padat / Restoran)</option>
                  <option value="3">Setiap 3 Bulan (Standar Kantor B2B)</option>
                  <option value="4">Setiap 4 Bulan (Ruang Meeting Sedang)</option>
                  <option value="6">Setiap 6 Bulan (Zona Rendah Beban)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                >
                  Simpan Aset AC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
