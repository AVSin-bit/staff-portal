// lib/auth/employee.ts
// Одна точка ответа на вопрос «кто сейчас вошёл и что ему можно».
// Все страницы и API-роуты обязаны ходить сюда, а не повторять запрос к employees.

import type { SupabaseServerClient } from '../supabase/server';
import { resolveRole, hasAtLeast } from '../roles';
import type { Employee, RoleKey, Salon } from '../types/db';

/** Поля employees, которые нужны порталу. Держим список в одном месте. */
export const EMPLOYEE_FIELDS =
  'id, user_id, full_name, email, login, position, role_id, salon_id, start_date, hired_at, is_active';

export type CurrentEmployee = {
  employee: Employee;
  salon: Salon | null;
  role: RoleKey;
};

/** Почему не удалось определить сотрудника. */
export type AuthFailure =
  | { reason: 'not_authenticated' }
  | { reason: 'employee_not_found' }
  | { reason: 'employee_inactive' }
  | { reason: 'query_failed'; details: string };

export type AuthResult =
  | ({ ok: true } & CurrentEmployee)
  | ({ ok: false } & AuthFailure);

/**
 * Находит сотрудника по auth.uid(). Не бросает исключений —
 * возвращает размеченный результат, чтобы вызывающий сам решил, что показать.
 */
export async function getCurrentEmployee(
  supabase: SupabaseServerClient
): Promise<AuthResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, reason: 'not_authenticated' };
  }

  const { data, error } = await supabase
    .from('employees')
    .select(EMPLOYEE_FIELDS)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, reason: 'query_failed', details: error.message };
  }

  if (!data) {
    return { ok: false, reason: 'employee_not_found' };
  }

  const employee = data as Employee;

  if (!employee.is_active) {
    return { ok: false, reason: 'employee_inactive' };
  }

  let salon: Salon | null = null;
  if (employee.salon_id) {
    const { data: salonRow } = await supabase
      .from('salons')
      .select('id, name')
      .eq('id', employee.salon_id)
      .maybeSingle();
    if (salonRow) salon = salonRow as Salon;
  }

  return {
    ok: true,
    employee,
    salon,
    role: resolveRole(employee.position),
  };
}

/** Понятный русский текст для каждой причины отказа. */
export function authFailureMessage(failure: AuthFailure): string {
  switch (failure.reason) {
    case 'not_authenticated':
      return 'Вы не авторизованы. Войдите в портал по рабочему e-mail.';
    case 'employee_not_found':
      return 'Ваш аккаунт не привязан к карточке сотрудника. Обратитесь к управляющей.';
    case 'employee_inactive':
      return 'Карточка сотрудника неактивна. Обратитесь к управляющей.';
    case 'query_failed':
      return 'Не удалось получить данные сотрудника. Попробуйте обновить страницу.';
  }
}

/** HTTP-код, который соответствует причине отказа. */
export function authFailureStatus(failure: AuthFailure): number {
  switch (failure.reason) {
    case 'not_authenticated':
      return 401;
    case 'employee_not_found':
    case 'employee_inactive':
      return 404;
    case 'query_failed':
      return 500;
  }
}

/** Проверка уровня доступа поверх найденного сотрудника. */
export function requireRole(
  current: CurrentEmployee,
  required: RoleKey
): { ok: true } | { ok: false; message: string } {
  if (hasAtLeast(current.role, required)) return { ok: true };
  return {
    ok: false,
    message: 'У вас нет доступа к этому разделу.',
  };
}
