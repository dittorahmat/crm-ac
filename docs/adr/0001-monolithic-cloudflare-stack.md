# 1. Monolithic Cloudflare Stack with Hono, D1, and R2

Date: 2026-11-23

## Status

Accepted

## Context

The system requires a fullstack deployment hosting both API and frontend UI for a B2B AC service CRM. Operational requirements include handling field technician updates, storing photo evidence (ServiceEvidence), generating PDF Invoices, running daily Cron Triggers for WhatsApp maintenance reminders, and maintaining high performance at minimal infrastructure cost.

## Decision

We deploy as a single cohesive monolithic application on Cloudflare:
- **Runtime**: Cloudflare Workers running a **Hono** REST/RPC backend.
- **Frontend**: React + Vite + TypeScript (SPA served statically via Cloudflare Workers Static Assets or Pages, talking to Hono API).
- **Database**: Cloudflare D1 (SQLite at the edge) accessed via **Drizzle ORM**.
- **Object Storage**: Cloudflare R2 for storing photo evidence (before/after cleaning, pressure readings), digital signatures, and generated PDF Invoices.
- **Background Tasks**: Cloudflare Workers Cron Triggers (`scheduled` event) for recurring maintenance reminders.

## Consequences

### Positive
- Zero server maintenance overhead with rapid edge latency.
- Unified TypeScript types shared between Drizzle schemas, Hono routes, and React client.
- D1 and R2 eliminate dedicated database and S3 hosting costs for small-to-medium field operations.

### Negative / Trade-offs
- SQLite/D1 does not support arbitrary concurrent long-running transactions; writes must remain lean.
- Native Node.js binaries (like headless Chrome) cannot run on V8 isolates; PDF generation and image handling must use pure JavaScript/WebAssembly packages (`pdf-lib`, `@react-pdf/renderer`).
