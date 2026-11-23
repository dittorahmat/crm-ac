import React, { useState } from "react";
import { FileText, Send, Download, CheckCircle, Mail, DollarSign, Calendar, Building } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  picEmail: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "PAID";
  dueDate: string;
  sentAt: string;
}

export function InvoiceManagementView() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "inv_1",
      invoiceNumber: "INV-202611-104",
      customerName: "PT. Mega Solusi Finansial",
      picEmail: "procurement@megasolusi.co.id",
      subtotal: 1600000,
      taxAmount: 176000,
      totalAmount: 1776000,
      status: "SENT",
      dueDate: "2026-12-07",
      sentAt: "2026-11-23 11:30",
    },
    {
      id: "inv_2",
      invoiceNumber: "INV-202611-103",
      customerName: "PT. Surya Teknologi Global",
      picEmail: "finance@suryatekno.com",
      subtotal: 2400000,
      taxAmount: 264000,
      totalAmount: 2664000,
      status: "PAID",
      dueDate: "2026-11-20",
      sentAt: "2026-11-10 14:00",
    },
    {
      id: "inv_3",
      invoiceNumber: "INV-202611-102",
      customerName: "CV. Digital Niaga Nusantara",
      picEmail: "ga@digitalniaga.id",
      subtotal: 800000,
      taxAmount: 88000,
      totalAmount: 888000,
      status: "DRAFT",
      dueDate: "2026-12-01",
      sentAt: "-",
    },
  ]);

  const [emailSending, setEmailSending] = useState<string | null>(null);

  const handleSendEmail = (id: string) => {
    setEmailSending(id);
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id ? { ...inv, status: "SENT", sentAt: "Baru Saja" } : inv
        )
      );
      setEmailSending(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-400" />
            Faktur & Tagihan Servis (Otomatis Email PDF)
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Faktur otomatis dibuat saat teknisi menyelesaikan tiket, disimpan di R2, dan dikirim via transactional email
          </p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Daftar Tagihan B2B
          </h3>
          <span className="text-[11px] text-teal-400">3 Faktur Diterbitkan</span>
        </div>

        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                    {inv.invoiceNumber}
                  </span>
                  {inv.status === "PAID" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Lunas
                    </span>
                  )}
                  {inv.status === "SENT" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Terkirim ke Email
                    </span>
                  )}
                  {inv.status === "DRAFT" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Draf
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  {inv.customerName}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {inv.picEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Jatuh Tempo: {inv.dueDate}
                  </span>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                    Total Tagihan
                  </span>
                  <span className="text-base font-bold text-white font-mono">
                    Rp {inv.totalAmount.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Termasuk PPN 11% (Rp {inv.taxAmount.toLocaleString("id-ID")})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Mengunduh PDF Faktur: ${inv.invoiceNumber}`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Unduh PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {inv.status === "DRAFT" && (
                    <button
                      onClick={() => handleSendEmail(inv.id)}
                      disabled={emailSending === inv.id}
                      className="px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/10"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {emailSending === inv.id ? "Mengirim..." : "Kirim Email"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
