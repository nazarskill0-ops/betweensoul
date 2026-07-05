# Data model & security

The schema is defined in [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).
This document explains the *why*.

## Tables

```
auth.users            (managed by Supabase Auth — don't touch directly)
   │ 1:1
profiles              role (client|psychologist|admin), name, phone, avatar
   │ 1:1 (only when role = psychologist)
psychologists         status, bio, price, specializations[], languages[], ...
   │ 1:many
availability_slots    starts_at / ends_at (UTC), status (open|held|booked)

bookings              client → psychologist → slot, status, price snapshot
   │ 1:many
payments              provider (liqpay|wayforpay), status, amount
```

## Design decisions (and the reasoning)

- **`profiles` mirrors `auth.users`.** Supabase owns authentication; we own
  everything else. A trigger (to add) creates a `profiles` row on signup.

- **`psychologists` is a separate table, not columns on `profiles`.** Clients
  and admins don't need those fields, and the public catalogue only reads this
  table filtered to `status = 'approved'`.

- **Filter facets are `text[]` arrays** (`specializations`, `client_categories`,
  `languages`) with GIN indexes. For a small team and fixed taxonomies this is
  simpler than join tables and filters fast: `where specializations @> '{КПТ}'`.
  If the taxonomy grows editable, revisit with reference tables.

- **Money is `int` minor units** (kopiykas). `price_minor = 25000` is 250 UAH.
  `bookings.price_minor` is a *snapshot* — if the psychologist changes their
  price later, past bookings keep the price they were made at.

- **Everything time-related is `timestamptz`** stored in UTC.

## Booking lifecycle

```
client picks slot
   └─► booking(status=pending_payment) + slot(status=held)
          └─► payment created via provider ──► gateway
                 ├─ paid    → booking=confirmed, slot=booked
                 └─ failed  → booking=cancelled, slot=open again
```

The paid/failed transition happens **server-side** in the payment webhook
handler (using the service-role key), never trusting the browser.

## Row Level Security (the important part)

Supabase exposes Postgres to the browser, so the database itself decides who can
see what. Every table has `RLS enabled` and explicit policies. Summary:

| Table              | Who can read                                  | Who can write                          |
| ------------------ | --------------------------------------------- | -------------------------------------- |
| profiles           | own row + admins                              | own row                                |
| psychologists      | `status=approved` (public) + own + admins     | own row (but NOT self-approve)         |
| availability_slots | everyone (to show the calendar)               | the owning psychologist                |
| bookings           | the client + the psychologist + admins        | client creates; status via server      |
| payments           | the booking's client + admins                 | server only (service-role key)         |

Two things to harden before launch (noted inline in the SQL):

1. A psychologist must **not** be able to set their own `status = 'approved'`.
   Enforce with an admin-only update path or a trigger.
2. Booking status changes (`confirmed`, `cancelled`) should be driven by the
   server after payment, not writable directly by the client.

## Generating TypeScript types

Once the schema is applied, generate types so the whole app is type-safe against
the DB:

```
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```

Then the Supabase client is fully typed. Re-run after every migration.
