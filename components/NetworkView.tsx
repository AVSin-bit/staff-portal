'use client';

import { useMemo, useState } from 'react';
import MetricSelect from './MetricSelect';
import RatingTable from './RatingTable';
import SalonSummaryTable from './SalonSummaryTable';
import type {
  EmployeeWithStats,
  Metric,
  Salon,
  SalonSummary,
} from '../lib/types/db';

const ALL_SALONS = 'all';

type Props = {
  salons: Salon[];
  salonsSummary: SalonSummary[];
  employees: EmployeeWithStats[];
};

export default function NetworkView({ salons, salonsSummary, employees }: Props) {
  const [salonMetric, setSalonMetric] = useState<Metric>('val');
  const [employeeMetric, setEmployeeMetric] = useState<Metric>('val');
  const [salonFilter, setSalonFilter] = useState<string>(ALL_SALONS);

  const filteredEmployees = useMemo(() => {
    if (salonFilter === ALL_SALONS) return employees;
    return employees.filter((e) => e.salon_id === salonFilter);
  }, [employees, salonFilter]);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Сводка по салонам</h2>
          <MetricSelect value={salonMetric} onChange={setSalonMetric} />
        </div>

        <SalonSummaryTable rows={salonsSummary} metric={salonMetric} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Рейтинг сотрудников</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <MetricSelect value={employeeMetric} onChange={setEmployeeMetric} />

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="whitespace-nowrap">Салон:</span>
              <select
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={salonFilter}
                onChange={(e) => setSalonFilter(e.target.value)}
              >
                <option value={ALL_SALONS}>Вся сеть</option>
                {salons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? 'Без названия'}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <RatingTable rows={filteredEmployees} metric={employeeMetric} showSalon />
      </section>
    </>
  );
}
