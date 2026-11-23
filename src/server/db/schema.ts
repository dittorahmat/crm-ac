import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ==========================================
// 1. Better-Auth System Tables
// ==========================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role", { enum: ["admin", "technician"] }).notNull().default("technician"),
  phone: text("phone"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ==========================================
// 2. B2B Customer & Asset Hierarchy
// ==========================================
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // PT or Company name
  picName: text("pic_name").notNull(),
  picPhone: text("pic_phone").notNull(), // WhatsApp notification target
  picEmail: text("pic_email"), // Invoice email recipient
  defaultServiceIntervalMonths: integer("default_service_interval_months").notNull().default(3),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Gedung Kantor Pusat", "Pabrik Cikarang"
  address: text("address").notNull(),
  city: text("city"),
  picName: text("pic_name"),
  picPhone: text("pic_phone"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const zones = sqliteTable("zones", {
  id: text("id").primaryKey(),
  locationId: text("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Lantai 2 - Ruang Server", "Lobby Utama"
  floor: text("floor"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const acUnits = sqliteTable("ac_units", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  locationId: text("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  zoneId: text("zone_id").notNull().references(() => zones.id, { onDelete: "cascade" }),
  assetTag: text("asset_tag").notNull().unique(), // Unique QR/Barcode content, e.g. "AC-JKT-001"
  brand: text("brand").notNull(), // Daikin, Panasonic, Sharp, etc.
  modelNumber: text("model_number"),
  serialNumber: text("serial_number"),
  acType: text("ac_type", { enum: ["split_wall", "cassette", "standing_floor", "central", "ducted"] }).notNull().default("split_wall"),
  capacityPk: real("capacity_pk").notNull().default(1.0),
  refrigerantType: text("refrigerant_type").default("R32"), // R32, R410A, R22
  installationDate: integer("installation_date", { mode: "timestamp" }),
  lastServiceDate: integer("last_service_date", { mode: "timestamp" }),
  nextServiceDueDate: integer("next_service_due_date", { mode: "timestamp" }),
  serviceIntervalMonths: integer("service_interval_months").notNull().default(3), // 1 - 6 months configurable override
  status: text("status", { enum: ["active", "needs_service", "broken", "decommissioned"] }).notNull().default("active"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ==========================================
// 3. Service Orders & Field Evidence
// ==========================================
export const serviceOrders = sqliteTable("service_orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // e.g. "SO-202611-001"
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  locationId: text("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  technicianId: text("technician_id").references(() => users.id, { onDelete: "set null" }),
  scheduledDate: integer("scheduled_date", { mode: "timestamp" }).notNull(),
  status: text("status", { 
    enum: ["SCHEDULED", "DISPATCHED", "CHECKED_IN", "IN_PROGRESS", "PENDING_INVOICE", "COMPLETED", "CANCELLED"] 
  }).notNull().default("SCHEDULED"),
  checkInAt: integer("check_in_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  customerPicSignatureUrl: text("customer_pic_signature_url"), // R2 URL
  customerPicSignerName: text("customer_pic_signer_name"),
  rating: integer("rating"), // 1 - 5 stars
  feedback: text("feedback"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const serviceItems = sqliteTable("service_items", {
  id: text("id").primaryKey(),
  serviceOrderId: text("service_order_id").notNull().references(() => serviceOrders.id, { onDelete: "cascade" }),
  acUnitId: text("ac_unit_id").notNull().references(() => acUnits.id, { onDelete: "cascade" }),
  actionType: text("action_type", { enum: ["routine_wash", "chemical_wash", "refrigerant_refill", "repair", "inspection"] }).notNull().default("routine_wash"),
  notes: text("notes"),
  // Technical parameters
  beforePressurePsi: real("before_pressure_psi"),
  afterPressurePsi: real("after_pressure_psi"),
  beforeAmpere: real("before_ampere"),
  afterAmpere: real("after_ampere"),
  beforeTempC: real("before_temp_c"),
  afterTempC: real("after_temp_c"),
  status: text("status", { enum: ["PENDING", "IN_PROGRESS", "DONE", "SKIPPED"] }).notNull().default("PENDING"),
  laborCost: integer("labor_cost").default(0),
  partsCost: integer("parts_cost").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const serviceEvidences = sqliteTable("service_evidences", {
  id: text("id").primaryKey(),
  serviceItemId: text("service_item_id").notNull().references(() => serviceItems.id, { onDelete: "cascade" }),
  evidenceType: text("evidence_type", { enum: ["before_cleaning", "after_cleaning", "pressure_gauge", "sparepart_replaced", "damage"] }).notNull(),
  photoUrl: text("photo_url").notNull(), // R2 path / signed URL
  caption: text("caption"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ==========================================
// 4. Invoices & Billing
// ==========================================
export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(), // e.g. "INV-202611-001"
  serviceOrderId: text("service_order_id").notNull().references(() => serviceOrders.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  subtotal: integer("subtotal").notNull(),
  taxAmount: integer("tax_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),
  status: text("status", { enum: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"] }).notNull().default("DRAFT"),
  pdfUrl: text("pdf_url"), // R2 link to generated PDF
  sentAt: integer("sent_at", { mode: "timestamp" }),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ==========================================
// 5. WhatsApp Notification & Automation Logs
// ==========================================
export const whatsappLogs = sqliteTable("whatsapp_logs", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  recipientPhone: text("recipient_phone").notNull(),
  messageType: text("message_type", { enum: ["routine_reminder", "service_dispatched", "invoice_sent", "follow_up"] }).notNull(),
  provider: text("provider", { enum: ["meta", "fonnte", "waha"] }).notNull(),
  payload: text("payload"),
  status: text("status", { enum: ["SENT", "FAILED", "QUEUED"] }).notNull().default("QUEUED"),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ==========================================
// 6. System Settings & Gateway Configurations
// ==========================================
export const systemSettings = sqliteTable("system_settings", {
  key: text("key").primaryKey(), // e.g. "meta_wa_token", "fonnte_token", "resend_api_key"
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
