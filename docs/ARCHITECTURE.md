# Calmi — Architecture

The 30-second version of how this project is put together. Read this before
you touch anything. The detailed do's and don'ts are in [RULES.md](./RULES.md).

## What Calmi is

A marketplace where clients find a psychologist, pick a free slot, pay, and have
an online session — all on the platform. Three kinds of users:

- **client** — browses, books, pays, attends sessions
- **psychologist** — has a public profile, sets availability, runs sessions
- **admin** — verifies psychologists, oversees the platform

Each role gets its own dashboard; underneath, they share most of the app.

## Stack

| Concern            | Tool                          |
| ------------------ | ----------------------------- |
| Framework          | Next.js (App Router) + React  |
| Language           | TypeScript                    |
| Styling            | Tailwind CSS v4               |
| Database + Auth    | Supabase (Postgres)           |
| Server state/cache | TanStack Query                |
| Client UI state    | Zustand                       |
| Validation         | Zod                           |
| Forms              | react-hook-form + Zod         |
| Payments           | LiqPay + WayForPay (abstracted) |
| Hosting            | Vercel                        |

## The one diagram

```
Browser ─┬─ Server Components ──► Supabase (RLS enforces who sees what)
         │        (read data on the server, render HTML)
         │
         └─ Client Components ──► TanStack Query ──► Route Handlers / Supabase
                  (interactivity)      (client cache)
```

## Folder map (`src/`)

```
app/                 Routes ONLY. Thin. Pages compose features, no business logic.
  layout.tsx         Root layout: fonts, <Providers>, lang="uk".
  providers.tsx      Client-side providers (TanStack Query).
  page.tsx           Landing page (marketing).
  globals.css        Design tokens (@theme) + base styles.

features/            The heart of the app. One folder per domain area.
  <feature>/
    components/      React components for this feature.
    hooks/           useX() hooks (TanStack Query lives here).
    api.ts           Data access for this feature (the only place that queries).
    schema.ts        Zod schemas + inferred types.
  (psychologists, booking, auth, dashboard, ... )

lib/                 Cross-cutting, feature-agnostic code.
  supabase/          client.ts (browser), server.ts (server).
  payments/          Provider abstraction (see RULES.md → Payments).
  config.ts          Business constants (commission, currency, timezone).

components/ui/        Shared dumb UI primitives (buttons, inputs). shadcn/ui here.
stores/               Zustand stores (UI state only).
types/                Shared types, incl. generated Supabase DB types.
```

`supabase/migrations/` holds the SQL schema. `docs/` holds these guides.

## Where data lives — the rule that keeps us sane

There are three kinds of state and each has exactly one home:

1. **Server data** (psychologists, bookings, slots) → **TanStack Query**.
   Never copy it into Zustand.
2. **Client UI state** (is a modal open, wizard step) → **Zustand** or local
   `useState`.
3. **Filters / search / current page** → **the URL** (`?spec=КПТ&price=...`),
   read with `useSearchParams`. Not Zustand. This gives shareable links, back
   button, and server-side rendering for free.

If you internalise only one thing from this repo, make it this list.

See [RULES.md](./RULES.md) for the full contributor guide and
[DATA_MODEL.md](./DATA_MODEL.md) for the database + security model.
