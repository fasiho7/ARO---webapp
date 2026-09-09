-- =============================================================================
-- Aro Security Hardening: Row Level Security (RLS) — copy/paste into Supabase SQL Editor
-- =============================================================================
-- Covers: profiles, payments, quiz_sessions (there is no "quizzes" table in this project).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS throughout.
--
-- Guarantees:
--   • Authenticated users read/update ONLY their own profile rows.
--   • Users CANNOT update plan, is_admin, id, email, or timestamps from the browser.
--   • Users can read ONLY their own payment rows; they cannot write payments.
--   • Users have NO direct access to quiz_sessions (backend service role only).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, public;
grant select, insert on public.profiles to authenticated;

-- Column-level update: application fields only. plan/is_admin/email/id/timestamps are server-owned.
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

-- RLS defense-in-depth: even if column grants drift, plan and is_admin cannot change client-side.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and plan is not distinct from (
      select p.plan from public.profiles as p where p.id = auth.uid()
    )
    and is_admin is not distinct from (
      select p.is_admin from public.profiles as p where p.id = auth.uid()
    )
  );

-- Trigger: block plan/is_admin mutation unless caller is service_role (backend billing/admin).
create or replace function public.guard_profiles_privileged_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if new.plan is distinct from old.plan then
    raise exception 'plan cannot be updated from the client'
      using errcode = '42501';
  end if;

  if new.is_admin is distinct from old.is_admin then
    raise exception 'is_admin cannot be updated from the client'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged_columns on public.profiles;
create trigger profiles_guard_privileged_columns
  before update on public.profiles
  for each row execute function public.guard_profiles_privileged_columns();

-- ---------------------------------------------------------------------------
-- 2. payments
-- ---------------------------------------------------------------------------

alter table public.payments enable row level security;

revoke all on public.payments from anon, public, authenticated;
grant select on public.payments to authenticated;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No insert / update / delete policies for authenticated or anon.
-- Service role bypasses RLS and is the only writer (billing backend).

-- ---------------------------------------------------------------------------
-- 3. quiz_sessions (quiz data — not exposed to browser clients)
-- ---------------------------------------------------------------------------

alter table public.quiz_sessions enable row level security;

revoke all on public.quiz_sessions from anon, public, authenticated;

-- Explicit deny: no authenticated policies. Express API uses service role only.
drop policy if exists "quiz_sessions_select_own" on public.quiz_sessions;
drop policy if exists "quiz_sessions_insert_own" on public.quiz_sessions;
drop policy if exists "quiz_sessions_update_own" on public.quiz_sessions;
drop policy if exists "quiz_sessions_delete_own" on public.quiz_sessions;

comment on table public.quiz_sessions is
  'Quiz attempts. No client SDK access. Backend service role reads/writes via Express API.';

-- ---------------------------------------------------------------------------
-- Verification (optional — run manually after applying)
-- ---------------------------------------------------------------------------
-- select tablename, rowsecurity from pg_tables
--   where schemaname = 'public'
--     and tablename in ('profiles', 'payments', 'quiz_sessions');
--
-- select policyname, tablename, cmd, roles
--   from pg_policies
--   where schemaname = 'public'
--     and tablename in ('profiles', 'payments', 'quiz_sessions')
--   order by tablename, policyname;
