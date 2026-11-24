# AGENTS.md

Instructions and configuration for AI agents working in this repository.

## Architecture & Monolith Pointer

- **Fullstack Stack**: Cloudflare Workers + Hono REST API + React Vite + Drizzle ORM (D1) + R2. See `docs/adr/0001-monolithic-cloudflare-stack.md`.
- **R2 Storage Patterns**: `evidence/{serviceOrderId}/{acUnitId}/{evidenceType}_{timestamp}.webp` and `invoices/{invoiceNumber}.html`. See `docs/adr/0003-service-evidence-and-asset-tag-printing.md`.
- **Barcode & QR Camera Scanner**: WebRTC camera scanner with Tom & Jerry physical label alignment, audio/haptic feedback, and D1 asset picker fallback. See `docs/adr/0007-real-camera-barcode-and-qr-scanner.md`.
- **WhatsApp Gateway**: Official Meta Cloud API with Fonnte/Waha resilient fallback. See `docs/adr/0002-whatsapp-adapter-and-fallback.md`.
- **Gateway Settings & Notifications**: Credentials resolve via `getSystemSettings(db, env)` with D1 precedence, and emails via `sendTransactionalEmail`. See `docs/adr/0006-gateway-settings-and-notification-pipeline.md`.
- **Auth & RBAC**: Better-Auth with D1 adapter, enforcing `admin` and `technician` roles. See `docs/adr/0004-better-auth-on-cloudflare-d1.md` and `docs/adr/0005-role-based-access-control.md`.
  - **Fail-Closed RBAC Principle**: Role resolution MUST fail closed (`403 Forbidden` if missing or unverified). Never fall back to default roles (e.g. `user.role || 'technician'`) or mock elevated `admin` privileges in production authentication callbacks.
  - **Hono Route Protection**: Route middleware protecting sub-resources and mutations must use wildcard patterns (`assetsRouter.use("*", ...)`, `invoicesRouter.use("*", ...)`) or explicit array matching so that parameterized subpaths (e.g. `/customers/:id`, `/invoices/:id/send-email`) are never left unguarded. Sensitive admin data (`/api/analytics`, `/api/reminders`, `/api/invoices/**`, `/api/settings/**`, and order dispatch/assignment mutations) must strictly require `requireRole(["admin"])`.
  - **Separation of Concerns (Field Tech vs Admin)**: Field technicians are strictly forbidden from directly generating invoices, dispatching billing emails, or modifying master billing records. Invoice generation and billing communications are triggered only by admin approval or automated backend lifecycles upon validated service completion.
  - **Role-Based Post-Scan Routing**: Barcode/QR scanning and `/ac/:assetTag` deep links MUST route technicians directly to operational service flows (`FieldTrackingView` with active unit state) and admins to the asset passport (`ACUnitDetailView`).
  - **No False-Positive Delivery Status**: Client UI must never assume message delivery success based purely on HTTP transport `res.ok`. Server responses must return explicit `{ success: boolean }`, and UI state must only mark items as `SENT` when `res.ok && data.success === true`.
  - **No Pseudo/Mock Evidence or Metrics**: Field tracking flows must use real HTML5 `<canvas>` elements for signature capture and actual `<input type="file" accept="image/*">` for R2 photo evidence capture—never fake placeholder click-boxes or hardcoded 1x1 base64 pixels. Analytics and dashboard operational metrics must be computed from real D1 database aggregations—never synthesized using hardcoded math or array index arithmetic.

## Frontend & Design Quality Rules (Clean B2B Standard)

