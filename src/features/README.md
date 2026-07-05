# features/

Each folder here is one domain area of the app. This is where 90% of the code
lives. **`psychologists/` is the reference implementation — copy its shape.**

A feature folder looks like:

```
<feature>/
  schema.ts        Zod schemas + inferred TS types (the single source of truth)
  api.ts           Data access — the ONLY place that queries Supabase for this feature
  hooks/           TanStack Query hooks that wrap api.ts (useX())
  components/      React components for this feature
```

Rules of thumb:

- A page in `src/app/` imports from a feature. A feature never imports from
  `src/app/`.
- Features can share code via `src/lib/` and `src/components/ui/`, not by
  reaching into each other's folders.
- If two features need the same thing, it belongs in `lib/` or `components/ui/`.

See [../../docs/RULES.md](../../docs/RULES.md).
