-- Aro access control: Free vs Pro plan.
-- Existing and new users default to free.
-- Users cannot change plan themselves. Billing (later) should update
-- public.profiles.plan with the service role from free to pro.

alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'pro'));

update public.profiles
set plan = 'free'
where plan is null or plan not in ('free', 'pro');

revoke update on public.profiles from authenticated;
grant update (full_name, username, avatar_url, selected_career) on public.profiles to authenticated;
