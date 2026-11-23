import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { requireAuth } from "../middleware/auth";

export const evidenceRouter = new Hono<{
  Bindings: { DB: D1Database; R2: R2Bucket };
  Variables: { db: any; user: any };
}>();

// Ensure all evidence operations require authenticated session (both admin & technician allowed)
evidenceRouter.use("*", requireAuth());

// Direct photo evidence upload to R2 conforming strictly to ADR-0003:
// evidence/{serviceOrderId}/{acUnitId}/{evidenceType}_{timestamp}.webp
evidenceRouter.post("/upload", async (c) => {
  const formData = await c.req.parseBody();
  const file = formData["file"] as File | string;
  const serviceItemId = formData["serviceItemId"] as string;
  const evidenceType = formData["evidenceType"] as string;

  if (!file || typeof file === "string") {
    return c.json({ error: "No file provided" }, 400);
  }

  const db = c.get("db");

  // Query linked service order and ac unit to construct canonical ADR-0003 path
  const [item] = await db
    .select()
    .from(schema.serviceItems)
    .where(eq(schema.serviceItems.id, serviceItemId))
    .all();

  const serviceOrderId = item ? item.serviceOrderId : "general";
  const acUnitId = item ? item.acUnitId : "unit";
  const key = `evidence/${serviceOrderId}/${acUnitId}/${evidenceType}_${Date.now()}.webp`;

  const r2 = c.env.R2;
  if (r2) {
    const arrayBuffer = await file.arrayBuffer();
    await r2.put(key, arrayBuffer, {
      httpMetadata: { contentType: "image/webp" },
    });
  }

  const photoUrl = `/api/storage/${key}`;

  // Save evidence to D1
  const evidenceId = `ev_${Date.now()}`;
  await db.insert(schema.serviceEvidences).values({
    id: evidenceId,
    serviceItemId,
    evidenceType: evidenceType as any,
    photoUrl,
    caption: `${evidenceType} evidence upload`,
    createdAt: new Date(),
  });

  return c.json({ id: evidenceId, photoUrl, key }, 201);
});

// Update technician measurements and complete service item
evidenceRouter.post("/service-items/:id/measurements", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .update(schema.serviceItems)
    .set({
      beforePressurePsi: body.beforePressurePsi,
      afterPressurePsi: body.afterPressurePsi,
      beforeAmpere: body.beforeAmpere,
      afterAmpere: body.afterAmpere,
      beforeTempC: body.beforeTempC,
      afterTempC: body.afterTempC,
      laborCost: body.laborCost || 150000,
      partsCost: body.partsCost || 0,
      status: "DONE",
      notes: body.notes,
    })
    .where(eq(schema.serviceItems.id, id));

  return c.json({ success: true });
});

// Save Customer PIC Digital Signature & complete order
evidenceRouter.post("/orders/:id/complete", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const { signatureDataUrl, signerName, rating, feedback } = await c.req.json();

  const r2Key = `signatures/${id}_${Date.now()}.png`;
  if (c.env.R2 && signatureDataUrl) {
    const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    await c.env.R2.put(r2Key, buffer, {
      httpMetadata: { contentType: "image/png" },
    });
  }

  const now = new Date();
  await db
    .update(schema.serviceOrders)
    .set({
      status: "COMPLETED",
      completedAt: now,
      customerPicSignatureUrl: `/api/storage/${r2Key}`,
      customerPicSignerName: signerName,
      rating: rating || 5,
      feedback: feedback || "Servis AC selesai dengan baik dan bersih.",
    })
    .where(eq(schema.serviceOrders.id, id));

  return c.json({ success: true, status: "COMPLETED" });
});
