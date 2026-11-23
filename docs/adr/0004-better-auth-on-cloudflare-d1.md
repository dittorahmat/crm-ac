# 4. Authentication with Better Auth on Cloudflare Workers and D1

Date: 2026-11-23

## Status

Accepted

## Context

User management requires authentication for two internal roles: `Admin` and `Technician`. The database is Cloudflare D1 (SQLite) with Drizzle ORM, running inside a Cloudflare Workers isolate. Authentication must handle sessions, password hashing, and role-based access control (RBAC).

## Decision

We use **Better Auth** with the D1 / Drizzle adapter:
- User schema includes `id`, `name`, `email`, `role` (`admin` | `technician`), and associated timestamps.
- Better Auth handles session management natively using D1 tables and cookie headers.
- Route protection middleware in Hono validates the session via Better Auth handler.
- Customer PIC access bypasses direct user accounts, utilizing cryptographic `PortalPass` query tokens instead.

## Consequences

### Positive
- Production-grade security without rolling custom crypto or session stores.
- Clean integration with Drizzle ORM and Cloudflare D1.
- Built-in support for password hashing, rate limiting, and session invalidation.

### Negative / Trade-offs
- Requires Better Auth schema migration to run alongside application schemas in D1.
