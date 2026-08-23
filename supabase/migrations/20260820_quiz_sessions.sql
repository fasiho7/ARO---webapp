-- Aro quiz sessions. Question bank lives in the backend, not in this table.
-- Do not grant authenticated clients direct access: the Express API uses the service role.

create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  subtopic text,
  difficulty text not null,
  question_ids text[] not null,
  question_count integer not null,
  time_limit_seconds integer not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'expired')),
  score integer,
  percentage numeric(5, 2),
  answers jsonb not null default '{}'::jsonb,
  draft_answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists quiz_sessions_user_id_idx on public.quiz_sessions (user_id);
create index if not exists quiz_sessions_user_status_idx on public.quiz_sessions (user_id, status);
create index if not exists quiz_sessions_user_created_idx on public.quiz_sessions (user_id, created_at desc);

alter table public.quiz_sessions enable row level security;

revoke all on public.quiz_sessions from anon, public, authenticated;

-- No authenticated policies: users cannot query sessions (or answers) from the client SDK.
-- Backend service role bypasses RLS for create/read/submit.

comment on table public.quiz_sessions is
  'Quiz attempts. Correct answers are never stored here; scoring uses the server question bank.';
