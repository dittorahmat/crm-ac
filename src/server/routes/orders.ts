import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import * as schema from "../db/schema";
import { z } from "zod";
import { requireRole } from "../middleware/auth";
import { ResilientWhatsAppService } from "../services/whatsapp";

export const ordersRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    META_WA_TOKEN?: string;
    META_PHONE_NUMBER_ID?: string;
    FONNTE_TOKEN?: string;
  };
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

// Update order status (Dispatch, Check-in, Completed) - Dispatching is admin-only
ordersRouter.patch("/orders/:id/status", async (c) => {
  const db = c.get("db");
  const user = c.get("user");
  const id = c.req.param("id");
  const { status, technicianId } = await c.req.json();

  // If assigning or dispatching, must be admin
  if (technicianId || status === "DISPATCHED") {
    if (!user || user.role !== "admin") {
      return c.json({ error: "Forbidden: Only admin can dispatch technicians" }, 403);
    }
  }

  const updateValues: any = { status };
  if (technicianId) updateValues.technicianId = technicianId;
  if (status === "CHECKED_IN") updateValues.checkInAt = new Date();
  if (status === "COMPLETED") updateValues.completedAt = new Date();

  await db.update(schema.serviceOrders).set(updateValues).where(eq(schema.serviceOrders.id, id));
  return c.json({ success: true, status, technicianId });
});

// Analytics aggregate overview for Command Center (Admin only)
ordersRouter.get("/analytics", requireRole(["admin"]), async (c) => {
  const db = c.get("db");

  const [units, orders, invoices] = await Promise.all([
    db.select().from(schema.acUnits).all(),
    db.select().from(schema.serviceOrders).all(),
    db.select().from(schema.invoices).all(),
  ]);

  const activeUnits = units.filter((unitItem: any) => unitItem.status === "active").length;
  const completedOrders = orders.filter((orderItem: any) => orderItem.status === "COMPLETED").length;
  const dispatchedOrders = orders.filter((orderItem: any) => orderItem.status === "DISPATCHED" || orderItem.status === "IN_PROGRESS").length;
  const totalRevenue = invoices.reduce((acc: number, invoiceItem: any) => acc + (invoiceItem.totalAmount || 0), 0);

  return c.json({
    totalUnits: units.length,
    activeUnits,
    completedOrders,
    dispatchedOrders,
    totalRevenue,
    invoiceCount: invoices.length,
  });
});

// WhatsApp Reminders list (Admin only)
ordersRouter.get("/reminders", requireRole(["admin"]), async (c) => {
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
    const customerLogs = logs.filter((logEntry: any) => logEntry.customerId === item.customer.id);
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

// Manual WhatsApp Reminder trigger
ordersRouter.post("/reminders/:id/send", requireRole(["admin"]), async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const unitId = id.replace("rem_", "");

  const [row] = await db
    .select({
      unit: schema.acUnits,
      customer: schema.customers,
      location: schema.locations,
    })
    .from(schema.acUnits)
    .innerJoin(schema.customers, eq(schema.acUnits.customerId, schema.customers.id))
    .innerJoin(schema.locations, eq(schema.acUnits.locationId, schema.locations.id))
    .where(eq(schema.acUnits.id, unitId))
    .all();

  if (!row || !row.customer.picPhone) {
    return c.json({ error: "Customer or phone number not found" }, 404);
  }

  // Fetch gateway tokens from systemSettings D1 or fallback to Worker env
  const settingsRows = await db.select().from(schema.systemSettings).all();
  const settingsMap: Record<string, string> = {};
  for (const s of settingsRows) {
    settingsMap[s.key] = s.value;
  }

  const metaToken = settingsMap["meta_wa_token"] || c.env.META_WA_TOKEN;
  const metaPhoneId = settingsMap["meta_phone_number_id"] || c.env.META_PHONE_NUMBER_ID;
  const fonnteToken = settingsMap["fonnte_token"] || c.env.FONNTE_TOKEN;

  const waService = new ResilientWhatsAppService({
    META_WA_TOKEN: metaToken,
    META_PHONE_NUMBER_ID: metaPhoneId,
    FONNTE_TOKEN: fonnteToken,
  });

  const dueDateStr = row.unit.nextServiceDueDate
    ? new Date(row.unit.nextServiceDueDate).toLocaleDateString("id-ID")
    : "segera";

  const result = await waService.dispatch({
    toPhone: row.customer.picPhone,
    customerName: row.customer.name,
    messageType: "routine_reminder",
    params: {
      unitCount: 1,
      locationName: row.location.name,
      dueDate: dueDateStr,
      portalLink: `https://crm-ac.tech1solusi.workers.dev/ac/${row.unit.assetTag}`,
    },
  });

  const logId = `walog_${Date.now()}`;
  await db.insert(schema.whatsappLogs).values({
    id: logId,
    customerId: row.customer.id,
    recipientPhone: row.customer.picPhone,
    messageType: "routine_reminder",
    provider: result.provider as any,
    status: result.success ? "SENT" : "FAILED",
    errorMessage: result.error || null,
    createdAt: new Date(),
  });

  return c.json({
    success: result.success,
    logId,
    provider: result.provider === "meta" ? "Meta Cloud API" : "Fonnte (Fallback)",
    status: result.success ? "SENT" : "FAILED",
    error: result.error,
  });
});
