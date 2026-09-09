-- Aro admin flag: grants access to /admin dashboard and payment approval/rejection.
-- is_admin is separate from plan (pro). An admin can be free or pro independently.
-- Only the service role may set is_admin = true. Authenticated users cannot change it.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Revoke any accidental update grant on is_admin from authenticated users.
-- The update grant list stays: full_name, username, avatar_url, selected_career only.
revoke update on public.profiles from authenticated;
grant update (full_name, username, avatar_url, selected_career) on public.profiles to authenticated;

-- Set the admin account. Replace the email if needed.
-- This runs only if the user already exists in auth.users (they must have signed up first).
update public.profiles
set is_admin = true
where email = 'fasihzeeshan07@gmail.com';
