// lib/period.ts
import { formatPeriod } from './format';
import type { Period } from './types/db';

/** Текущий календарный месяц — период, за который портал показывает показатели. */
export function currentPeriod(now: Date = new Date()): Period {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return { year, month, label: formatPeriod(year, month) };
}
