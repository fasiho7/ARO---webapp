-- Quiz code is graded only by the execution service. Persist the completed
-- review so later result reads never use a synchronous/local scoring fallback.

alter table public.quiz_sessions
  add column if not exists grading_status text not null default 'ungraded'
    check (grading_status in ('graded', 'ungraded'));

alter table public.quiz_sessions
  add column if not exists result_review jsonb not null default '[]'::jsonb;
