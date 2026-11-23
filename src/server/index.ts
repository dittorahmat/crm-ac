import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { drizzle } from "drizzle-orm/d1";
import { lte, eq } from "drizzle-orm";
import * as schema from "./db/schema";
import { createAuth } from "./auth";
import { assetsRouter } from "./routes/assets";
import { ordersRouter } from "./routes/orders";
import { evidenceRouter } from "./routes/evidence";
import { invoicesRouter } from "./routes/invoices";
import { settingsRouter } from "./routes/settings";
import { ResilientWhatsAppService } from "./services/whatsapp";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ASSETS: Fetcher;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  META_WA_TOKEN?: string;
  META_PHONE_NUMBER_ID?: string;
  FONNTE_TOKEN?: string;
  RESEND_API_KEY?: string;
};

type Variables = {
  db: ReturnType<typeof drizzle<typeof schema>>;
  auth: ReturnType<typeof createAuth>;
  user: typeof schema.users.$inferSelect | null;
  session: typeof schema.sessions.$inferSelect | null;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Inject database and auth instances into context
app.use("*", async (c, next) => {
  if (c.env.DB) {
    const db = drizzle(c.env.DB, { schema });
    c.set("db", db);
    const auth = createAuth(db);
    c.set("auth", auth);

    // Parse session
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (session) {
        c.set("user", session.user as any);
        c.set("session", session.session as any);
      } else {
        c.set("user", null);
        c.set("session", null);
      }
    } catch {
      c.set("user", null);
      c.set("session", null);
    }
  }
  await next();
});

// Better-Auth handler mount
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
  const auth = c.get("auth");
  if (!auth) return c.json({ error: "Auth not initialized" }, 500);
  return auth.handler(c.req.raw);
});

// Mount Sub-routers
app.route("/api", assetsRouter);
app.route("/api", ordersRouter);
app.route("/api", evidenceRouter);
app.route("/api", invoicesRouter);
app.route("/api", settingsRouter);

// R2 Storage object server
app.get("/api/storage/*", async (c) => {
  const r2 = c.env.R2;
  if (!r2) return c.text("R2 binding not configured", 500);

  const key = c.req.path.replace("/api/storage/", "");
  const object = await r2.get(key);
  if (!object) return c.text("Object not found in R2", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
});

// Health check & Version
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Current User Profile
app.get("/api/me", (c) => {
  const user = c.get("user");
  if (!user) return c.json({ user: null }, 401);
  return c.json({ user });
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    console.log("Cloudflare Cron Trigger fired at:", new Date().toISOString(), event.cron);
    if (!env.DB) return;

    const db = drizzle(env.DB, { schema });
    const waService = new ResilientWhatsAppService({
      META_WA_TOKEN: env.META_WA_TOKEN,
      META_PHONE_NUMBER_ID: env.META_PHONE_NUMBER_ID,
      FONNTE_TOKEN: env.FONNTE_TOKEN,
    });

    const now = new Date();
    // Scan ACUnits whose next service due date is within next 7 days
    const upcomingUnits = await db
      .select({
        unit: schema.acUnits,
        customer: schema.customers,
        location: schema.locations,
      })
      .from(schema.acUnits)
      .innerJoin(schema.customers, eq(schema.acUnits.customerId, schema.customers.id))
      .innerJoin(schema.locations, eq(schema.acUnits.locationId, schema.locations.id))
      .where(lte(schema.acUnits.nextServiceDueDate, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)))
      .all();

    for (const item of upcomingUnits) {
      if (!item.customer.picPhone) continue;

      try {
        const dueDateStr = item.unit.nextServiceDueDate ? new Date(item.unit.nextServiceDueDate).toLocaleDateString("id-ID") : "segera";
        const result = await waService.dispatch({
          toPhone: item.customer.picPhone,
          customerName: item.customer.name,
          messageType: "routine_reminder",
          params: {
            unitCount: 1,
            locationName: item.location.name,
            dueDate: dueDateStr,
            portalLink: `https://crm-ac.tech1solusi.workers.dev/ac/${item.unit.assetTag}`,
          },
        });

        // Log delivery status into D1
        await db.insert(schema.whatsappLogs).values({
          id: `walog_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          customerId: item.customer.id,
          recipientPhone: item.customer.picPhone,
          messageType: "routine_reminder",
          provider: result.provider as any,
          status: result.success ? "SENT" : "FAILED",
          errorMessage: result.error || null,
          createdAt: new Date(),
        });
      } catch (err: any) {
        console.error("Failed to dispatch automated WhatsApp reminder:", err);
      }
    }
  },
};
