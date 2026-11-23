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

// Zones
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

// AC Units
assetsRouter.get("/ac-units", async (c) => {
  const db = c.get("db");
  const list = await db.select().from(schema.acUnits).all();
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
