// lib/data/portal.ts
// Единственное место, где портал ходит в базу за показателями.
// Страницы (server components) и API-роуты используют одни и те же загрузчики,
// поэтому цифры на экране и в JSON никогда не разъезжаются.

import type { SupabaseServerClient } from '../supabase/server';
import type { CurrentEmployee } from '../auth/employee';
import { currentPeriod } from '../period';
import {
  joinEmployeesWithStats,
  latestStatByEmployee,
  rankBy,
  summarizeSalons,
  type RankInfo,
} from '../stats';
import type {
  Employee,
  EmployeeWithStats,
  MonthlyStat,
  MotivationBlock,
  Period,
  Salon,
  SalonSummary,
} from '../types/db';

const STATS_FIELDS =
  'employee_id, salon_id, year, month, val, retail_sales, hours, report_date';
const EMPLOYEE_LIST_FIELDS = 'id, full_name, position, salon_id';

type EmployeeListRow = Pick<Employee, 'id' | 'full_name' | 'position' | 'salon_id'>;

export class DataError extends Error {
  constructor(public scope: string, message: string) {
    super(message);
    this.name = 'DataError';
  }
}

function unwrap<T>(scope: string, res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new DataError(scope, res.error.message);
  return (res.data ?? []) as unknown as T;
}

// --- Личный кабинет -------------------------------------------------------

export type DashboardData = {
  period: Period;
  hasData: boolean;
  stats: { val: number; retail_sales: number; hours: number };
  reportDate: string | null;
  ranking: RankInfo;
};

export async function loadDashboard(
  supabase: SupabaseServerClient,
  current: CurrentEmployee
): Promise<DashboardData> {
  const period = currentPeriod();
  const salonId = current.employee.salon_id;

  const myStatsRes = await supabase
    .from('employee_monthly_stats')
    .select(STATS_FIELDS)
    .eq('employee_id', current.employee.id)
    .eq('year', period.year)
    .eq('month', period.month);

  const myStats = unwrap<MonthlyStat[]>('dashboard.stats', myStatsRes);
  const mine = latestStatByEmployee(myStats).get(current.employee.id) ?? null;

  let ranking: RankInfo = { place: null, total: 0, deltaToNext: null, deltaToFirst: null };

  if (salonId) {
    const [employeesRes, salonStatsRes] = await Promise.all([
      supabase
        .from('employees')
        .select(EMPLOYEE_LIST_FIELDS)
        .eq('salon_id', salonId)
        .eq('is_active', true),
      supabase
        .from('employee_monthly_stats')
        .select(STATS_FIELDS)
        .eq('salon_id', salonId)
        .eq('year', period.year)
        .eq('month', period.month),
    ]);

    const employees = unwrap<EmployeeListRow[]>('dashboard.employees', employeesRes);
    const salonStats = unwrap<MonthlyStat[]>('dashboard.salonStats', salonStatsRes);
    const rows = joinEmployeesWithStats(
      employees,
      salonStats,
      current.salon ? [current.salon] : []
    );
    ranking = rankBy(rows, current.employee.id, 'val');
  }

  return {
    period,
    hasData: Boolean(mine),
    stats: {
      val: Number(mine?.val ?? 0),
      retail_sales: Number(mine?.retail_sales ?? 0),
      hours: Number(mine?.hours ?? 0),
    },
    reportDate: mine?.report_date ?? null,
    ranking,
  };
}

// --- Мотивация ------------------------------------------------------------

export type MotivationData = DashboardData & { blocks: MotivationBlock[] };

export async function loadMotivation(
  supabase: SupabaseServerClient,
  current: CurrentEmployee
): Promise<MotivationData> {
  const [dashboard, blocksRes] = await Promise.all([
    loadDashboard(supabase, current),
    supabase
      .from('motivation_blocks')
      .select('id, code, title, subtitle, body, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true }),
  ]);

  return {
    ...dashboard,
    blocks: unwrap<MotivationBlock[]>('motivation.blocks', blocksRes),
  };
}

// --- Салон (администратор и управляющий) ----------------------------------

export type SalonViewData = {
  period: Period;
  salon: Salon | null;
  employees: EmployeeWithStats[];
  summary: SalonSummary | null;
};

export async function loadSalonView(
  supabase: SupabaseServerClient,
  current: CurrentEmployee
): Promise<SalonViewData> {
  const period = currentPeriod();
  const salonId = current.employee.salon_id;

  if (!salonId) {
    return { period, salon: null, employees: [], summary: null };
  }

  // Фильтр по salon_id стоит и здесь, и в RLS: чужой салон не должен
  // утечь даже при неверно настроенных политиках базы.
  const [employeesRes, statsRes] = await Promise.all([
    supabase
      .from('employees')
      .select(EMPLOYEE_LIST_FIELDS)
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('full_name', { ascending: true }),
    supabase
      .from('employee_monthly_stats')
      .select(STATS_FIELDS)
      .eq('salon_id', salonId)
      .eq('year', period.year)
      .eq('month', period.month),
  ]);

  const employees = unwrap<EmployeeListRow[]>('salon.employees', employeesRes);
  const stats = unwrap<MonthlyStat[]>('salon.stats', statsRes);
  const salons = current.salon ? [current.salon] : [];
  const rows = joinEmployeesWithStats(employees, stats, salons);

  return {
    period,
    salon: current.salon,
    employees: rows,
    summary: summarizeSalons(rows)[0] ?? null,
  };
}

// --- Сеть (директор) ------------------------------------------------------

export type NetworkViewData = {
  period: Period;
  salons: Salon[];
  salonsSummary: SalonSummary[];
  employees: EmployeeWithStats[];
};

export async function loadNetworkView(
  supabase: SupabaseServerClient
): Promise<NetworkViewData> {
  const period = currentPeriod();

  const [employeesRes, statsRes, salonsRes] = await Promise.all([
    supabase
      .from('employees')
      .select(EMPLOYEE_LIST_FIELDS)
      .eq('is_active', true)
      .order('full_name', { ascending: true }),
    supabase
      .from('employee_monthly_stats')
      .select(STATS_FIELDS)
      .eq('year', period.year)
      .eq('month', period.month),
    supabase.from('salons').select('id, name').order('name', { ascending: true }),
  ]);

  const employees = unwrap<EmployeeListRow[]>('network.employees', employeesRes);
  const stats = unwrap<MonthlyStat[]>('network.stats', statsRes);
  const salons = unwrap<Salon[]>('network.salons', salonsRes);

  const rows = joinEmployeesWithStats(employees, stats, salons);

  return {
    period,
    // Список салонов берём из справочника, а не из тех, по кому уже есть
    // отчёты, — иначе новый салон не появится в фильтре до первой выгрузки.
    salons,
    salonsSummary: summarizeSalons(rows),
    employees: rows,
  };
}
