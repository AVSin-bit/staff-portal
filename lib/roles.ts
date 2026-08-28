// lib/roles.ts
// В базе employees.role_id — это UUID, читать его на фронте бессмысленно.
// Источник истины для прав — текстовая должность employees.position.

import type { RoleKey } from './types/db';

/** Уровень доступа: чем больше, тем шире права. */
export const ROLE_LEVEL: Record<RoleKey, number> = {
  master: 0,
  admin: 1,
  manager: 2,
  director: 3,
};

/** Человекочитаемое название роли. */
export const ROLE_TITLE: Record<RoleKey, string> = {
  master: 'Мастер',
  admin: 'Администратор',
  manager: 'Управляющий',
  director: 'Директор',
};

/**
 * Определяет роль по должности из 1С.
 * Регистр, «ё» и женские окончания («управляющая», «администраторша») не мешают.
 * Если должность пустая или незнакомая — это мастер, самый узкий доступ.
 */
export function resolveRole(position: string | null | undefined): RoleKey {
  const p = (position ?? '')
    .toLowerCase()
    .replace(/\u0451/g, '\u0435') // ё -> е
    .trim();

  if (!p) return 'master';
  if (p.includes('директор')) return 'director';
  if (p.includes('управляющ')) return 'manager';
  if (p.includes('администратор') || p.includes('админ')) return 'admin';
  return 'master';
}

/** Есть ли у роли доступ уровня не ниже требуемого. */
export function hasAtLeast(role: RoleKey, required: RoleKey): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[required];
}

/** Маршруты, доступные роли, — из них строится навигация. */
export function navFor(role: RoleKey): { href: string; label: string }[] {
  const items = [
    { href: '/dashboard', label: 'Личный кабинет' },
    { href: '/motivation', label: 'Система мотивации' },
  ];

  if (hasAtLeast(role, 'admin')) {
    items.push({ href: '/admin', label: 'Салон' });
  }
  if (hasAtLeast(role, 'manager')) {
    items.push({ href: '/manager', label: 'Управляющему' });
  }
  if (hasAtLeast(role, 'director')) {
    items.push({ href: '/director', label: 'Сеть' });
  }

  return items;
}
