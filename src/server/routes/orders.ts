import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import * as schema from "../db/schema";
import { z } from "zod";

export const ordersRouter = new Hono<{
  Bindings: { DB: D1Database };
  Variables: { db: any; user: any };
}>();

const createOrderSchema = z.object({
  customerId: z.string(),
  locationId: z.string(),
  technicianId: z.string().optional(),
  scheduledDate: z.string(), // ISO string
  acUnitIds: z.array(z.string()).min(1),
});

// List all service orders
ordersRouter.get("/orders", async (c) => {
  const db = c.get("db");
  const list = await db
    .select({
      order: schema.serviceOrders,
      customer: schema.customers,
      location: schema.locations,
      technician: schema.users,
    })
    .from(schema.serviceOrders)
    .leftJoin(schema.customers, eq(schema.serviceOrders.customerId, schema.customers.id))
    .leftJoin(schema.locations, eq(schema.serviceOrders.locationId, schema.locations.id))
    .leftJoin(schema.users, eq(schema.serviceOrders.technicianId, schema.users.id))
    .orderBy(desc(schema.serviceOrders.scheduledDate))
    .all();

  return c.json(list);
});

// Create new scheduled service order with target AC units
ordersRouter.post("/orders", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const parsed = createOrderSchema.parse(body);

  const orderId = `so_${Date.now()}`;
  const orderNumber = `SO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();

  // 1. Create ServiceOrder
  await db.insert(schema.serviceOrders).values({
    id: orderId,
    orderNumber,
    customerId: parsed.customerId,
    locationId: parsed.locationId,
    technicianId: parsed.technicianId || null,
    scheduledDate: new Date(parsed.scheduledDate),
    status: parsed.technicianId ? "DISPATCHED" : "SCHEDULED",
    createdAt: now,
  });

  // 2. Insert items for each selected ACUnit
  for (const acUnitId of parsed.acUnitIds) {
    await db.insert(schema.serviceItems).values({
      id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      serviceOrderId: orderId,
      acUnitId,
      actionType: "routine_wash",
      status: "PENDING",
      createdAt: now,
    });
  }

  return c.json({ id: orderId, orderNumber, status: "SCHEDULED" }, 201);
});

// Update order status (Dispatch, Check-in, Completed)
ordersRouter.patch("/orders/:id/status", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const { status, technicianId } = await c.req.json();

  const updateValues: any = { status };
  if (technicianId) updateValues.technicianId = technicianId;
  if (status === "CHECKED_IN") updateValues.checkInAt = new Date();
  if (status === "COMPLETED") updateValues.completedAt = new Date();

  await db.update(schema.serviceOrders).set(updateValues).where(eq(schema.serviceOrders.id, id));
  return c.json({ success: true, status });
});
