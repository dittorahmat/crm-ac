import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { requireRole } from "../middleware/auth";
import { getSystemSettings } from "../services/config";
import { sendTransactionalEmail } from "../services/email";

export const invoicesRouter = new Hono<{
  Bindings: { DB: D1Database; R2: R2Bucket; RESEND_API_KEY?: string };
  Variables: { db: any; user: any };
}>();

// Enforce admin-only for all billing & invoices routes
invoicesRouter.use("*", requireRole(["admin"]));

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

  // Dynamically calculate subtotal from associated service items
  const items = await db
    .select()
    .from(schema.serviceItems)
    .where(eq(schema.serviceItems.serviceOrderId, serviceOrderId))
    .all();

  let subtotal = 0;
  for (const item of items) {
    subtotal += (item.laborCost || 150000) + (item.partsCost || 0);
  }
  if (subtotal === 0) {
    subtotal = 350000; // minimum baseline service charge if items weren't priced yet
  }

  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;

  // Store minimal printable HTML/PDF descriptor in R2
  const pdfKey = `invoices/${invoiceNumber}.html`;
  const r2 = c.env.R2;
  if (r2) {
    const invoiceHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Faktur #${invoiceNumber}</title></head>
<body style="font-family: sans-serif; padding: 40px; color: #1e293b;">
  <h2>Faktur Tagihan Servis AC - KoolSync</h2>
  <p><strong>No. Faktur:</strong> ${invoiceNumber}</p>
  <p><strong>Pelanggan:</strong> ${customer?.name || "Corporate Customer"}</p>
  <p><strong>Subtotal Jasa & Part:</strong> Rp ${subtotal.toLocaleString("id-ID")}</p>
  <p><strong>PPN (11%):</strong> Rp ${tax.toLocaleString("id-ID")}</p>
  <hr/>
  <h3>Total: Rp ${total.toLocaleString("id-ID")}</h3>
</body>
</html>`;
    await r2.put(pdfKey, invoiceHtml, { httpMetadata: { contentType: "text/html" } });
  }

  const pdfUrl = `/api/storage/${pdfKey}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

  const now = new Date();
  const invoiceId = `inv_${Date.now()}`;

  await db.insert(schema.invoices).values({
    id: invoiceId,
    invoiceNumber,
    serviceOrderId,
    customerId: customer ? customer.id : order.customerId,
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
  const gatewayConfig = await getSystemSettings(db, c.env);
  if (gatewayConfig.resendApiKey && customer?.picEmail) {
    const emailResult = await sendTransactionalEmail({
      apiKey: gatewayConfig.resendApiKey,
      to: customer.picEmail,
      subject: `Faktur Tagihan Servis AC #${invoiceNumber} - ${customer.name}`,
      html: `
        <h3>Halo ${customer.picName},</h3>
        <p>Faktur tagihan servis AC <strong>#${invoiceNumber}</strong> sebesar <strong>Rp ${total.toLocaleString("id-ID")}</strong> telah diterbitkan.</p>
        <p><a href="https://crm-ac.tech1solusi.workers.dev${pdfUrl}">Buka Lembar Faktur #${invoiceNumber}</a></p>
        <p>Jatuh tempo pembayaran: ${dueDate.toLocaleDateString("id-ID")}</p>
      `,
    });
    emailDispatched = emailResult.success;
  }

  return c.json({
    id: invoiceId,
    invoiceNumber,
    pdfUrl,
    subtotal,
    taxAmount: tax,
    totalAmount: total,
    emailDispatched,
    status: "SENT",
  }, 201);
});

// Explicit Email Dispatch Endpoint for an existing invoice
invoicesRouter.post("/invoices/:id/send-email", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const [row] = await db
    .select({
      invoice: schema.invoices,
      customer: schema.customers,
    })
    .from(schema.invoices)
    .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
    .where(eq(schema.invoices.id, id))
    .all();

  if (!row) return c.json({ error: "Invoice not found" }, 404);

  const recipientEmail = row.customer?.picEmail;
  if (!recipientEmail) {
    return c.json({ error: "Customer does not have an email address" }, 400);
  }

  // Get Resend API Key from unified settings
  const gatewayConfig = await getSystemSettings(db, c.env);
  if (!gatewayConfig.resendApiKey) {
    return c.json({ error: "Resend API key not configured" }, 400);
  }

  const emailResult = await sendTransactionalEmail({
    apiKey: gatewayConfig.resendApiKey,
    to: recipientEmail,
    subject: `Faktur Tagihan Servis AC #${row.invoice.invoiceNumber} - ${row.customer?.name}`,
    html: `
      <h3>Halo ${row.customer?.picName},</h3>
      <p>Faktur tagihan servis AC <strong>#${row.invoice.invoiceNumber}</strong> sebesar <strong>Rp ${row.invoice.totalAmount.toLocaleString("id-ID")}</strong> siap untuk diproses.</p>
      <p><a href="https://crm-ac.tech1solusi.workers.dev${row.invoice.pdfUrl}">Buka Lembar Faktur #${row.invoice.invoiceNumber}</a></p>
      <p>Jatuh tempo pembayaran: ${new Date(row.invoice.dueDate).toLocaleDateString("id-ID")}</p>
    `,
  });

  if (emailResult.success) {
    await db
      .update(schema.invoices)
      .set({ status: "SENT", sentAt: new Date() })
      .where(eq(schema.invoices.id, id));
    return c.json({ success: true, data: emailResult.data });
  } else {
    return c.json({ success: false, error: emailResult.error }, 502);
  }
});
