import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { requireRole } from "../middleware/auth";
import { ResilientWhatsAppService } from "../services/whatsapp";
import { getSystemSettings } from "../services/config";
import { sendTransactionalEmail } from "../services/email";

export const settingsRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    META_WA_TOKEN?: string;
    META_PHONE_NUMBER_ID?: string;
    FONNTE_TOKEN?: string;
    RESEND_API_KEY?: string;
  };
  Variables: { db: any; user: any };
}>();

// All settings operations are strictly admin only (fail-closed RBAC)
settingsRouter.use("*", requireRole(["admin"]));

// Get all gateway configurations (masked for security)
settingsRouter.get("/settings", async (c) => {
  const db = c.get("db");
  const config = await getSystemSettings(db, c.env);

  const metaToken = config.metaWaToken || "";
  const metaPhoneId = config.metaPhoneNumberId || "";
  const fonnteToken = config.fonnteToken || "";
  const resendApiKey = config.resendApiKey || "";

  return c.json({
    metaWaToken: metaToken ? `${metaToken.substring(0, 6)}••••••••${metaToken.substring(metaToken.length - 4)}` : "",
    metaPhoneNumberId: metaPhoneId,
    fonnteToken: fonnteToken ? `${fonnteToken.substring(0, 4)}••••••••` : "",
    resendApiKey: resendApiKey ? `${resendApiKey.substring(0, 6)}••••••••` : "",
    hasMetaToken: Boolean(metaToken),
    hasFonnteToken: Boolean(fonnteToken),
    hasResendApiKey: Boolean(resendApiKey),
  });
});

// Update gateway settings (supports updating or clearing keys)
settingsRouter.post("/settings", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const now = new Date();

  const updates: { key: string; value: string; description: string }[] = [];
  const deletions: string[] = [];

  const fields = [
    { key: "meta_wa_token", val: body.metaWaToken, desc: "Meta Cloud API Bearer Token" },
    { key: "meta_phone_number_id", val: body.metaPhoneNumberId, desc: "Meta Phone Number ID" },
    { key: "fonnte_token", val: body.fonnteToken, desc: "Fonnte WhatsApp Token" },
    { key: "resend_api_key", val: body.resendApiKey, desc: "Resend Transactional Email API Key" },
  ];

  for (const f of fields) {
    if (f.val !== undefined) {
      const trimmed = typeof f.val === "string" ? f.val.trim() : "";
      if (trimmed === "") {
        // Clear value from D1 so it reverts to environment fallback if any
        deletions.push(f.key);
      } else if (!trimmed.includes("••••")) {
        updates.push({ key: f.key, value: trimmed, description: f.desc });
      }
    }
  }

  for (const key of deletions) {
    await db.delete(schema.systemSettings).where(eq(schema.systemSettings.key, key));
  }

  for (const entry of updates) {
    await db
      .insert(schema.systemSettings)
      .values({
        key: entry.key,
        value: entry.value,
        description: entry.description,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.systemSettings.key,
        set: { value: entry.value, updatedAt: now },
      });
  }

  return c.json({ success: true, updatedCount: updates.length, clearedCount: deletions.length });
});

// Test WhatsApp send
settingsRouter.post("/settings/test-whatsapp", async (c) => {
  const db = c.get("db");
  const { targetPhone, provider } = await c.req.json();

  if (!targetPhone) return c.json({ error: "Target phone number required" }, 400);

  const config = await getSystemSettings(db, c.env);

  const waService = new ResilientWhatsAppService({
    META_WA_TOKEN: config.metaWaToken,
    META_PHONE_NUMBER_ID: config.metaPhoneNumberId,
    FONNTE_TOKEN: config.fonnteToken,
  });

  const result = await waService.dispatch({
    toPhone: targetPhone,
    customerName: "Admin Testing",
    messageType: "routine_reminder",
    params: {
      unitCount: 1,
      locationName: "Uji Coba Gateway KoolSync",
      dueDate: new Date().toLocaleDateString("id-ID"),
      portalLink: "https://crm-ac.tech1solusi.workers.dev",
    },
  });

  // Record log in D1
  await db.insert(schema.whatsappLogs).values({
    id: `walog_test_${Date.now()}`,
    recipientPhone: targetPhone,
    messageType: "routine_reminder",
    provider: (result.provider as any) || "fonnte",
    status: result.success ? "SENT" : "FAILED",
    errorMessage: result.error || null,
    createdAt: new Date(),
  });

  const status = result.success ? 200 : 502;
  return c.json(result, status);
});

// Test Email send via Resend
settingsRouter.post("/settings/test-email", async (c) => {
  const db = c.get("db");
  const { targetEmail } = await c.req.json();

  if (!targetEmail) return c.json({ error: "Target email required" }, 400);

  const config = await getSystemSettings(db, c.env);
  if (!config.resendApiKey) {
    return c.json({ success: false, error: "Resend API Key belum diatur di D1 maupun Worker environment" }, 400);
  }

  const result = await sendTransactionalEmail({
    apiKey: config.resendApiKey,
    to: targetEmail,
    subject: "[KoolSync] Uji Coba Pengiriman Email Transaksional",
    html: `
      <h3>Halo Admin,</h3>
      <p>Ini adalah pesan uji coba pengiriman email dari sistem KoolSync CRM AC.</p>
      <p>Jika Anda menerima email ini, integrasi Resend API telah berhasil terhubung!</p>
      <hr/>
      <p><small>Waktu kirim: ${new Date().toLocaleString("id-ID")}</small></p>
    `,
  });

  const status = result.success ? 200 : 502;
  return c.json(result, status);
});
