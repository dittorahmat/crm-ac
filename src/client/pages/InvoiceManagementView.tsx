import React, { useState, useEffect } from "react";
import { FileText, Send, Download, CheckCircle, Mail, DollarSign, Calendar, Building, Loader2 } from "lucide-react";

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
  pdfUrl?: string;
}

export function InvoiceManagementView() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailSending, setEmailSending] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const list = (await res.json()) as any[];
        if (list.length > 0) {
          const mapped: Invoice[] = list.map((item: any) => ({
            id: item.invoice.id,
            invoiceNumber: item.invoice.invoiceNumber,
            customerName: item.customer?.name || "Pelanggan B2B",
            picEmail: item.customer?.picEmail || "finance@koolsync.com",
            subtotal: item.invoice.subtotal,
            taxAmount: item.invoice.taxAmount,
            totalAmount: item.invoice.totalAmount,
            status: item.invoice.status,
            dueDate: item.invoice.dueDate
              ? new Date(item.invoice.dueDate).toISOString().split("T")[0]
              : "2026-12-01",
            sentAt: item.invoice.sentAt
              ? new Date(item.invoice.sentAt).toLocaleString("id-ID")
              : "-",
            pdfUrl: item.invoice.pdfUrl,
          }));
          setInvoices(mapped);
        } else {
          setInvoices([
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
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to load invoices from D1:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

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
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Faktur & Tagihan Servis (Otomatis Email PDF)
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Faktur otomatis dibuat saat teknisi menyelesaikan tiket, disimpan di R2, dan dikirim via transactional email
          </p>
        </div>
      </div>

            {/* Invoice List */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daftar Tagihan B2B
          </h3>
          <span className="text-[11px] text-blue-600">3 Faktur Diterbitkan</span>
        </div>

        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {inv.invoiceNumber}
                  </span>
                  {inv.status === "PAID" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Lunas
                    </span>
                  )}
                  {inv.status === "SENT" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Terkirim ke Email
                    </span>
                  )}
                  {inv.status === "DRAFT" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Draf
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  {inv.customerName}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
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
              <div className="flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                    Total Tagihan
                  </span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    Rp {inv.totalAmount.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Termasuk PPN 11% (Rp {inv.taxAmount.toLocaleString("id-ID")})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Mengunduh PDF Faktur: ${inv.invoiceNumber}`)}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm transition-colors"
                    title="Unduh PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {inv.status === "DRAFT" && (
                    <button
                      onClick={() => handleSendEmail(inv.id)}
                      disabled={emailSending === inv.id}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-xs flex items-center gap-1.5 transition-all "
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
      </section>
    </div>
  );
}
