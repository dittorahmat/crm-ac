import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, Key, Send, CheckCircle2, AlertCircle, Save, Loader2, Mail, MessageSquare } from "lucide-react";

interface SettingsData {
  metaWaToken: string;
  metaPhoneNumberId: string;
  fonnteToken: string;
  resendApiKey: string;
  hasMetaToken: boolean;
  hasFonnteToken: boolean;
  hasResendApiKey: boolean;
}

export function SystemSettingsView() {
  const [settings, setSettings] = useState<SettingsData>({
    metaWaToken: "",
    metaPhoneNumberId: "",
    fonnteToken: "",
    resendApiKey: "",
    hasMetaToken: false,
    hasFonnteToken: false,
    hasResendApiKey: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test states
  const [testPhone, setTestPhone] = useState("081288992211");
  const [testingWa, setTestingWa] = useState(false);
  const [waResult, setWaResult] = useState<any>(null);

  const [testEmail, setTestEmail] = useState("admin@koolsync.com");
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = (await res.json()) as SettingsData;
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Gagal menyimpan konfigurasi ke D1.");
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setTestingWa(true);
    setWaResult(null);
    try {
      const res = await fetch("/api/settings/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPhone: testPhone }),
      });
      const data = await res.json();
      setWaResult(data);
    } catch (err: any) {
      setWaResult({ success: false, error: err.message });
    } finally {
      setTestingWa(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: testEmail }),
      });
      const data = await res.json();
      setEmailResult(data);
    } catch (err: any) {
      setEmailResult({ success: false, error: err.message });
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6 wrap">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Pengaturan Gateway & Otomasi
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Kelola kredensial Meta WhatsApp Cloud API, Fonnte Fallback, dan Resend Email langsung ke Cloudflare D1
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Kredensial dan pengaturan berhasil disimpan ke database D1!
          </div>
        )}
      </section>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* WhatsApp Gateway Settings */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">WhatsApp Gateway Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Meta Cloud API Bearer Token
                </label>
                {settings.hasMetaToken && (
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Aktif di Database
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder={settings.hasMetaToken ? "Token tersimpan (biarkan kosong jika tidak diubah)" : "EAAG..."}
                value={settings.metaWaToken}
                onChange={(e) => setSettings({ ...settings, metaWaToken: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Token resmi WhatsApp Business Platform dari Meta Developer Dashboard
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Meta Phone Number ID
                </label>
                {settings.metaPhoneNumberId && (
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Tersimpan
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="104928172635489"
                value={settings.metaPhoneNumberId}
                onChange={(e) => setSettings({ ...settings, metaPhoneNumberId: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                ID nomor telepon WhatsApp Business yang terdaftar di Meta
              </span>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Fonnte Token (Fallback Gateway)
                </label>
                {settings.hasFonnteToken && (
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Aktif di Database
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder={settings.hasFonnteToken ? "Token tersimpan (biarkan kosong jika tidak diubah)" : "Token API Fonnte"}
                value={settings.fonnteToken}
                onChange={(e) => setSettings({ ...settings, fonnteToken: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Digunakan otomatis saat Meta Cloud API mengalami rate-limit atau template belum diapprove
              </span>
            </div>
          </div>
        </section>

        {/* Resend Email Gateway Settings */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Email Transaksional (Resend API)</h3>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Resend API Key
              </label>
              {settings.hasResendApiKey && (
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Aktif di Database
                </span>
              )}
            </div>
            <input
              type="password"
              placeholder={settings.hasResendApiKey ? "API key tersimpan (biarkan kosong jika tidak diubah)" : "re_123456789..."}
              value={settings.resendApiKey}
              onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
              className="w-full min-h-[44px] px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Kunci API dari Resend.com untuk otomatisasi pengiriman faktur tagihan servis AC ke email PIC
            </span>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-95 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Konfigurasi ke D1
          </button>
        </div>
      </form>

      {/* Diagnostics & Live Test Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Uji Coba Pengiriman Langsung (Diagnostics)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pastikan kredensial berfungsi dengan mengirim pesan uji coba riil sebelum dijalankan otomatis oleh Cron
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Test Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Test WhatsApp Reminder
            </span>
            <div>
              <label className="text-[10px] text-slate-500">Nomor WhatsApp Tujuan</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 mt-1"
              />
            </div>
            <button
              onClick={handleTestWhatsApp}
              disabled={testingWa}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95 transition-all"
            >
              {testingWa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Kirim Pesan Uji Coba WhatsApp
            </button>
            {waResult && (
              <div className={`p-2.5 rounded-lg text-[11px] font-mono border ${
                waResult.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
              }`}>
                Provider: {waResult.provider} | Status: {waResult.success ? "Berhasil" : "Gagal"}
                {waResult.error && <p className="text-[10px] text-red-600 mt-1">{waResult.error}</p>}
              </div>
            )}
          </div>

          {/* Email Test Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Test Email Resend
            </span>
            <div>
              <label className="text-[10px] text-slate-500">Email Tujuan</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="admin@perusahaan.com"
                className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 mt-1"
              />
            </div>
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95 transition-all"
            >
              {testingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Kirim Email Uji Coba Resend
            </button>
            {emailResult && (
              <div className={`p-2.5 rounded-lg text-[11px] font-mono border ${
                emailResult.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
              }`}>
                Status: {emailResult.success ? "Berhasil Dikirim" : "Gagal"}
                {emailResult.error && <p className="text-[10px] text-red-600 mt-1">{emailResult.error}</p>}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
