-- Aro Step 3: profiles + per-user progress.
-- Run this in the Supabase SQL Editor (or via the CLI) on the existing project.
-- Passwords are NEVER stored here. Supabase Auth (auth.users) is the only credential store.

-- ---------------------------------------------------------------------------
-- Profiles (application data only)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  username text unique,
  email text,
  avatar_url text,
  selected_career text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_selected_career_idx on public.profiles (selected_career);

-- ---------------------------------------------------------------------------
-- Coding / roadmap progress (one row per authenticated user)
-- ---------------------------------------------------------------------------

create table if not exists public.coding_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  completed_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmap_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  records jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists coding_progress_set_updated_at on public.coding_progress;
create trigger coding_progress_set_updated_at
  before update on public.coding_progress
  for each row execute function public.set_updated_at();

drop trigger if exists roadmap_progress_set_updated_at on public.roadmap_progress;
create trigger roadmap_progress_set_updated_at
  before update on public.roadmap_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Create a profile when a Supabase Auth user is created.
-- SECURITY DEFINER: runs with owner rights so it can insert despite RLS.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  uname text;
begin
  base := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      '[^a-zA-Z0-9]+',
      '',
      'g'
    )
  );
  if length(base) < 2 then
    base := 'learner';
  end if;
  base := left(base, 18);
  uname := base || substr(replace(new.id::text, '-', ''), 1, 6);

  insert into public.profiles (id, full_name, username, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Learner'),
    uname,
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
    set email = new.email
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_updated();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- A user can only read/write their own rows. No public/anon access.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.coding_progress enable row level security;
alter table public.roadmap_progress enable row level security;

revoke all on public.profiles from anon, public;
revoke all on public.coding_progress from anon, public;
revoke all on public.roadmap_progress from anon, public;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.coding_progress to authenticated;
grant select, insert, update on public.roadmap_progress to authenticated;

-- Application columns only. Auth email/id stay owned by Supabase Auth.
revoke update on public.profiles from authenticated;
grant update (full_name, username, avatar_url, selected_career) on public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "coding_progress_select_own" on public.coding_progress;
create policy "coding_progress_select_own"
  on public.coding_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "coding_progress_insert_own" on public.coding_progress;
create policy "coding_progress_insert_own"
  on public.coding_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "coding_progress_update_own" on public.coding_progress;
create policy "coding_progress_update_own"
  on public.coding_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "roadmap_progress_select_own" on public.roadmap_progress;
create policy "roadmap_progress_select_own"
  on public.roadmap_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "roadmap_progress_insert_own" on public.roadmap_progress;
create policy "roadmap_progress_insert_own"
  on public.roadmap_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "roadmap_progress_update_own" on public.roadmap_progress;
create policy "roadmap_progress_update_own"
  on public.roadmap_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
