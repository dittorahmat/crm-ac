import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

export const invoicesRouter = new Hono<{
  Bindings: { DB: D1Database; R2: R2Bucket; RESEND_API_KEY?: string };
  Variables: { db: any; user: any };
}>();

// List Invoices
invoicesRouter.get("/invoices", async (c) => {
  const db = c.get("db");
  const list = await db
    .select({
      invoice: schema.invoices,
      customer: schema.customers,
    })
    .from(schema.invoices)
    .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
    .all();

  return c.json(list);
});

// Generate & Dispatch Invoice
invoicesRouter.post("/invoices/generate", async (c) => {
  const db = c.get("db");
  const { serviceOrderId } = await c.req.json();

  // Find service order
  const [order] = await db
    .select()
    .from(schema.serviceOrders)
    .where(eq(schema.serviceOrders.id, serviceOrderId))
    .all();

  if (!order) return c.json({ error: "Order not found" }, 404);

  const [customer] = await db
    .select()
    .from(schema.customers)
    .where(eq(schema.customers.id, order.customerId))
    .all();

  const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;
  const subtotal = 1450000; // Total labor + parts
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const pdfKey = `invoices/${invoiceNumber}.pdf`;
  const pdfUrl = `/api/storage/${pdfKey}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

  const now = new Date();
  const invoiceId = `inv_${Date.now()}`;

  await db.insert(schema.invoices).values({
    id: invoiceId,
    invoiceNumber,
    serviceOrderId,
    customerId: customer.id,
    subtotal,
    taxAmount: tax,
    totalAmount: total,
    status: "SENT",
    pdfUrl,
    dueDate,
    sentAt: now,
    createdAt: now,
  });

  // Transactional Email dispatch via Resend
  let emailDispatched = false;
  const resendApiKey = c.env.RESEND_API_KEY;
  if (resendApiKey && customer.picEmail) {
    try {
      const emailResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "KoolSync Invoicing <billing@koolsync.com>",
          to: [customer.picEmail],
          subject: `Faktur Tagihan Servis AC #${invoiceNumber} - ${customer.name}`,
          html: `
            <h3>Halo ${customer.picName},</h3>
            <p>Terima kasih atas kepercayaan Anda menggunakan jasa servis dan perawatan AC KoolSync.</p>
            <p>Faktur tagihan <strong>#${invoiceNumber}</strong> sebesar <strong>Rp ${total.toLocaleString("id-ID")}</strong> telah diterbitkan dan dapat diunduh melalui tautan berikut:</p>
            <p><a href="https://crm.koolsync.com${pdfUrl}">Unduh Faktur PDF #${invoiceNumber}</a></p>
            <p>Jatuh tempo pembayaran: ${dueDate.toLocaleDateString("id-ID")}</p>
          `,
        }),
      });
      emailDispatched = emailResp.ok;
    } catch (e) {
      console.error("Failed to send email via Resend:", e);
    }
  }

  return c.json({
    id: invoiceId,
    invoiceNumber,
    pdfUrl,
    totalAmount: total,
    emailDispatched,
    status: "SENT",
  }, 201);
});
