import React, { useState } from "react";
import { Building2, MapPin, Layers, Cpu, Plus, CheckCircle2, ChevronRight, Hash } from "lucide-react";

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
}

export function CustomerAssetsView() {
  // Sample enterprise customers
  const [customers, setCustomers] = useState<Customer[]>([
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
  ]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("cust_1");
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  const [units, setUnits] = useState<ACUnit[]>([
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
      serviceIntervalMonths: 1, // Server room needs monthly maintenance
      status: "active",
    },
    {
      id: "ac_2",
      customerId: "cust_1",
      locationId: "loc_1",
      zoneId: "zone_2",
      assetTag: "AC-MSF-LOB-02",
      brand: "Panasonic Cassette",
      modelNumber: "S-24PU2H5",
      capacityPk: 3.0,
      refrigerantType: "R410A",
      serviceIntervalMonths: 3,
      status: "active",
    },
  ]);

  const [newTag, setNewTag] = useState("");
  const [newBrand, setNewBrand] = useState("Daikin Inverter");
  const [newPk, setNewPk] = useState("1.5");
  const [newInterval, setNewInterval] = useState("3");

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const filteredUnits = units.filter((u) => u.customerId === selectedCustomerId);

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    const newUnit: ACUnit = {
      id: `ac_${Date.now()}`,
      customerId: selectedCustomerId,
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

    setUnits([newUnit, ...units]);
    setNewTag("");
    setShowAddUnitModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-400" />
            Manajemen Klien & Aset AC B2B
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Kelola hierarki Customer (PT) ➔ Gedung (Location) ➔ Ruangan (Zone) ➔ Unit AC Fisik
          </p>
        </div>
        <button
          onClick={() => setShowAddUnitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-teal-500/10"
        >
          <Plus className="w-4 h-4" />
          Registrasi Unit AC Baru
        </button>
      </div>

      {/* Hierarchy Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Customer List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar Klien Korporat
            </h3>
            <span className="text-[11px] text-teal-400">{customers.length} Kontrak Aktif</span>
          </div>

          <div className="space-y-2">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCustomerId === c.id
                    ? "bg-teal-500/10 border-teal-500/40 shadow-sm"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <ChevronRight
                    className={`w-4 h-4 mt-0.5 transition-transform ${
                      selectedCustomerId === c.id ? "text-teal-400 rotate-90" : "text-slate-600"
                    }`}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <p>PIC: <span className="text-slate-300">{c.picName}</span> ({c.picPhone})</p>
                  <p>Email: <span className="text-slate-300">{c.picEmail}</span></p>
                  <p className="text-[11px] text-teal-400">Siklus Servis Default: {c.defaultServiceIntervalMonths} Bulan</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 & 3: AC Units inside Selected Customer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{selectedCustomer?.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                  {filteredUnits.length} Unit Terpasang
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Lokasi: Gedung Wisma Sudirman Lt. 8 & 9, Jakarta Pusat
              </p>
            </div>
          </div>

          {/* AC Unit Table */}
          <div className="space-y-3">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                        {unit.assetTag}
                      </span>
                      <span className="text-xs font-semibold text-white">{unit.brand}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                      <span>Kapasitas: <strong className="text-slate-300">{unit.capacityPk} PK</strong></span>
                      <span>Freon: <strong className="text-slate-300">{unit.refrigerantType}</strong></span>
                      <span>Model: <span className="text-slate-300">{unit.modelNumber}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Rutin Tiap {unit.serviceIntervalMonths} Bln
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Status: Siap Servis</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Registrasi Unit AC Baru</h3>
            <p className="text-xs text-slate-400 mb-4">
              Klien: <span className="text-teal-400 font-medium">{selectedCustomer?.name}</span>
            </p>

            <form onSubmit={handleAddUnit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kode Asset / Tag Barcode</label>
                <input
                  type="text"
                  placeholder="Contoh: AC-MSF-FL3-01"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Merk / Tipe</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Daikin Inverter">Daikin Inverter</option>
                    <option value="Panasonic Cassette">Panasonic Cassette</option>
                    <option value="Sharp Plasmacluster">Sharp Plasmacluster</option>
                    <option value="Gree Floor Standing">Gree Floor Standing</option>
                    <option value="Mitsubishi Heavy Duty">Mitsubishi Heavy Duty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kapasitas (PK)</label>
                  <select
                    value={newPk}
                    onChange={(e) => setNewPk(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Siklus Servis Rutin</label>
                <select
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="1">Setiap 1 Bulan (Ruang Server / Kritis)</option>
                  <option value="2">Setiap 2 Bulan (Area Padat / Restoran)</option>
                  <option value="3">Setiap 3 Bulan (Standar Kantor B2B)</option>
                  <option value="4">Setiap 4 Bulan (Ruang Meeting Sedang)</option>
                  <option value="6">Setiap 6 Bulan (Area Rendah Beban)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs"
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
