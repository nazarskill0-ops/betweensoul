-- ============================================================================
-- Calmi — initial schema (DRAFT for review)
-- Postgres / Supabase. Run in the Supabase SQL editor or via the CLI.
--
-- Key principles baked in here:
--   1. Money is stored as INTEGER minor units (kopiykas). Never float.
--   2. All timestamps are timestamptz, stored in UTC.
--   3. Row Level Security (RLS) is ON for every table. Without a matching
--      policy, nobody can read/write a row — that is the point.
--   4. A "profile" row mirrors each auth.users row and carries the role.
-- ============================================================================

-- ---------- enums ----------
create type user_role as enum ('client', 'psychologist', 'admin');
create type psychologist_status as enum ('pending', 'approved', 'rejected');
create type slot_status as enum ('open', 'held', 'booked');
create type booking_status as enum ('pending_payment', 'confirmed', 'completed', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'failed');
create type payment_provider as enum ('liqpay', 'wayforpay');

-- ---------- profiles ----------
-- One row per authenticated user. Extends Supabase's auth.users.
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        user_role not null default 'client',
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ---------- psychologists ----------
-- Extra data for profiles whose role = 'psychologist'.
-- Public listing only shows rows where status = 'approved'.
create table psychologists (
  profile_id        uuid primary key references profiles (id) on delete cascade,
  status            psychologist_status not null default 'pending',
  headline          text,                       -- short tagline
  bio               text,
  experience_years  int,
  price_minor       int not null default 0,     -- per session, in kopiykas
  -- Filter facets. Arrays + GIN index = simple filtering for a small team.
  -- Values come from the fixed taxonomies in the app (see _design_ref form).
  services          text[] not null default '{}',   -- 'Особиста терапія', 'Парна терапія', ...
  topics            text[] not null default '{}',   -- 'Панічні атаки', 'ПТСР', ... (что беспокоит клиента)
  specializations   text[] not null default '{}',   -- 'КПТ', 'Гештальт', ... (метод терапии)
  client_categories text[] not null default '{}',   -- 'couples', 'children', ...
  -- Образование: { higher: [...], courses: [...], other: [...] },
  -- каждый пункт { title, speciality?, years?, certificateUrls[] }.
  -- jsonb, потому что структура редактируется целиком в профиле и не фильтруется.
  education         jsonb not null default '{"higher":[],"courses":[],"other":[]}',
  languages         text[] not null default '{}',   -- 'uk', 'ru', 'en'
  verified_at       timestamptz,
  created_at        timestamptz not null default now()
);
create index psychologists_services_idx on psychologists using gin (services);
create index psychologists_topics_idx on psychologists using gin (topics);
create index psychologists_specializations_idx on psychologists using gin (specializations);
create index psychologists_categories_idx on psychologists using gin (client_categories);
create index psychologists_price_idx on psychologists (price_minor);

-- ---------- availability_slots ----------
create table availability_slots (
  id              uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references psychologists (profile_id) on delete cascade,
  starts_at       timestamptz not null,   -- UTC
  ends_at         timestamptz not null,
  status          slot_status not null default 'open',
  created_at      timestamptz not null default now()
);
create index slots_psychologist_time_idx on availability_slots (psychologist_id, starts_at);

-- ---------- bookings ----------
create table bookings (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references profiles (id) on delete restrict,
  psychologist_id uuid not null references psychologists (profile_id) on delete restrict,
  slot_id         uuid not null references availability_slots (id) on delete restrict,
  status          booking_status not null default 'pending_payment',
  price_minor     int not null,           -- snapshot of price at booking time
  created_at      timestamptz not null default now()
);
create index bookings_client_idx on bookings (client_id);
create index bookings_psychologist_idx on bookings (psychologist_id);

-- ---------- reviews ----------
-- Отзывы пишутся сервером после завершённой сессии (service role),
-- клиент напрямую строки не создаёт.
create table reviews (
  id              uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references psychologists (profile_id) on delete cascade,
  client_id       uuid references profiles (id) on delete set null,
  author_name     text not null,           -- как показывать (может быть 'Анонімно')
  rating          int not null check (rating between 1 and 5),
  topics          text[] not null default '{}',
  body            text,
  created_at      timestamptz not null default now()
);
create index reviews_psychologist_idx on reviews (psychologist_id);

-- ---------- payments ----------
create table payments (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references bookings (id) on delete cascade,
  provider     payment_provider not null,
  provider_ref text,                       -- gateway transaction id
  amount_minor int not null,
  status       payment_status not null default 'pending',
  created_at   timestamptz not null default now()
);
create index payments_booking_idx on payments (booking_id);

-- ============================================================================
-- Row Level Security
-- Turn RLS on, then add explicit policies. Default = deny.
-- ============================================================================
alter table profiles            enable row level security;
alter table psychologists       enable row level security;
alter table availability_slots  enable row level security;
alter table bookings            enable row level security;
alter table payments            enable row level security;
alter table reviews             enable row level security;

-- reviews: читают все (публичные на странице психолога), пишет только сервер.
create policy "reviews: public read" on reviews
  for select using (true);

-- helper: is the current user an admin?
create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: a user sees & edits only their own row; admins see all.
create policy "profiles: read own" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles: update own" on profiles
  for update using (id = auth.uid());
create policy "profiles: insert own" on profiles
  for insert with check (id = auth.uid());

-- psychologists: APPROVED profiles are public (anyone can browse the catalogue);
-- the psychologist themself and admins can always see/edit their own row.
create policy "psychologists: public read approved" on psychologists
  for select using (status = 'approved' or profile_id = auth.uid() or is_admin());
create policy "psychologists: self upsert" on psychologists
  for insert with check (profile_id = auth.uid());
create policy "psychologists: self update" on psychologists
  for update using (profile_id = auth.uid());
-- NOTE: changing `status` to 'approved' must be admin-only. Enforce that with a
-- trigger or a separate admin-only policy — do NOT let a psychologist self-approve.

-- availability_slots: open slots are public; the owner manages their own.
create policy "slots: public read" on availability_slots
  for select using (true);
create policy "slots: owner manage" on availability_slots
  for all using (psychologist_id = auth.uid())
  with check (psychologist_id = auth.uid());

-- bookings: the client and the psychologist involved can see it; client creates it.
create policy "bookings: participants read" on bookings
  for select using (
    client_id = auth.uid() or psychologist_id = auth.uid() or is_admin()
  );
create policy "bookings: client create" on bookings
  for insert with check (client_id = auth.uid());

-- payments: only the booking's client (and admin) can read; writes happen
-- server-side with the service role key (which bypasses RLS), so no insert
-- policy for regular users on purpose.
create policy "payments: client read" on payments
  for select using (
    is_admin() or exists (
      select 1 from bookings b
      where b.id = payments.booking_id and b.client_id = auth.uid()
    )
  );
