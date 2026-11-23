import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { requireRole } from "../middleware/auth";
import { ResilientWhatsAppService } from "../services/whatsapp";

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

// Helper to get effective configuration value (D1 first, fallback to Worker env)
export async function getSettingValue(
  db: any,
  env: any,
  key: string,
  envVarName: string
): Promise<string | undefined> {
  if (db) {
    const [row] = await db
      .select()
      .from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, key))
      .all();
    if (row && row.value) return row.value;
  }
  return env ? env[envVarName] : undefined;
}

// Get all gateway configurations (masked for security)
settingsRouter.get("/settings", async (c) => {
  const db = c.get("db");

  const rows = await db.select().from(schema.systemSettings).all();
  const configMap: Record<string, string> = {};
  for (const row of rows) {
    configMap[row.key] = row.value;
  }

  const metaToken = configMap["meta_wa_token"] || c.env.META_WA_TOKEN || "";
  const metaPhoneId = configMap["meta_phone_number_id"] || c.env.META_PHONE_NUMBER_ID || "";
  const fonnteToken = configMap["fonnte_token"] || c.env.FONNTE_TOKEN || "";
  const resendApiKey = configMap["resend_api_key"] || c.env.RESEND_API_KEY || "";

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

// Update gateway settings
settingsRouter.post("/settings", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const now = new Date();

  const entries: { key: string; value: string; description: string }[] = [];

  if (body.metaWaToken && !body.metaWaToken.includes("••••")) {
    entries.push({ key: "meta_wa_token", value: body.metaWaToken.trim(), description: "Meta Cloud API Bearer Token" });
  }
  if (body.metaPhoneNumberId) {
    entries.push({ key: "meta_phone_number_id", value: body.metaPhoneNumberId.trim(), description: "Meta Phone Number ID" });
  }
  if (body.fonnteToken && !body.fonnteToken.includes("••••")) {
    entries.push({ key: "fonnte_token", value: body.fonnteToken.trim(), description: "Fonnte WhatsApp Token" });
  }
  if (body.resendApiKey && !body.resendApiKey.includes("••••")) {
    entries.push({ key: "resend_api_key", value: body.resendApiKey.trim(), description: "Resend Transactional Email API Key" });
  }

  for (const entry of entries) {
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

  return c.json({ success: true, updatedCount: entries.length });
});

// Test WhatsApp send
settingsRouter.post("/settings/test-whatsapp", async (c) => {
  const db = c.get("db");
  const { targetPhone, provider } = await c.req.json();

  if (!targetPhone) return c.json({ error: "Target phone number required" }, 400);

  const metaToken = await getSettingValue(db, c.env, "meta_wa_token", "META_WA_TOKEN");
  const metaPhoneId = await getSettingValue(db, c.env, "meta_phone_number_id", "META_PHONE_NUMBER_ID");
  const fonnteToken = await getSettingValue(db, c.env, "fonnte_token", "FONNTE_TOKEN");

  const waService = new ResilientWhatsAppService({
    META_WA_TOKEN: metaToken,
    META_PHONE_NUMBER_ID: metaPhoneId,
    FONNTE_TOKEN: fonnteToken,
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
    provider: result.provider as any,
    status: result.success ? "SENT" : "FAILED",
    errorMessage: result.error || null,
    createdAt: new Date(),
  });

  return c.json(result);
});

// Test Email send via Resend
settingsRouter.post("/settings/test-email", async (c) => {
  const db = c.get("db");
  const { targetEmail } = await c.req.json();

  if (!targetEmail) return c.json({ error: "Target email required" }, 400);

  const resendApiKey = await getSettingValue(db, c.env, "resend_api_key", "RESEND_API_KEY");
  if (!resendApiKey) {
    return c.json({ success: false, error: "Resend API Key belum diatur di D1 maupun Worker environment" }, 400);
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "KoolSync Test <billing@koolsync.com>",
        to: [targetEmail],
        subject: "[KoolSync] Uji Coba Pengiriman Email Transaksional",
        html: `
          <h3>Halo Admin,</h3>
          <p>Ini adalah pesan uji coba pengiriman email dari sistem KoolSync CRM AC.</p>
          <p>Jika Anda menerima email ini, integrasi Resend API telah berhasil terhubung!</p>
          <hr/>
          <p><small>Waktu kirim: ${new Date().toLocaleString("id-ID")}</small></p>
        `,
      }),
    });

    const data = await resp.json();
    return c.json({ success: resp.ok, data, error: resp.ok ? undefined : JSON.stringify(data) });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
