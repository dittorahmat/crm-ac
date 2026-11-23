# AGENTS.md

Instructions and configuration for AI agents working in this repository.

## Architecture & Monolith Pointer

- **Fullstack Stack**: Cloudflare Workers + Hono REST API + React Vite + Drizzle ORM (D1) + R2. See `docs/adr/0001-monolithic-cloudflare-stack.md`.
- **R2 Storage Patterns**: `evidence/{serviceOrderId}/{acUnitId}/{evidenceType}_{timestamp}.webp` and `invoices/{invoiceNumber}.html`. See `docs/adr/0003-service-evidence-and-asset-tag-printing.md`.
- **WhatsApp Gateway**: Official Meta Cloud API with Fonnte/Waha resilient fallback. See `docs/adr/0002-whatsapp-adapter-and-fallback.md`.
- **Auth & RBAC**: Better-Auth with D1 adapter, enforcing `admin` and `technician` roles. See `docs/adr/0004-better-auth-on-cloudflare-d1.md` and `docs/adr/0005-role-based-access-control.md`.
  - **Fail-Closed RBAC Principle**: Role resolution MUST fail closed (`403 Forbidden` if missing or unverified). Never fall back to default roles (e.g. `user.role || 'technician'`) or mock elevated `admin` privileges in production authentication callbacks.
  - **Hono Route Protection**: Route middleware protecting sub-resources and mutations must use wildcard patterns (`assetsRouter.use("*", ...)`) or explicit array matching so that parameterized subpaths (e.g. `/customers/:id`) are never left unguarded.

## Frontend & Design Quality Rules (Clean B2B Standard)

Whenever creating, restyling, or extending frontend components, agents MUST follow the anti-slop principles documented in `.agents/skills/design-taste-frontend/SKILL.md`:
1. **Clean B2B Field Service Standard**: Avoid dark-cyberpunk neon tropes (`#06090e`, `#0b111c`, neon cyan `#06b6d4`, heavy glows). Use the industry-standard clean light mode across ALL views: canvas (`bg-slate-50`), white surface cards (`bg-white border-slate-200 shadow-sm`), slate text (`text-slate-900` / `text-slate-600`), and classic enterprise blue accents (`bg-blue-600 hover:bg-blue-700 text-white`). Keep tactile micro-interactions (`interactive-card` lifts 2px with subtle drop-shadow). Never leave partial views dark while others are light.
2. **Tailwind v3 Compliance**: The project runs Tailwind CSS v3. Do NOT use non-existent Tailwind v4 classes such as `shadow-xs` (use `shadow-sm` or `shadow`), `backdrop-blur-xs` (use `backdrop-blur-sm`), or unconfigured utility classes.
3. **Operational State Fidelity**: Preserve real-time operational visual indicators such as `animate-pulse` on active server/cloud/device status indicators.
4. **Real Visuals Only**: Use authentic, high-resolution commercial HVAC equipment photography and real product assets—never empty ground or generic placeholder icons alone.
5. **Semantic HTML Structure**: Every major view must use valid `<main>` and `<section>` tags inside a `.wrap` container with equal outer gutters. Do not use unsemantic top-level `<div>` wraps for full-page views.
6. **Domain Vocabulary Compliance**: Respect canonical domain terms from `GLOSSARY.md` (e.g. use `Zone` or `Ruang`, avoid `Area` or `Compartment`; use `Customer` never `Client`/`Klien`; `ACUnit` never `Device`; `ServiceOrder` never `Task`).
7. **Physical Label Printing**: Die-cut sticker sheets (Tom & Jerry #108 / #103) strictly require `@page { size: A4; margin: 0 !important; }` and zero body padding in print media to ensure exact physical alignment.

## Guardrails & Verification Suite

Before committing, opening PRs, or claiming tickets as complete, always run the guardrail suite:
```bash
bun run check
```
This runs:
1. `tsc --noEmit` (full backend and frontend static typecheck).
2. `bun run check:glossary` (mechanical verification preventing banned terms like "client" / "klien" in both code and UI text).
3. `bun run check:ui` (mechanical verification preventing legacy dark AI-slop tokens, non-existent Tailwind v4 classes, and enforcing semantic `<section>` views).
4. `vite build` (bundle integrity check).

To audit frontend design compliance with the taste-skill gate against a live dev server:
```bash
bun run taste:check
```

## Agent Skills & Conventions

### Issue tracker
Issues and specs live in GitHub Issues (`gh issue`). See `docs/agents/issue-tracker.md`.

### Triage labels
Canonical triage label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs
Single-context documentation layout (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.
Always use canonical terms (`Customer` never `Client`/`Klien`, `ACUnit` never `Device`, `ServiceOrder` never `Task`).
