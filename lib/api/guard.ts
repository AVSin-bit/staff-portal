// lib/api/guard.ts
// Общая обвязка для route handlers: сессия, сотрудник, проверка роли.

import { NextResponse } from 'next/server';
import { createSupabaseServerClient, type SupabaseServerClient } from '../supabase/server';
import {
  getCurrentEmployee,
  authFailureMessage,
  authFailureStatus,
  requireRole,
  type CurrentEmployee,
} from '../auth/employee';
import type { RoleKey } from '../types/db';

export type GuardOk = {
  ok: true;
  supabase: SupabaseServerClient;
  current: CurrentEmployee;
};

export type GuardFail = { ok: false; response: NextResponse };

/**
 * Возвращает готовый Supabase-клиент и текущего сотрудника
 * либо готовый ответ с ошибкой. Роль проверяется на сервере,
 * а не только скрытием кнопок в интерфейсе.
 */
export async function guard(required: RoleKey): Promise<GuardOk | GuardFail> {
  const supabase = createSupabaseServerClient();
  const auth = await getCurrentEmployee(supabase);

  if (!auth.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: auth.reason, message: authFailureMessage(auth) },
        { status: authFailureStatus(auth) }
      ),
    };
  }

  const current: CurrentEmployee = {
    employee: auth.employee,
    salon: auth.salon,
    role: auth.role,
  };

  const allowed = requireRole(current, required);
  if (!allowed.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'forbidden', message: allowed.message },
        { status: 403 }
      ),
    };
  }

  return { ok: true, supabase, current };
}

/** Единый ответ на неожиданную ошибку — без утечки стека наружу. */
export function serverError(scope: string, error: unknown): NextResponse {
  console.error(`[${scope}]`, error);
  return NextResponse.json(
    {
      error: 'server_error',
      message: 'Внутренняя ошибка сервера. Попробуйте позже.',
    },
    { status: 500 }
  );
}

/** Ответ на неудачный запрос к базе. */
export function queryError(scope: string, message: string): NextResponse {
  console.error(`[${scope}] ${message}`);
  return NextResponse.json(
    {
      error: 'query_failed',
      message: 'Не удалось загрузить данные. Попробуйте обновить страницу.',
    },
    { status: 500 }
  );
}
