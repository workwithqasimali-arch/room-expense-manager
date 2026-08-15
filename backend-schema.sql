-- Run this once in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists households (
  id uuid primary key,
  name text not null,
  email text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists members (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  password_hash text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists expenses (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null check(amount > 0),
  payer_member_id uuid not null references members(id),
  expense_date date not null,
  category text,
  notes text,
  created_by_member_id uuid references members(id),
  updated_at timestamptz not null default now()
);
create table if not exists audit_log (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  actor_member_id uuid references members(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists expenses_household_date_idx on expenses(household_id, expense_date);
create index if not exists audit_household_time_idx on audit_log(household_id, created_at desc);

alter table households enable row level security;
alter table members enable row level security;
alter table expenses enable row level security;
alter table audit_log enable row level security;

drop policy if exists household_owner_all on households;
create policy household_owner_all on households for all to authenticated using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());

drop policy if exists members_household_all on members;
create policy members_household_all on members for all to authenticated using(exists(select 1 from households h where h.id=members.household_id and h.owner_user_id=auth.uid())) with check(exists(select 1 from households h where h.id=members.household_id and h.owner_user_id=auth.uid()));

drop policy if exists expenses_household_all on expenses;
create policy expenses_household_all on expenses for all to authenticated using(exists(select 1 from households h where h.id=expenses.household_id and h.owner_user_id=auth.uid())) with check(exists(select 1 from households h where h.id=expenses.household_id and h.owner_user_id=auth.uid()));

drop policy if exists audit_household_all on audit_log;
create policy audit_household_all on audit_log for all to authenticated using(exists(select 1 from households h where h.id=audit_log.household_id and h.owner_user_id=auth.uid())) with check(exists(select 1 from households h where h.id=audit_log.household_id and h.owner_user_id=auth.uid()));

-- Because all roommates intentionally share the same Supabase email/password,
-- the app performs the second, roommate-profile password check in the UI.
-- Never expose the service_role key in config.js.
