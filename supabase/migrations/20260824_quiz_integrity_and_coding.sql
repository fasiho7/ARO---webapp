-- Migration to add integrity telemetry logging to quiz_sessions.
-- Backend service role writes integrity signals (copy/paste attempts, tab visibility, fullscreen exit).

alter table public.quiz_sessions 
add column if not exists integrity_events jsonb not null default '[]'::jsonb;

comment on column public.quiz_sessions.integrity_events is 
'Anti-cheat integrity event telemetry (copy/paste attempts, tab visibility changes, fullscreen exits).';
