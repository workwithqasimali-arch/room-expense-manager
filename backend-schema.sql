-- Production multi-device database schema (PostgreSQL/Supabase)
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null check(amount > 0),
  payer_member_id uuid not null references members(id),
  expense_date date not null,
  category text,
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  actor_member_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists expenses_household_date_idx on expenses(household_id, expense_date);
create index if not exists audit_household_time_idx on audit_log(household_id, created_at desc);

-- Month boundaries are calculated from expense_date:
-- month_start = date_trunc('month', expense_date)
-- month_end   = (date_trunc('month', expense_date) + interval '1 month - 1 day')::date
