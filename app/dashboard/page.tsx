// app/dashboard/page.tsx
import Link from 'next/link';
import PortalShell from '../../components/PortalShell';
import StatCard from '../../components/StatCard';
import { ErrorScreen, NoData } from '../../components/PageState';
import { guardPage } from '../../lib/auth/page';
import { loadDashboard, DataError } from '../../lib/data/portal';
import {
  formatHours,
  formatMoney,
  formatReportDate,
  formatTenure,
} from '../../lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const g = await guardPage('master');
  if (!g.ok) return g.screen;

  const { current, supabase } = g;

  let data;
  try {
    data = await loadDashboard(supabase, current);
  } catch (e) {
    if (e instanceof DataError) {
      console.error('[dashboard]', e.scope, e.message);
      return (
        <ErrorScreen
          title="Не удалось загрузить показатели"
          message="Данные временно недоступны. Обновите страницу через минуту."
          backHref="/dashboard"
          backLabel="Обновить"
        />
      );
    }
    throw e;
  }

  const startDate = current.employee.start_date ?? current.employee.hired_at;
  const tenure = formatTenure(startDate);
  const reportDate = formatReportDate(data.reportDate);
  const { ranking } = data;

  return (
    <PortalShell
      current={current}
      title={'Здравствуйте, ' + current.employee.full_name.split(' ')[0]}
      subtitle={
        <>
          Показатели за {data.period.label}
          {reportDate ? ' • отчёт 1С от ' + reportDate : ''}
        </>
      }
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Должность
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {current.employee.position ?? 'Сотрудник'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Салон
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {current.salon?.name ?? 'Не указан'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Стаж
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">{tenure}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Мои показатели</h2>

        {data.hasData ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Вал по услугам" accent="val" value={formatMoney(data.stats.val)} />
            <StatCard
              label="Продажи витрины"
              accent="retail"
              value={formatMoney(data.stats.retail_sales)}
            />
            <StatCard
              label="Отработано часов"
              accent="hours"
              value={formatHours(data.stats.hours)}
            />
          </div>
        ) : (
          <NoData>
            Нет данных за {data.period.label}. Показатели появятся после ближайшей
            выгрузки отчётов из 1С.
          </NoData>
        )}
      </section>

      {data.hasData && ranking.place ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Моё место в салоне
          </h2>
          <p className="text-slate-700">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {ranking.place}
            </span>{' '}
            место из {ranking.total} по валу за {data.period.label}.
          </p>
          {ranking.deltaToNext && ranking.deltaToNext > 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              До следующей позиции не хватает {formatMoney(ranking.deltaToNext)}.
            </p>
          ) : (
            <p className="mt-2 text-sm text-emerald-600">
              Вы на первом месте по валу — так держать.
            </p>
          )}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Что дальше</h2>
        <p className="mb-4 text-sm text-slate-500">
          Условия премий, льгот и поездок — в разделе мотивации.
        </p>
        <Link
          href="/motivation"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Система мотивации
        </Link>
      </section>
    </PortalShell>
  );
}
