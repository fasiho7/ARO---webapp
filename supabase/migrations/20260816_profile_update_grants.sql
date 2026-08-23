-- Additive hardening if 20260815 was already applied.
-- Users may update profile application fields only — never id/email/timestamps.

revoke update on public.profiles from authenticated;
grant update (full_name, username, avatar_url, selected_career) on public.profiles to authenticated;
