import test from 'node:test';
import assert from 'node:assert/strict';
import {
  joinEmployeesWithStats,
  latestStatByEmployee,
  rankBy,
  summarizeSalons,
} from '../lib/stats';
import type { EmployeeWithStats, MonthlyStat } from '../lib/types/db';

const SALON = { id: 's1', name: 'Мира' };

function stat(over: Partial<MonthlyStat>): MonthlyStat {
  return {
    employee_id: 'e1',
    salon_id: 's1',
    year: 2026,
    month: 8,
    val: 0,
    retail_sales: 0,
    hours: 0,
    report_date: '2026-08-17',
    ...over,
  };
}

function row(over: Partial<EmployeeWithStats>): EmployeeWithStats {
  return {
    employee_id: 'e1',
    full_name: 'Иванова Мария',
    position: 'Мастер',
    salon_id: 's1',
    salon_name: 'Мира',
    val: 0,
    retail_sales: 0,
    hours: 0,
    has_data: true,
    ...over,
  };
}

test('из нескольких отчётов за месяц берётся самый свежий', () => {
  const rows = [
    stat({ employee_id: 'e1', val: 100, report_date: '2026-08-10' }),
    stat({ employee_id: 'e1', val: 250, report_date: '2026-08-24' }),
    stat({ employee_id: 'e1', val: 180, report_date: '2026-08-17' }),
  ];
  assert.equal(latestStatByEmployee(rows).get('e1')?.val, 250);
});

test('строка без report_date не вытесняет строку с датой', () => {
  const rows = [
    stat({ employee_id: 'e1', val: 300, report_date: '2026-08-24' }),
    stat({ employee_id: 'e1', val: 5, report_date: null }),
  ];
  assert.equal(latestStatByEmployee(rows).get('e1')?.val, 300);
});

test('сотрудник без показателей помечается has_data = false, а не нулями', () => {
  const employees = [
    { id: 'e1', full_name: 'Иванова Мария', position: 'Мастер', salon_id: 's1' },
    { id: 'e2', full_name: 'Петрова Анна', position: 'Мастер', salon_id: 's1' },
  ];
  const rows = joinEmployeesWithStats(
    employees,
    [stat({ employee_id: 'e1', val: 170898, hours: 182 })],
    [SALON]
  );

  const first = rows.find((r) => r.employee_id === 'e1');
  const second = rows.find((r) => r.employee_id === 'e2');

  assert.equal(first?.has_data, true);
  assert.equal(first?.val, 170898);
  assert.equal(first?.salon_name, 'Мира');
  assert.equal(second?.has_data, false);
  assert.equal(second?.val, 0);
});

test('в сводке по салону считаются только сотрудники из отчёта', () => {
  const rows = [
    row({ employee_id: 'e1', val: 100, retail_sales: 10, hours: 150 }),
    row({ employee_id: 'e2', val: 200, retail_sales: 20, hours: 160 }),
    row({ employee_id: 'e3', has_data: false }),
  ];
  const summary = summarizeSalons(rows);

  assert.equal(summary.length, 1);
  assert.equal(summary[0].val, 300);
  assert.equal(summary[0].retail_sales, 30);
  assert.equal(summary[0].hours, 310);
  assert.equal(summary[0].employees_count, 2);
});

test('место в рейтинге и расстояние до соседа считаются по выбранному показателю', () => {
  const rows = [
    row({ employee_id: 'e1', val: 300 }),
    row({ employee_id: 'e2', val: 200 }),
    row({ employee_id: 'e3', val: 150 }),
  ];

  const second = rankBy(rows, 'e2', 'val');
  assert.equal(second.place, 2);
  assert.equal(second.total, 3);
  assert.equal(second.deltaToNext, 100);
  assert.equal(second.deltaToFirst, 100);

  const first = rankBy(rows, 'e1', 'val');
  assert.equal(first.place, 1);
  assert.equal(first.deltaToNext, 0);
  assert.equal(first.deltaToFirst, 0);
});

test('одинаковый показатель даёт одинаковое место', () => {
  const rows = [
    row({ employee_id: 'e1', val: 200 }),
    row({ employee_id: 'e2', val: 200 }),
    row({ employee_id: 'e3', val: 100 }),
  ];
  assert.equal(rankBy(rows, 'e1', 'val').place, 1);
  assert.equal(rankBy(rows, 'e2', 'val').place, 1);
  assert.equal(rankBy(rows, 'e3', 'val').place, 3);
});

test('сотрудник без данных в рейтинг не попадает', () => {
  const rows = [
    row({ employee_id: 'e1', val: 300 }),
    row({ employee_id: 'e2', has_data: false }),
  ];
  const r = rankBy(rows, 'e2', 'val');
  assert.equal(r.place, null);
  assert.equal(r.total, 1);
});

test('рейтинг по часам не путается с рейтингом по валу', () => {
  const rows = [
    row({ employee_id: 'e1', val: 300, hours: 100 }),
    row({ employee_id: 'e2', val: 100, hours: 300 }),
  ];
  assert.equal(rankBy(rows, 'e1', 'val').place, 1);
  assert.equal(rankBy(rows, 'e1', 'hours').place, 2);
});

test('пустой салон не ломает расчёт', () => {
  const r = rankBy([], 'e1', 'val');
  assert.deepEqual(r, { place: null, total: 0, deltaToNext: null, deltaToFirst: null });
});
