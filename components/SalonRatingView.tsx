'use client';

import { useState } from 'react';
import MetricSelect from './MetricSelect';
import RatingTable from './RatingTable';
import StatCard from './StatCard';
import { NoData } from './PageState';
import { formatHours, formatMoney } from '../lib/format';
import type { EmployeeWithStats, Metric, SalonSummary } from '../lib/types/db';

type Props = {
  employees: EmployeeWithStats[];
  summary: SalonSummary | null;
  /** Итоги по салону показываем управляющему, администратору — нет. */
  showSummary?: boolean;
  myEmployeeId?: string | null;
};

export default function SalonRatingView({
  employees,
  summary,
  showSummary = false,
  myEmployeeId = null,
}: Props) {
  const [metric, setMetric] = useState<Metric>('val');

  return (
    <>
      {showSummary ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Итоги салона</h2>
          {summary ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Вал по услугам" accent="val" value={formatMoney(summary.val)} />
              <StatCard
                label="Продажи витрины"
                accent="retail"
                value={formatMoney(summary.retail_sales)}
              />
              <StatCard
                label="Отработано часов"
                accent="hours"
                value={formatHours(summary.hours)}
                hint={'Сотрудников в отчёте: ' + summary.employees_count}
              />
            </div>
          ) : (
            <NoData />
          )}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Рейтинг сотрудников</h2>
          <MetricSelect value={metric} onChange={setMetric} />
        </div>

        <RatingTable rows={employees} metric={metric} highlightEmployeeId={myEmployeeId} />
      </section>
    </>
  );
}
