// lib/auth/page.tsx
// Единая проверка доступа для страниц (server components).

import { redirect } from 'next/navigation';
import { createSupabaseServerClient, type SupabaseServerClient } from '../supabase/server';
import { ErrorScreen } from '../../components/PageState';
import { hasAtLeast } from '../roles';
import type { RoleKey } from '../types/db';
import {
  getCurrentEmployee,
  authFailureMessage,
  type CurrentEmployee,
} from './employee';

type PageGuardOk = {
  ok: true;
  supabase: SupabaseServerClient;
  current: CurrentEmployee;
};

type PageGuardFail = { ok: false; screen: JSX.Element };

/**
 * Не авторизован — уводим на форму входа.
 * Авторизован, но прав не хватает — показываем понятный экран, а не 404.
 */
export async function guardPage(required: RoleKey): Promise<PageGuardOk | PageGuardFail> {
  const supabase = createSupabaseServerClient();
  const auth = await getCurrentEmployee(supabase);

  if (!auth.ok) {
    if (auth.reason === 'not_authenticated') {
      redirect('/');
    }
    return {
      ok: false,
      screen: (
        <ErrorScreen
          title="Нет доступа к порталу"
          message={authFailureMessage(auth)}
          backHref="/"
          backLabel="На страницу входа"
        />
      ),
    };
  }

  const current: CurrentEmployee = {
    employee: auth.employee,
    salon: auth.salon,
    role: auth.role,
  };

  if (!hasAtLeast(current.role, required)) {
    return {
      ok: false,
      screen: (
        <ErrorScreen
          title="Раздел недоступен"
          message="У вас нет доступа к этому разделу. Он открыт сотрудникам с другой должностью."
        />
      ),
    };
  }

  return { ok: true, supabase, current };
}
