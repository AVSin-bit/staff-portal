'use client';

import { useMemo } from 'react';
import { formatHours, formatMoney, METRIC_LABEL } from '../lib/format';
import type { Metric, SalonSummary } from '../lib/types/db';
import { NoData } from './PageState';

type Props = {
  rows: SalonSummary[];
  metric: Metric;
};

function value(row: SalonSummary, metric: Metric): number {
  if (metric === 'val') return row.val;
  if (metric === 'retail_sales') return row.retail_sales;
  return row.hours;
}

export default function SalonSummaryTable({ rows, metric }: Props) {
  const sorted = useMemo(
    () => rows.slice().sort((a, b) => value(b, metric) - value(a, metric)),
    [rows, metric]
  );

  if (sorted.length === 0) return <NoData />;

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-slate-500">Салон</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-500">Вал</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-500">Витрина</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-500">Часы</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-500">
                Сотрудников в отчёте
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.salon_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {row.salon_name ?? 'Без названия'}
                </td>
                <td className={'px-4 py-3 text-right tabular-nums ' + (metric === 'val' ? 'font-semibold text-slate-900' : 'text-slate-600')}>
                  {formatMoney(row.val)}
                </td>
                <td className={'px-4 py-3 text-right tabular-nums ' + (metric === 'retail_sales' ? 'font-semibold text-slate-900' : 'text-slate-600')}>
                  {formatMoney(row.retail_sales)}
                </td>
                <td className={'px-4 py-3 text-right tabular-nums ' + (metric === 'hours' ? 'font-semibold text-slate-900' : 'text-slate-600')}>
                  {formatHours(row.hours)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                  {row.employees_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Сортировка по убыванию: «{METRIC_LABEL[metric]}».
      </p>
    </div>
  );
}
