-- FitNotes — Supabase schema + Row-Level Security
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Design notes:
--  * Row ids are TEXT and match the ids generated on-device (lib/id.ts), so the
--    sync layer can upsert 1:1 by id with no id remapping.
--  * Every table has user_id uuid referencing auth.users, defaulting to the
--    caller (auth.uid()), and RLS so each user only ever sees their own rows.
--  * updated_at drives last-write-wins; synced is a client-only concern and is
--    intentionally omitted from the cloud tables.

-- ──────────────────────────────────────────────────────────────────────────
-- Profiles (1:1 with auth.users)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────────────────────────────────
-- Domain tables (mirror the local SQLite schema)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.user_goals (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  calorie_goal int not null,
  protein_goal_g int not null,
  water_goal_l numeric not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_stats (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date text not null,
  water_l numeric not null default 0,
  steps int not null default 0,
  active_minutes int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.food_logs (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  meal_type text not null,
  food_name text not null,
  detail text,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  logged_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  muscle_group text,
  started_at timestamptz not null,
  finished_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_exercises (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  session_id text not null,
  name text not null,
  muscle_group text,
  order_index int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_sets (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  exercise_id text not null,
  set_number int not null,
  weight_kg numeric not null default 0,
  reps int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_notes (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  content text,
  energy_level int,
  sleep_hours numeric,
  noted_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.body_weights (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  weight_kg numeric not null,
  recorded_at timestamptz not null,
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- Row-Level Security: a user may only touch their own rows.
-- ──────────────────────────────────────────────────────────────────────────
do $$
declare
  t text;
  tables text[] := array[
    'user_goals','daily_stats','food_logs','workout_sessions',
    'workout_exercises','exercise_sets','daily_notes','body_weights'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($f$
      drop policy if exists "own_rows_select" on public.%1$I;
      drop policy if exists "own_rows_insert" on public.%1$I;
      drop policy if exists "own_rows_update" on public.%1$I;
      drop policy if exists "own_rows_delete" on public.%1$I;
      create policy "own_rows_select" on public.%1$I for select using (user_id = auth.uid());
      create policy "own_rows_insert" on public.%1$I for insert with check (user_id = auth.uid());
      create policy "own_rows_update" on public.%1$I for update using (user_id = auth.uid()) with check (user_id = auth.uid());
      create policy "own_rows_delete" on public.%1$I for delete using (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- Profiles RLS (id is the user's own uid).
alter table public.profiles enable row level security;
drop policy if exists "own_profile_select" on public.profiles;
drop policy if exists "own_profile_insert" on public.profiles;
drop policy if exists "own_profile_update" on public.profiles;
create policy "own_profile_select" on public.profiles for select using (id = auth.uid());
create policy "own_profile_insert" on public.profiles for insert with check (id = auth.uid());
create policy "own_profile_update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
