// lib/format.ts
// Всё, что показывается пользователю: рубли, часы, периоды, стаж.

import type { Metric } from './types/db';

const MONTHS_NOMINATIVE = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

/** Русское склонение: plural(5, 'год', 'года', 'лет') -> 'лет'. */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}

/**
 * Приводит значение к числу. Возвращает null для «нет данных».
 * Number(null) и Number('') дают 0, поэтому проверять только Number.isFinite
 * нельзя: отсутствующий показатель выглядел бы как честный ноль.
 */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** «170 898 ₽». Отсутствующее значение — прочерк, а не ноль. */
export function formatMoney(value: unknown): string {
  const n = toNumber(value);
  if (n === null) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
}

/** «182,5 ч». Целые часы показываем без дробной части. */
export function formatHours(value: unknown): string {
  const n = toNumber(value);
  if (n === null) return '—';
  const rounded = Math.round(n * 10) / 10;
  const text = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 1,
  }).format(rounded);
  return `${text} ч`;
}

/** Форматирует значение так, как принято для этого показателя. */
export function formatMetric(metric: Metric, value: unknown): string {
  return metric === 'hours' ? formatHours(value) : formatMoney(value);
}

export const METRIC_LABEL: Record<Metric, string> = {
  val: 'Вал по услугам',
  retail_sales: 'Продажи витрины',
  hours: 'Отработанные часы',
};

/** Короткая подпись для заголовка колонки. */
export const METRIC_SHORT: Record<Metric, string> = {
  val: 'Вал',
  retail_sales: 'Витрина',
  hours: 'Часы',
};

/** «август 2026». */
export function formatPeriod(year: number, month: number): string {
  const name = MONTHS_NOMINATIVE[month - 1] ?? '';
  return name ? `${name} ${year}` : String(year);
}

/** «17.11.2025» из даты отчёта 1С. */
export function formatReportDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export type Tenure = { years: number; months: number; totalMonths: number };

/**
 * Полных лет и месяцев от даты выхода на работу до сегодня.
 * Учитывает число месяца: 1 марта -> 28 февраля это ещё не полный месяц.
 */
export function calcTenure(startDate: string | null | undefined, now: Date = new Date()): Tenure | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;
  if (start.getTime() > now.getTime()) return null;

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;

  return { years, months, totalMonths: years * 12 + months };
}

/** «3 года 2 месяца», «менее месяца», «нет данных». */
export function formatTenure(startDate: string | null | undefined, now?: Date): string {
  const t = calcTenure(startDate, now);
  if (!t) return 'нет данных';
  if (t.years === 0 && t.months === 0) return 'менее месяца';

  const parts: string[] = [];
  if (t.years > 0) parts.push(`${t.years} ${plural(t.years, 'год', 'года', 'лет')}`);
  if (t.months > 0) parts.push(`${t.months} ${plural(t.months, 'месяц', 'месяца', 'месяцев')}`);
  return parts.join(' ');
}

/** «2 года 4 месяца» из количества месяцев — для «сколько осталось до поездки». */
export function formatMonthsLeft(totalMonths: number): string {
  if (totalMonths <= 0) return 'уже доступно';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${plural(years, 'год', 'года', 'лет')}`);
  if (months > 0) parts.push(`${months} ${plural(months, 'месяц', 'месяца', 'месяцев')}`);
  return parts.join(' ');
}
