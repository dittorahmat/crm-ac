# 6. Gateway Settings & Resilient Notification Pipeline

Date: 2026-11-24

## Status

Accepted

## Context

The application needs to deliver mission-critical transactional notifications (WhatsApp routine reminders, invoice PDF links, technician dispatch alerts) and transactional billing emails via Resend.
Credentials for these services may exist in Cloudflare Worker environment variables during initial bootstrap, but system administrators require the ability to update, test, or override API tokens at runtime through the application UI (`/settings`) without triggering a code deployment.

Previously, gateway credential resolution was scattered across multiple endpoints, leading to:
1. Inconsistent precedence between D1 `system_settings` and Worker environment variables.
2. Inability to clear or revert database overrides back to Worker environment defaults.
3. Repetitive raw fetch calls to third-party endpoints (e.g. `api.resend.com/emails`) rather than a single tested service layer.
4. False-positive UI reporting when HTTP transport succeeded (HTTP 200) but the gateway payload returned `{ success: false }`.

## Decision

### 1. Unified Gateway Resolution (`getSystemSettings`)
All gateway credentials (Meta WhatsApp, Fonnte, Resend) must resolve through the unified `getSystemSettings(db, env)` helper in `src/server/services/config.ts`.
- **Precedence**: D1 `system_settings` table takes precedence over Cloudflare Worker environment bindings (`c.env`).
- **Clearance**: Sending an empty string for a credential deletes the key from `system_settings`, immediately reverting resolution to environment variable fallbacks.
- **Coverage**: Both HTTP route handlers (`/api/invoices`, `/api/reminders`, `/api/settings`) and background cron handlers (`scheduled` in `src/server/index.ts`) must resolve configurations via `getSystemSettings`.

### 2. Dedicated Transactional Email Service (`sendTransactionalEmail`)
All transactional emails must be dispatched via `sendTransactionalEmail(params)` in `src/server/services/email.ts`. Direct raw `fetch("https://api.resend.com/emails")` inside route controllers is strictly prohibited and enforced mechanically via guardrail scripts.

### 3. Strict Delivery Verification & HTTP Status Semantics
- Server endpoints dispatching external notifications or emails must inspect the third-party response and return HTTP 502 with `{ success: false, error: ... }` if the external gateway reports a failure.
- Client UI code must never mark an item as `SENT` based purely on `res.ok`. UI state must check `res.ok && data.success === true`.

### 4. Semantic UI Views
All major full-page views (`*View.tsx`) must structure content using top-level `<main className="... wrap">` and semantic `<section>` blocks, completely replacing unsemantic top-level `<div>` wrappers.

## Consequences

- Gateway credentials can be dynamically updated or cleared by admins at runtime.
- Background cron routines and manual triggers use the exact same configuration logic.
- Automated guardrails prevent raw HTTP calls and unsemantic views from being merged.
