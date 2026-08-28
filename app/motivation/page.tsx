// app/motivation/page.tsx
import PortalShell from '../../components/PortalShell';
import StatCard from '../../components/StatCard';
import ReferenceAccordion from '../../components/ReferenceAccordion';
import { ErrorScreen, NoData } from '../../components/PageState';
import { guardPage } from '../../lib/auth/page';
import { loadMotivation, DataError } from '../../lib/data/portal';
import { MOTIVATION_REFERENCE } from '../../lib/content/motivation-reference';
import {
  calcTenure,
  formatHours,
  formatMoney,
  formatMonthsLeft,
  formatTenure,
} from '../../lib/format';

export const dynamic = 'force-dynamic';

const TRAVEL_AFTER_MONTHS = 10 * 12;

export default async function MotivationPage() {
  const g = await guardPage('master');
  if (!g.ok) return g.screen;

  const { current, supabase } = g;

  let data;
  try {
    data = await loadMotivation(supabase, current);
  } catch (e) {
    if (e instanceof DataError) {
      console.error('[motivation]', e.scope, e.message);
      return (
        <ErrorScreen
          title="Не удалось загрузить мотивацию"
          message="Данные временно недоступны. Обновите страницу через минуту."
        />
      );
    }
    throw e;
  }

  const startDate = current.employee.start_date ?? current.employee.hired_at;
  const tenure = calcTenure(startDate);
  const monthsToTravel = tenure ? TRAVEL_AFTER_MONTHS - tenure.totalMonths : null;
  const { ranking } = data;

  return (
    <PortalShell
      current={current}
      title="Система мотивации"
      subtitle={'Ваши условия и показатели за ' + data.period.label}
    >
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
            Нет данных за {data.period.label}. Расчёт появится после ближайшей выгрузки из 1С.
          </NoData>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Рейтинг по валу в салоне</h2>

        {data.hasData && ranking.place ? (
          <div className="space-y-2 text-slate-700">
            <p>
              <span className="text-2xl font-bold tabular-nums text-slate-900">
                {ranking.place}
              </span>{' '}
              место из {ranking.total}.
            </p>
            {ranking.deltaToNext && ranking.deltaToNext > 0 ? (
              <p className="text-sm text-slate-500">
                До следующей позиции не хватает {formatMoney(ranking.deltaToNext)}.
              </p>
            ) : (
              <p className="text-sm text-emerald-600">Вы лидируете по валу в салоне.</p>
            )}
            {ranking.deltaToFirst && ranking.deltaToFirst > 0 ? (
              <p className="text-sm text-slate-500">
                До первого места — {formatMoney(ranking.deltaToFirst)}.
              </p>
            ) : null}
          </div>
        ) : (
          <NoData>
            Место в рейтинге появится, когда за {data.period.label} загрузят показатели.
          </NoData>
        )}

        <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
          Премия «Лучший мастер месяца» считается по валу за услуги, премия за «топ-прыжок» —
          по росту позиции относительно прошлого месяца, от +3 позиций.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Стаж и долгосрочные льготы</h2>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Стаж в компании
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {formatTenure(startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Первое путешествие за счёт компании
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-900">
              {monthsToTravel === null
                ? 'Нужна дата начала работы'
                : monthsToTravel <= 0
                  ? 'Условие по стажу выполнено'
                  : 'Ещё ' + formatMonthsLeft(monthsToTravel)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
          Первое путешествие полагается за 10 лет работы, далее — каждые 5 лет.
          Отпускная льгота 10 000 ₽ за две недели отпуска предоставляется не чаще одного раза
          в календарный год и при выполнении требований по «чистым месяцам» за последние 24 месяца.
        </p>
      </section>

      {data.blocks.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Положение о мотивации</h2>
          {data.blocks.map((block) => (
            <article
              key={block.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <h3 className="text-base font-semibold text-slate-900">{block.title}</h3>
              {block.subtitle ? (
                <p className="mt-1 text-sm text-slate-500">{block.subtitle}</p>
              ) : null}
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {block.body
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Справочник</h2>
        {MOTIVATION_REFERENCE.map((group) => (
          <ReferenceAccordion key={group.id} group={group} />
        ))}
      </section>
    </PortalShell>
  );
}
