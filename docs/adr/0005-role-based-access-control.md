# 5. Role-Based Access Control (RBAC) Architecture

Date: 2026-11-23

## Status

Accepted

## Context

The application manages commercial HVAC operations with two distinct user personas:
1. **Admin Operasional / Finance / Dispatcher**: Manages enterprise customer contracts, assigns technicians to ServiceOrders, views financial dashboards/turnover, generates and sends PDF invoices, triggers WhatsApp automation, and prints physical Tom & Jerry barcode asset tags.
2. **Technician (Teknisi Lapangan)**: Operates on-site at customer buildings via mobile/tablet devices to execute ServiceOrders, uploads before/after photo evidence to Cloudflare R2, records technical telemetry (Freon PSI, Ampere, Temperature), collects digital signatures from customer building PICs, and scans ACUnit barcodes.

Previously, user authentication via Better-Auth stored a `role` field (`admin` | `technician`) in D1, but the permissions were not enforced either in the backend REST API routes or in the frontend sidebar navigation.

## Decisions

### 1. Two-Role Model
The system enforces two canonical roles:
- `admin`: Full unrestricted access to all operations, sensitive financial data, customer contracts, and configurations.
- `technician`: Scoped operational access focused strictly on field job execution, asset inspection, and evidence capture.

### 2. Frontend Boundary Enforcement
In `src/client/App.tsx`:
- When authenticated as `technician`:
  - Default view immediately loads the field operational workflow (`service_flow` / Tracking Lapangan).
  - Navigation sidebar is strictly filtered:
    - Visible: *Tracking Lapangan (Real-time)*, *Penjadwalan Teknisi* (Job Dispatch), and *Digital Asset Passport (Scan Barcode)*.
    - Hidden: *Dashboard Metrik (Omset Finansial)*, *Aset & Customer B2B*, *Cetak Label Tom & Jerry*, *Faktur & Tagihan PDF*, and *Otomasi WhatsApp*.
- When authenticated as `admin`:
  - Full access to all 7 navigation tabs and metrics command center.

### 3. Backend API Route Middleware (`requireRole`)
A reusable middleware is created in `src/server/middleware/auth.ts`:
- `requireAuth`: Verifies active session via Better-Auth. Returns `401 Unauthorized` if missing.
- `requireRole("admin")`: Verifies `user.role === "admin"`. Returns `403 Forbidden` if a technician attempts to access restricted endpoints.
- Protected endpoints (Admin-only):
  - Invoices (`/api/invoices`, `/api/invoices/**`)
  - Customer & Unit mutations (`POST /api/customers`, `POST /api/ac-units`)
  - Outbound messaging & Reminders (`POST /api/reminders/send`)
- Permitted endpoints (Both Admin & Technician):
  - Service evidence upload (`/api/evidence/upload`)
  - Service order status & telemetry update (`PATCH /api/service-orders/:id`)
  - Read-only asset inspection (`GET /api/ac-units/:tag`, `GET /api/ac-units`)

## Consequences

- Prevents field engineers from viewing sensitive company financials, pricing structures, and invoice templates.
- Enforces security at the edge via Cloudflare Workers and Hono middleware, preventing direct API tampering.
- Keeps mobile UI clutter-free for technicians working on rooftops or plant rooms.
