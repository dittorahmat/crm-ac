import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { z } from "zod";
import { requireRole } from "../middleware/auth";

export const assetsRouter = new Hono<{
  Bindings: { DB: D1Database };
  Variables: { db: any; user: any };
}>();

// Protect all master data mutations (root and subpaths) with admin role
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
assetsRouter.use("*", async (c, next) => {
  if (mutationMethods.has(c.req.method)) {
    // Only permit mutations if user is admin
    return requireRole(["admin"])(c, next);
  }
  await next();
});

// Schemas
const customerSchema = z.object({
  name: z.string().min(2),
  picName: z.string().min(2),
  picPhone: z.string().min(8),
  picEmail: z.string().email().optional(),
  defaultServiceIntervalMonths: z.number().int().min(1).max(12).default(3),
  notes: z.string().optional(),
});

const locationSchema = z.object({
  customerId: z.string(),
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().optional(),
  picName: z.string().optional(),
  picPhone: z.string().optional(),
});

const zoneSchema = z.object({
  locationId: z.string(),
  name: z.string().min(2),
  floor: z.string().optional(),
});

const acUnitSchema = z.object({
  customerId: z.string(),
  locationId: z.string(),
  zoneId: z.string(),
  assetTag: z.string().min(3),
  brand: z.string().min(2),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  acType: z.enum(["split_wall", "cassette", "standing_floor", "central", "ducted"]).default("split_wall"),
  capacityPk: z.number().min(0.5).max(25).default(1.0),
  refrigerantType: z.string().default("R32"),
  serviceIntervalMonths: z.number().int().min(1).max(12).default(3),
  status: z.enum(["active", "needs_service", "broken", "decommissioned"]).default("active"),
  notes: z.string().optional(),
});

// Customers
assetsRouter.get("/customers", async (c) => {
  const db = c.get("db");
  const list = await db.select().from(schema.customers).all();
  return c.json(list);
});

assetsRouter.post("/customers", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const parsed = customerSchema.parse(body);
  const now = new Date();
  const id = `cust_${Date.now()}`;
  await db.insert(schema.customers).values({
    id,
    ...parsed,
    createdAt: now,
    updatedAt: now,
  });
  return c.json({ id, ...parsed }, 201);
});

// Locations
assetsRouter.get("/locations", async (c) => {
  const db = c.get("db");
  const customerId = c.req.query("customerId");
  if (customerId) {
    const list = await db.select().from(schema.locations).where(eq(schema.locations.customerId, customerId)).all();
    return c.json(list);
  }
  const list = await db.select().from(schema.locations).all();
  return c.json(list);
});

assetsRouter.post("/locations", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const parsed = locationSchema.parse(body);
  const id = `loc_${Date.now()}`;
  await db.insert(schema.locations).values({
    id,
    ...parsed,
    createdAt: new Date(),
  });
  return c.json({ id, ...parsed }, 201);
});

// Technicians list
assetsRouter.get("/technicians", async (c) => {
  const db = c.get("db");
  const list = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      phone: schema.users.phone,
    })
    .from(schema.users)
    .where(eq(schema.users.role, "technician"))
    .all();
  return c.json(list);
});

// AC Unit by asset tag (with service history & customer info)
assetsRouter.get("/ac-units/tag/:tag", async (c) => {
  const db = c.get("db");
  const tag = c.req.param("tag");
  const [row] = await db
    .select({
      unit: schema.acUnits,
      customer: schema.customers,
      location: schema.locations,
      zone: schema.zones,
    })
    .from(schema.acUnits)
    .leftJoin(schema.customers, eq(schema.acUnits.customerId, schema.customers.id))
    .leftJoin(schema.locations, eq(schema.acUnits.locationId, schema.locations.id))
    .leftJoin(schema.zones, eq(schema.acUnits.zoneId, schema.zones.id))
    .where(eq(schema.acUnits.assetTag, tag))
    .all();

  if (!row) {
    return c.json({ error: "AC Unit not found" }, 404);
  }

  // Get service items history for this unit
  const history = await db
    .select({
      item: schema.serviceItems,
      order: schema.serviceOrders,
      tech: schema.users,
    })
    .from(schema.serviceItems)
    .leftJoin(schema.serviceOrders, eq(schema.serviceItems.serviceOrderId, schema.serviceOrders.id))
    .leftJoin(schema.users, eq(schema.serviceOrders.technicianId, schema.users.id))
    .where(eq(schema.serviceItems.acUnitId, row.unit.id))
    .all();

  // Get evidence for these items
  const itemIds = history.map((h: any) => h.item.id);
  let evidences: any[] = [];
  if (itemIds.length > 0) {
    evidences = await db.select().from(schema.serviceEvidences).all();
    evidences = evidences.filter((ev: any) => itemIds.includes(ev.serviceItemId));
  }

  return c.json({
    ...row,
    history: history.map((h: any) => ({
      ...h,
      evidences: evidences.filter((ev: any) => ev.serviceItemId === h.item.id),
    })),
  });
});
assetsRouter.get("/zones", async (c) => {
  const db = c.get("db");
  const locationId = c.req.query("locationId");
  if (locationId) {
    const list = await db.select().from(schema.zones).where(eq(schema.zones.locationId, locationId)).all();
    return c.json(list);
  }
  const list = await db.select().from(schema.zones).all();
  return c.json(list);
});

assetsRouter.post("/zones", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const parsed = zoneSchema.parse(body);
  const id = `zone_${Date.now()}`;
  await db.insert(schema.zones).values({
    id,
    ...parsed,
    createdAt: new Date(),
  });
  return c.json({ id, ...parsed }, 201);
});

// AC Units (with Customer and Zone information for barcode printing and asset explorer)
assetsRouter.get("/ac-units", async (c) => {
  const db = c.get("db");
  const list = await db
    .select({
      id: schema.acUnits.id,
      customerId: schema.acUnits.customerId,
      locationId: schema.acUnits.locationId,
      zoneId: schema.acUnits.zoneId,
      assetTag: schema.acUnits.assetTag,
      brand: schema.acUnits.brand,
      modelNumber: schema.acUnits.modelNumber,
      serialNumber: schema.acUnits.serialNumber,
      acType: schema.acUnits.acType,
      capacityPk: schema.acUnits.capacityPk,
      refrigerantType: schema.acUnits.refrigerantType,
      serviceIntervalMonths: schema.acUnits.serviceIntervalMonths,
      status: schema.acUnits.status,
      notes: schema.acUnits.notes,
      lastServiceDate: schema.acUnits.lastServiceDate,
      nextServiceDueDate: schema.acUnits.nextServiceDueDate,
      customerName: schema.customers.name,
      zoneName: schema.zones.name,
      locationName: schema.locations.name,
    })
    .from(schema.acUnits)
    .leftJoin(schema.customers, eq(schema.acUnits.customerId, schema.customers.id))
    .leftJoin(schema.locations, eq(schema.acUnits.locationId, schema.locations.id))
    .leftJoin(schema.zones, eq(schema.acUnits.zoneId, schema.zones.id))
    .all();
  return c.json(list);
});

assetsRouter.post("/ac-units", async (c) => {
  const db = c.get("db");
  const body = await c.req.json();
  const parsed = acUnitSchema.parse(body);
  const id = `ac_${Date.now()}`;
  const now = new Date();
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + parsed.serviceIntervalMonths);

  await db.insert(schema.acUnits).values({
    id,
    ...parsed,
    lastServiceDate: now,
    nextServiceDueDate: nextDueDate,
    createdAt: now,
  });
  return c.json({ id, ...parsed }, 201);
});
