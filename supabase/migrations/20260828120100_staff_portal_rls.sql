-- 20260828120100_staff_portal_rls.sql
--
-- RLS для портала.
--
-- Прежняя версия политик подставляла подзапрос к public.employees
-- внутрь политики НА public.employees — PostgreSQL отвечает на такое
-- ошибкой "infinite recursion detected in policy for relation employees".
-- Поэтому здесь всё, что нужно знать о текущем пользователе, вынесено
-- в security definer функции: они читают employees в обход RLS.

-- 1. Роль из должности — та же логика, что в lib/roles.ts ------------------

create or replace function public.role_from_position(p text)
returns text
language sql
immutable
as $$
  select case
    when p is null then 'master'
    when lower(replace(p, 'ё', 'е')) like '%директор%' then 'director'
    when lower(replace(p, 'ё', 'е')) like '%управляющ%' then 'manager'
    when lower(replace(p, 'ё', 'е')) like '%администратор%' then 'admin'
    when lower(replace(p, 'ё', 'е')) like '%админ%' then 'admin'
    else 'master'
  end;
$$;

-- 2. Кто сейчас смотрит ----------------------------------------------------

create or replace function public.current_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.id
  from public.employees e
  where e.user_id = auth.uid()
    and e.is_active
  limit 1;
$$;

create or replace function public.current_employee_salon_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.salon_id
  from public.employees e
  where e.user_id = auth.uid()
    and e.is_active
  limit 1;
$$;

create or replace function public.current_employee_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.role_from_position(e.position)
  from public.employees e
  where e.user_id = auth.uid()
    and e.is_active
  limit 1;
$$;

revoke all on function public.current_employee_id() from public;
revoke all on function public.current_employee_salon_id() from public;
revoke all on function public.current_employee_role() from public;
grant execute on function public.current_employee_id() to authenticated;
grant execute on function public.current_employee_salon_id() to authenticated;
grant execute on function public.current_employee_role() to authenticated;
grant execute on function public.role_from_position(text) to authenticated;

-- 3. Включаем RLS ----------------------------------------------------------

alter table public.salons enable row level security;
alter table public.roles enable row level security;
alter table public.employees enable row level security;
alter table public.employee_monthly_stats enable row level security;
alter table public.motivation_blocks enable row level security;

drop policy if exists salons_select on public.salons;
drop policy if exists roles_select on public.roles;
drop policy if exists employees_select on public.employees;
drop policy if exists employee_monthly_stats_select on public.employee_monthly_stats;
drop policy if exists motivation_blocks_select on public.motivation_blocks;

-- 4. Салоны ----------------------------------------------------------------
-- Директор видит все салоны (нужно для фильтра на его экране),
-- остальные — только свой.

create policy salons_select on public.salons
for select to authenticated
using (
  public.current_employee_role() = 'director'
  or id = public.current_employee_salon_id()
);

-- 5. Справочник должностей — читаемый всем сотрудникам ---------------------

create policy roles_select on public.roles
for select to authenticated
using (public.current_employee_id() is not null);

-- 6. Сотрудники ------------------------------------------------------------
-- Директор — вся сеть. Управляющий и администратор — свой салон.
-- Мастер — только себя.

create policy employees_select on public.employees
for select to authenticated
using (
  case public.current_employee_role()
    when 'director' then true
    when 'manager' then salon_id = public.current_employee_salon_id()
    when 'admin' then salon_id = public.current_employee_salon_id()
    else id = public.current_employee_id()
  end
);

-- 7. Показатели ------------------------------------------------------------

create policy employee_monthly_stats_select on public.employee_monthly_stats
for select to authenticated
using (
  case public.current_employee_role()
    when 'director' then true
    when 'manager' then salon_id = public.current_employee_salon_id()
    when 'admin' then salon_id = public.current_employee_salon_id()
    else employee_id = public.current_employee_id()
  end
);

-- 8. Блоки мотивации -------------------------------------------------------
-- Глобальные блоки (salon_id is null) видят все, остальные — свой салон.

create policy motivation_blocks_select on public.motivation_blocks
for select to authenticated
using (
  public.current_employee_id() is not null
  and (
    salon_id is null
    or salon_id = public.current_employee_salon_id()
    or public.current_employee_role() = 'director'
  )
);

-- Запись во все таблицы идёт только service_role-ключом (1С-робот
-- и Supabase Studio), он RLS не проверяет — отдельные политики не нужны.
