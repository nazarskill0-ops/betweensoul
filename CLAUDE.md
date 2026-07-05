@AGENTS.md

# Calmi

Online marketplace for Ukrainian psychologists: browse → pick a slot → pay →
online session. Roles: client, psychologist, admin (each has its own dashboard).

## Start here

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — stack, folder map, state model
- [docs/RULES.md](docs/RULES.md) — contributor rules (read before committing)
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — DB schema + Row Level Security

## Stack

Next.js (App Router) · React · TypeScript · Tailwind v4 · Supabase (Postgres +
Auth) · TanStack Query (server state) · Zustand (UI state) · Zod · react-hook-form.
Payments: LiqPay + WayForPay behind `src/lib/payments`. Hosting: Vercel.

## Non-negotiables

- Server data → TanStack Query. UI state → Zustand. Filters → the URL.
- Money = integer minor units (kopiykas). Times = UTC. Commission lives in
  `src/lib/config.ts`.
- Every DB table has RLS enabled + explicit policies.
- One feature = one folder under `src/features/` (`psychologists/` is the template).

## Reference

`_design_ref/` holds the original HTML landing/legal pages the app was ported
from. Not shipped — reference only.
