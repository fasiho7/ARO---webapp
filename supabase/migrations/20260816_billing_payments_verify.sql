-- Additive billing fields for verified provider transactions.
-- Clients still cannot insert/update payments or profiles.plan.

alter table public.payments
  add column if not exists provider_transaction_id text;

alter table public.payments
  add column if not exists completed_at timestamptz;

create unique index if not exists payments_one_pending_per_provider_idx
  on public.payments (user_id, product, provider)
  where status = 'pending';

