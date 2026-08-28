// lib/stats.ts
// Сборка «сотрудник + показатели за месяц» и рейтингов.
// Вынесено сюда, чтобы /admin, /manager и /director считали одинаково,
// а не тремя слегка разными копиями кода, как было раньше.

import type {
  Employee,
  EmployeeWithStats,
  Metric,
  MonthlyStat,
  Salon,
  SalonSummary,
} from './types/db';

export const METRICS: Metric[] = ['val', 'retail_sales', 'hours'];

export function isMetric(value: unknown): value is Metric {
  return typeof value === 'string' && (METRICS as string[]).includes(value);
}

/** Значение выбранного показателя у строки рейтинга. */
export function metricValue(row: EmployeeWithStats, metric: Metric): number {
  if (metric === 'val') return row.val;
  if (metric === 'retail_sales') return row.retail_sales;
  return row.hours;
}

function num(value: number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Из отчёта могут прийти несколько строк за один месяц (разные report_date).
 * Берём самую свежую по report_date — она и есть актуальные данные 1С.
 */
export function latestStatByEmployee(
  stats: MonthlyStat[]
): Map<string, MonthlyStat> {
  const map = new Map<string, MonthlyStat>();

  for (const row of stats) {
    const existing = map.get(row.employee_id);
    if (!existing) {
      map.set(row.employee_id, row);
      continue;
    }
    const a = existing.report_date ?? '';
    const b = row.report_date ?? '';
    if (b >= a) map.set(row.employee_id, row);
  }

  return map;
}

/** Склеивает список сотрудников с их показателями за период. */
export function joinEmployeesWithStats(
  employees: Pick<Employee, 'id' | 'full_name' | 'position' | 'salon_id'>[],
  stats: MonthlyStat[],
  salons: Salon[]
): EmployeeWithStats[] {
  const statByEmployee = latestStatByEmployee(stats);
  const salonById = new Map(salons.map((s) => [s.id, s]));

  return employees.map((e) => {
    const stat = statByEmployee.get(e.id);
    return {
      employee_id: e.id,
      full_name: e.full_name,
      position: e.position,
      salon_id: e.salon_id,
      salon_name: e.salon_id ? salonById.get(e.salon_id)?.name ?? null : null,
      val: num(stat?.val),
      retail_sales: num(stat?.retail_sales),
      hours: num(stat?.hours),
      has_data: Boolean(stat),
    };
  });
}

/** Сводка по салонам. Считаются только сотрудники, попавшие в отчёт. */
export function summarizeSalons(rows: EmployeeWithStats[]): SalonSummary[] {
  const bySalon = new Map<string, SalonSummary>();

  for (const row of rows) {
    if (!row.salon_id || !row.has_data) continue;

    let agg = bySalon.get(row.salon_id);
    if (!agg) {
      agg = {
        salon_id: row.salon_id,
        salon_name: row.salon_name,
        val: 0,
        retail_sales: 0,
        hours: 0,
        employees_count: 0,
      };
      bySalon.set(row.salon_id, agg);
    }

    agg.val += row.val;
    agg.retail_sales += row.retail_sales;
    agg.hours += row.hours;
    agg.employees_count += 1;
  }

  return Array.from(bySalon.values());
}

/**
 * Место сотрудника в рейтинге по валу и сколько не хватает до соседа сверху.
 * Одинаковый вал даёт одинаковое место — иначе два мастера с 200 000 ₽
 * получали бы разные «первое» и «второе».
 */
export type RankInfo = {
  place: number | null;
  total: number;
  deltaToNext: number | null;
  deltaToFirst: number | null;
};

export function rankBy(
  rows: EmployeeWithStats[],
  employeeId: string,
  metric: Metric
): RankInfo {
  const ranked = rows.filter((r) => r.has_data);
  const total = ranked.length;

  if (total === 0) {
    return { place: null, total: 0, deltaToNext: null, deltaToFirst: null };
  }

  const sorted = [...ranked].sort(
    (a, b) => metricValue(b, metric) - metricValue(a, metric)
  );

  const index = sorted.findIndex((r) => r.employee_id === employeeId);
  if (index === -1) {
    return { place: null, total, deltaToNext: null, deltaToFirst: null };
  }

  const mine = metricValue(sorted[index], metric);

  // Одинаковые значения делят одно место.
  const place = sorted.findIndex((r) => metricValue(r, metric) === mine) + 1;

  const above = sorted.find((r) => metricValue(r, metric) > mine);
  const deltaToNext = above ? Math.max(0, metricValue(above, metric) - mine) : 0;
  const deltaToFirst = Math.max(0, metricValue(sorted[0], metric) - mine);

  return { place, total, deltaToNext, deltaToFirst };
}
