-- Aro billing: payment/order records for Pro upgrades.
-- Clients may read their own rows. They cannot insert, update, or delete.
-- Only the backend (service role) writes payments and sets profiles.plan = 'pro'
-- after a verified successful payment. The frontend must never change plan.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null default 'aro_pro',
  amount numeric(12, 2) not null,
  currency text not null default 'PKR',
  provider text not null,
  status text not null default 'pending',
  provider_reference text,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_product_check check (product in ('aro_pro')),
  constraint payments_amount_positive check (amount > 0),
  constraint payments_currency_check check (char_length(currency) between 3 and 8),
  constraint payments_provider_check check (
    provider in ('mock', 'easypaisa', 'jazzcash', 'card', 'bank')
  ),
  constraint payments_status_check check (
    status in ('pending', 'successful', 'failed', 'cancelled')
  )
);

create index if not exists payments_user_id_created_at_idx
  on public.payments (user_id, created_at desc);

create index if not exists payments_status_idx
  on public.payments (status);

create unique index if not exists payments_provider_reference_idx
  on public.payments (provider_reference)
  where provider_reference is not null;

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

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
-- Service role bypasses RLS and is the only writer.
