# AGENTS.md

Instructions and configuration for AI agents working in this repository.

## Architecture & Monolith Pointer

- **Fullstack Stack**: Cloudflare Workers + Hono REST API + React Vite + Drizzle ORM (D1) + R2. See `docs/adr/0001-monolithic-cloudflare-stack.md`.
- **R2 Storage Patterns**: `evidence/{serviceOrderId}/{acUnitId}/{evidenceType}_{timestamp}.webp` and `invoices/{invoiceNumber}.html`. See `docs/adr/0003-service-evidence-and-asset-tag-printing.md`.
- **WhatsApp Gateway**: Official Meta Cloud API with Fonnte/Waha resilient fallback. See `docs/adr/0002-whatsapp-adapter-and-fallback.md`.
- **Auth**: Better-Auth with D1 adapter. See `docs/adr/0004-better-auth-on-cloudflare-d1.md`.

## Frontend & Design Quality Rules (Clean B2B Standard)

Whenever creating, restyling, or extending frontend components, agents MUST follow the anti-slop principles documented in `.agents/skills/design-taste-frontend/SKILL.md`:
1. **Clean B2B Field Service Standard**: Avoid dark-cyberpunk neon tropes (`#06090e`, neon cyan `#06b6d4`, heavy glows). Use the industry-standard clean light mode: canvas (`bg-slate-50`), white surface cards (`bg-white border-slate-200 shadow-sm`), slate text (`text-slate-900` / `text-slate-600`), and classic enterprise blue accents (`bg-blue-600 hover:bg-blue-700 text-white`). Keep tactile micro-interactions (`interactive-card` lifts 2px with subtle drop-shadow).
2. **Real Visuals Only**: Use authentic, high-resolution commercial HVAC equipment photography and real product assets—never empty ground or generic placeholder icons alone.
3. **Semantic HTML Structure**: Every major view must use valid `<main>` and `<section>` tags inside a `.wrap` container with equal outer gutters.
4. **Physical Label Printing**: Die-cut sticker sheets (Tom & Jerry #108 / #103) strictly require `@page { size: A4; margin: 0 !important; }` and zero body padding in print media to ensure exact physical alignment.

## Guardrails & Verification Suite

Before committing, opening PRs, or claiming tickets as complete, always run the guardrail suite:
```bash
bun run check
```
This runs:
1. `tsc --noEmit` (full backend and frontend static typecheck).
2. `bun run check:glossary` (mechanical verification preventing banned terms like "client" / "klien" in both code and UI text).
3. `vite build` (bundle integrity check).

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
