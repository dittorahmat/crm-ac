import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import * as schema from "../db/schema";
import { z } from "zod";
import { requireRole } from "../middleware/auth";

export const ordersRouter = new Hono<{
  Bindings: { DB: D1Database };
  Variables: { db: any; user: any };
}>();

// Only admin can create new scheduled service orders
ordersRouter.post("/orders", requireRole(["admin"]));

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

// Analytics aggregate overview for Command Center
ordersRouter.get("/analytics", async (c) => {
  const db = c.get("db");

  const [units, orders, invoices] = await Promise.all([
    db.select().from(schema.acUnits).all(),
    db.select().from(schema.serviceOrders).all(),
    db.select().from(schema.invoices).all(),
  ]);

  const activeUnits = units.filter((u: any) => u.status === "active").length;
  const completedOrders = orders.filter((o: any) => o.status === "COMPLETED").length;
  const dispatchedOrders = orders.filter((o: any) => o.status === "DISPATCHED" || o.status === "IN_PROGRESS").length;
  const totalRevenue = invoices.reduce((acc: number, inv: any) => acc + (inv.totalAmount || 0), 0);

  return c.json({
    totalUnits: units.length,
    activeUnits,
    completedOrders,
    dispatchedOrders,
    totalRevenue,
    invoiceCount: invoices.length,
  });
});

// WhatsApp Reminders list
ordersRouter.get("/reminders", async (c) => {
  const db = c.get("db");

  const list = await db
    .select({
      unit: schema.acUnits,
      customer: schema.customers,
      location: schema.locations,
    })
    .from(schema.acUnits)
    .innerJoin(schema.customers, eq(schema.acUnits.customerId, schema.customers.id))
    .innerJoin(schema.locations, eq(schema.acUnits.locationId, schema.locations.id))
    .all();

  const logs = await db.select().from(schema.whatsappLogs).all();

  const results = list.map((item: any) => {
    const customerLogs = logs.filter((l: any) => l.customerId === item.customer.id);
    const lastLog = customerLogs.length > 0 ? customerLogs[customerLogs.length - 1] : null;

    const dueDate = item.unit.nextServiceDueDate ? new Date(item.unit.nextServiceDueDate) : new Date();
    const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return {
      id: `rem_${item.unit.id}`,
      customerName: item.customer.name,
      picName: item.customer.picName,
      picPhone: item.customer.picPhone,
      locationName: item.location.name,
      unitCount: 1,
      intervalMonths: item.unit.serviceIntervalMonths || 3,
      nextDueDate: dueDate.toISOString().split("T")[0],
      daysRemaining: diffDays,
      lastSentStatus: lastLog ? lastLog.status : "PENDING",
      providerUsed: lastLog ? (lastLog.provider === "meta" ? "Meta Cloud API" : "Fonnte (Fallback)") : "Meta Cloud API",
    };
  });

  return c.json(results);
});