Whenever creating, restyling, or extending frontend components, agents MUST follow the anti-slop principles documented in `.agents/skills/design-taste-frontend/SKILL.md`:
1. **Clean B2B Field Service Standard**: Avoid dark-cyberpunk neon tropes (`#06090e`, `#0b111c`, neon cyan `#06b6d4`, heavy glows). Use the industry-standard clean light mode across ALL views: canvas (`bg-slate-50`), white surface cards (`bg-white border-slate-200 shadow-sm`), slate text (`text-slate-900` / `text-slate-600`), and classic enterprise blue accents (`bg-blue-600 hover:bg-blue-700 text-white`). Keep tactile micro-interactions (`interactive-card` lifts 2px with subtle drop-shadow). Never leave partial views dark while others are light.
2. **Tailwind v3 Compliance**: The project runs Tailwind CSS v3. Do NOT use non-existent Tailwind v4 classes such as `shadow-xs` (use `shadow-sm` or `shadow`), `backdrop-blur-xs` (use `backdrop-blur-sm`), or unconfigured utility classes.
3. **Operational State Fidelity**: Preserve real-time operational visual indicators such as `animate-pulse` on active server/cloud/device status indicators.
4. **Real Visuals Only**: Use authentic, high-resolution commercial HVAC equipment photography and real product assets—never empty ground or generic placeholder icons alone.
5. **Semantic HTML & Layout Architecture**:
   - The top-level application shell (`App.tsx`) provides the single primary `<main className="... wrap">` container wrapping all dynamic views.
   - Individual view components (`src/client/pages/*View.tsx`) must NEVER declare nested `<main>` tags (which violates HTML5 landmark specifications). Instead, views must use `<div className="space-y-* wrap">` with nested semantic `<section>` blocks for each logical module card.
   - Mobile drawers and dialogs MUST provide an accessible backdrop overlay (`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40`) with `role="dialog"` / `aria-modal="true"`, an explicit close button (`<X />`), and click-outside dismissal behavior.
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
3. `bun run check:ui` (mechanical verification preventing legacy dark AI-slop tokens, non-existent Tailwind v4 classes, legacy neon glow classes `shadow-(teal|cyan)`, enforcing semantic `<section>` views, prohibiting nested `<main>` tags in views, enforcing server fail-closed role resolution, prohibiting raw `.js`/`.jsx` files across project root/src/scripts, and asserting `.gitattributes` Linguist hygiene).
4. `vite build` (bundle integrity check).

To audit frontend design compliance with the taste-skill gate against a live dev server:
```bash
bun run taste:check
```

## Agent Tooling & Environment Conventions

- **Windows CLI Economy**: The host environment runs Windows PowerShell. Avoid assuming POSIX binary availability (e.g. `grep`, `sed`, `awk` via `rtk`). Use PowerShell native cmdlets (`Select-String`) or Bun/Node scripts for fast cross-file text scanning.
- **Vite Host Binding on Windows**: Dev servers must bind explicitly to IPv4 (`127.0.0.1` or `--host 127.0.0.1`) to prevent Windows IPv6 dual-stack permission crashes (`EACCES ::1:3000`). Preconfigured in `vite.config.ts` and `package.json`.
- **Pure TypeScript & Zero Raw JS Rule**: All application code, build scripts, and configuration files must be authored strictly in TypeScript (`.ts` / `.tsx`). Never introduce `.js` files in project source or root configurations (`tailwind.config.ts`, `vite.config.ts`).
- **Clean Theme Configuration**: Theme configurations (`tailwind.config.ts`) must never introduce speculative, dead, or non-compliant tokens (e.g. neon cyberpunk glows `glow-cold`, non-standard color scales). Every theme token must directly serve active views and adhere strictly to the Clean B2B Field Service Standard.
- **Atomic File Refactoring & Git Staging**: When migrating or refactoring configuration files (e.g. deleting `.js` and introducing `.ts`), never leave replacement files untracked while staging file deletions. Ensure all associated configurations, build files, and gitattributes are staged atomically.
- **GitHub Linguist Hygiene (.gitattributes)**: Vendor artifacts, migration files, and agent skill templates (such as `.agents/**`, `drizzle/**`, `.scratch/**`) must be flagged with `linguist-vendored` in `.gitattributes` so that GitHub repository language statistics accurately reflect the primary TypeScript codebase rather than external template scripts. Ensure local scratch directories (`.scratch/`) are ignored in `.gitignore`.

## Agent Skills & Conventions

### Issue tracker
Issues and specs live in GitHub Issues (`gh issue`). See `docs/agents/issue-tracker.md`.

### Triage labels
Canonical triage label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs
Single-context documentation layout (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.
Always use canonical terms (`Customer` never `Client`/`Klien`, `ACUnit` never `Device`, `ServiceOrder` never `Task`).
