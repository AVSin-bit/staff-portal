// app/director/page.tsx
import PortalShell from '../../components/PortalShell';
import NetworkView from '../../components/NetworkView';
import { ErrorScreen } from '../../components/PageState';
import { guardPage } from '../../lib/auth/page';
import { loadNetworkView, DataError } from '../../lib/data/portal';

export const dynamic = 'force-dynamic';

export default async function DirectorPage() {
  const g = await guardPage('director');
  if (!g.ok) return g.screen;

  const { current, supabase } = g;

  let data;
  try {
    data = await loadNetworkView(supabase);
  } catch (e) {
    if (e instanceof DataError) {
      console.error('[director]', e.scope, e.message);
      return (
        <ErrorScreen
          title="Не удалось загрузить сеть"
          message="Данные временно недоступны. Обновите страницу через минуту."
        />
      );
    }
    throw e;
  }

  return (
    <PortalShell
      current={current}
      title="Сеть салонов"
      subtitle={'Сводка и рейтинг за ' + data.period.label}
    >
      <NetworkView
        salons={data.salons}
        salonsSummary={data.salonsSummary}
        employees={data.employees}
      />
    </PortalShell>
  );
}
