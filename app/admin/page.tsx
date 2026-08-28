// app/admin/page.tsx
import PortalShell from '../../components/PortalShell';
import SalonRatingView from '../../components/SalonRatingView';
import { ErrorScreen, NoData } from '../../components/PageState';
import { guardPage } from '../../lib/auth/page';
import { loadSalonView, DataError } from '../../lib/data/portal';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const g = await guardPage('admin');
  if (!g.ok) return g.screen;

  const { current, supabase } = g;

  let data;
  try {
    data = await loadSalonView(supabase, current);
  } catch (e) {
    if (e instanceof DataError) {
      console.error('[admin]', e.scope, e.message);
      return (
        <ErrorScreen
          title="Не удалось загрузить салон"
          message="Данные временно недоступны. Обновите страницу через минуту."
        />
      );
    }
    throw e;
  }

  return (
    <PortalShell
      current={current}
      title={data.salon?.name ?? 'Мой салон'}
      subtitle={'Показатели сотрудников за ' + data.period.label}
    >
      {current.employee.salon_id ? (
        <SalonRatingView
          employees={data.employees}
          summary={data.summary}
          myEmployeeId={current.employee.id}
        />
      ) : (
        <NoData>
          В вашей карточке сотрудника не указан салон, поэтому список коллег
          построить нельзя. Обратитесь к управляющей.
        </NoData>
      )}
    </PortalShell>
  );
}
