# auth/

Sign up / sign in / sign out via Supabase Auth, plus the current-user hook and
role helpers (client | psychologist | admin).

On signup we create a matching `profiles` row (see DATA_MODEL.md). Booking
requires being logged in — gate it here, and also in the route via middleware.
