-- 20260828120000_staff_portal_schema.sql
--
-- Каноническая схема портала сотрудников.
--
-- Заменяет прежние миграции, которые не совпадали с боевой базой:
-- в них были employees.auth_user_id / started_at / payroll_gross,
-- тогда как портал и 1С-робот работают с user_id / start_date / val / hours.
-- Кроме того, там был синтаксис "alter table ... add constraint if not exists",
-- которого в PostgreSQL не существует, и рекурсивные RLS-политики.
--
-- Источник истины для показателей — 1С. Робот пишет сюда service_role-ключом
-- и RLS не затрагивает; политики ниже нужны только для чтения из портала.

create extension if not exists "pgcrypto";

-- 1. Салоны ---------------------------------------------------------------

create table if not exists public.salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Справочник должностей ------------------------------------------------
-- employees.role_id ссылается сюда. Портал права по нему НЕ считает:
-- показывать пользователю UUID бессмысленно, поэтому роль выводится
-- из текстовой должности employees.position (см. lib/roles.ts).

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null
);

insert into public.roles (code, title)
values
  ('master', 'Мастер'),
  ('admin', 'Администратор'),
  ('manager', 'Управляющий'),
  ('director', 'Директор')
on conflict (code) do nothing;

-- 3. Сотрудники -----------------------------------------------------------

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  external_id text unique,
  full_name text not null,
  email text unique,
  login text,
  position text,
  role_id uuid references public.roles (id) on delete set null,
  salon_id uuid references public.salons (id) on delete restrict,
  start_date date,
  hired_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_user_id_idx on public.employees (user_id);
create index if not exists employees_salon_id_idx on public.employees (salon_id);
-- Робот сопоставляет сотрудников по ФИО из отчёта 1С.
create index if not exists employees_full_name_idx on public.employees (full_name);

-- 4. Показатели за месяц --------------------------------------------------

create table if not exists public.employee_monthly_stats (
  id bigserial primary key,
  employee_id uuid not null references public.employees (id) on delete cascade,
  salon_id uuid not null references public.salons (id) on delete cascade,

  year int not null check (year >= 2000),
  month int not null check (month between 1 and 12),

  val numeric(12, 2) not null default 0,
  retail_sales numeric(12, 2) not null default 0,
  hours numeric(7, 2) not null default 0,

  report_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Робот перед вставкой удаляет все строки за месяц, поэтому одна строка
  -- на сотрудника в месяц — это контракт, а не случайность.
  constraint employee_monthly_stats_unique_period unique (employee_id, year, month)
);

create index if not exists employee_monthly_stats_period_idx
  on public.employee_monthly_stats (year, month);

create index if not exists employee_monthly_stats_salon_period_idx
  on public.employee_monthly_stats (salon_id, year, month);

-- 5. Текстовые блоки мотивации -------------------------------------------

create table if not exists public.motivation_blocks (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references public.salons (id) on delete cascade,
  code text,
  title text not null,
  subtitle text,
  body text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists motivation_blocks_salon_sort_idx
  on public.motivation_blocks (salon_id, sort_order);

-- 6. updated_at ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_timestamp_on_salons on public.salons;
create trigger set_timestamp_on_salons before update on public.salons
for each row execute function public.set_updated_at();

drop trigger if exists set_timestamp_on_employees on public.employees;
create trigger set_timestamp_on_employees before update on public.employees
for each row execute function public.set_updated_at();

drop trigger if exists set_timestamp_on_stats on public.employee_monthly_stats;
create trigger set_timestamp_on_stats before update on public.employee_monthly_stats
for each row execute function public.set_updated_at();

drop trigger if exists set_timestamp_on_motivation_blocks on public.motivation_blocks;
create trigger set_timestamp_on_motivation_blocks before update on public.motivation_blocks
for each row execute function public.set_updated_at();
