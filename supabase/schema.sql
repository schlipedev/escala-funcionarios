-- ============================================================
-- Escala de Funcionários — Supabase schema
-- Run this in the Supabase SQL Editor to provision the database.
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#2563eb',
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  created_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists shifts_shift_date_idx on public.shifts (shift_date);
create index if not exists shifts_employee_id_idx on public.shifts (employee_id);

-- ---------- Row Level Security ----------
-- This app is a public static site using the anon key from the browser.
-- The policies below allow public read/write. Tighten these (e.g. require
-- authentication) if you add Supabase Auth later.

alter table public.locations enable row level security;
alter table public.employees enable row level security;
alter table public.shifts enable row level security;

drop policy if exists "public_all_locations" on public.locations;
create policy "public_all_locations" on public.locations
  for all using (true) with check (true);

drop policy if exists "public_all_employees" on public.employees;
create policy "public_all_employees" on public.employees
  for all using (true) with check (true);

drop policy if exists "public_all_shifts" on public.shifts;
create policy "public_all_shifts" on public.shifts
  for all using (true) with check (true);

-- ============================================================
-- Optional: sample seed data (locations, employees, shifts)
-- ============================================================

with loc as (
  insert into public.locations (name, color) values
    ('Loja Centro', '#2563eb'),
    ('Loja Shopping', '#16a34a'),
    ('Depósito', '#ea580c')
  returning id, name
),
emp as (
  insert into public.employees (name, role) values
    ('Ana Silva', 'Vendedora'),
    ('Bruno Costa', 'Caixa'),
    ('Carla Souza', 'Gerente'),
    ('Diego Alves', 'Estoquista')
  returning id, name
)
insert into public.shifts (employee_id, location_id, shift_date, start_time, end_time, notes)
select
  (select id from emp where name = 'Ana Silva'),
  (select id from loc where name = 'Loja Centro'),
  date_trunc('week', current_date)::date + 0,
  '08:00'::time, '16:00'::time, 'Turno da manhã'
union all
select
  (select id from emp where name = 'Bruno Costa'),
  (select id from loc where name = 'Loja Centro'),
  date_trunc('week', current_date)::date + 0,
  '12:00'::time, '20:00'::time, null
union all
select
  (select id from emp where name = 'Carla Souza'),
  (select id from loc where name = 'Loja Shopping'),
  date_trunc('week', current_date)::date + 1,
  '09:00'::time, '18:00'::time, null
union all
select
  (select id from emp where name = 'Diego Alves'),
  (select id from loc where name = 'Depósito'),
  date_trunc('week', current_date)::date + 2,
  '07:00'::time, '15:00'::time, 'Recebimento de mercadoria';
