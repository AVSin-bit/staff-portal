'use client';

import { useMemo } from 'react';
import { formatHours, formatMoney, METRIC_LABEL } from '../lib/format';
import { metricValue } from '../lib/stats';
import type { EmployeeWithStats, Metric } from '../lib/types/db';
import { NoData } from './PageState';

type Props = {
  rows: EmployeeWithStats[];
  metric: Metric;
  /** Показывать колонку «Салон» — нужна только директору. */
  showSalon?: boolean;
  /** Подсветить строку конкретного сотрудника (себя). */
  highlightEmployeeId?: string | null;
};

function cellClass(active: boolean) {
  return (
    'whitespace-nowrap px-4 py-3 text-right tabular-nums ' +
    (active ? 'font-semibold text-slate-900' : 'text-slate-600')
  );
}

export default function RatingTable({
  rows,
  metric,
  showSalon = false,
  highlightEmployeeId = null,
}: Props) {
  // Сотрудников без данных за месяц не показываем в рейтинге —
  // иначе они висят внизу с нулями и выглядят как «работали в ноль».
  const ranked = useMemo(() => {
    return rows
      .filter((r) => r.has_data)
      .slice()
      .sort((a, b) => metricValue(b, metric) - metricValue(a, metric));
  }, [rows, metric]);

  const withoutData = rows.length - ranked.length;

  if (ranked.length === 0) {
    return <NoData />;
  }

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th scope="col" className="w-12 px-4 py-3 font-semibold text-slate-500">
                №
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-slate-500">
                Сотрудник
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-slate-500">
                Должность
              </th>
              {showSalon ? (
                <th scope="col" className="px-4 py-3 font-semibold text-slate-500">
                  Салон
                </th>
              ) : null}
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-500">
                Вал
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-500">
                Витрина
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-500">
                Часы
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((row, index) => {
              const isMe = highlightEmployeeId === row.employee_id;
              return (
                <tr
                  key={row.employee_id}
                  className={
                    'border-b border-slate-100 ' +
                    (isMe ? 'bg-sky-50' : 'hover:bg-slate-50')
                  }
                >
                  <td className="px-4 py-3 text-slate-400 tabular-nums">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.full_name}
                    {isMe ? <span className="ml-2 text-xs text-sky-600">это вы</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.position ?? '—'}</td>
                  {showSalon ? (
                    <td className="px-4 py-3 text-slate-600">{row.salon_name ?? '—'}</td>
                  ) : null}
                  <td className={cellClass(metric === 'val')}>{formatMoney(row.val)}</td>
                  <td className={cellClass(metric === 'retail_sales')}>
                    {formatMoney(row.retail_sales)}
                  </td>
                  <td className={cellClass(metric === 'hours')}>{formatHours(row.hours)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Сортировка по убыванию: «{METRIC_LABEL[metric]}».
        {withoutData > 0
          ? ' Ещё ' + withoutData + ' сотр. без данных за этот месяц — в рейтинг не попали.'
          : ''}
      </p>
    </div>
  );
}
