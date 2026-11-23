# AGENTS.md

Instructions and configuration for AI agents working in this repository.

## Architecture & Monolith Pointer

- **Fullstack Stack**: Cloudflare Workers + Hono REST API + React Vite + Drizzle ORM (D1) + R2. See `docs/adr/0001-monolithic-cloudflare-stack.md`.
- **R2 Storage Patterns**: `evidence/{serviceOrderId}/{acUnitId}/{evidenceType}_{timestamp}.webp` and `invoices/{invoiceNumber}.html`. See `docs/adr/0003-service-evidence-and-asset-tag-printing.md`.
- **WhatsApp Gateway**: Official Meta Cloud API with Fonnte/Waha resilient fallback. See `docs/adr/0002-whatsapp-adapter-and-fallback.md`.
- **Auth**: Better-Auth with D1 adapter. See `docs/adr/0004-better-auth-on-cloudflare-d1.md`.

## Guardrails & Verification

Before opening PRs or claiming tickets as complete, always run the guardrail suite:
```bash
bun run check
```
This runs:
1. `tsc --noEmit` (full backend and frontend static typecheck).
2. `bun run check:glossary` (mechanical verification preventing banned domain terms like "client").
3. `vite build` (bundle integrity check).

## Agent Skills & Conventions

### Issue tracker
Issues and specs live in GitHub Issues (`gh issue`). See `docs/agents/issue-tracker.md`.

### Triage labels
Canonical triage label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs
Single-context documentation layout (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.
Always use canonical terms (`Customer` never `Client`, `ACUnit` never `Device`, `ServiceOrder` never `Task`).
