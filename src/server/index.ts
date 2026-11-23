import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { createAuth } from "./auth";

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
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
    // WhatsApp routine maintenance reminder check will hook here
  },
};
