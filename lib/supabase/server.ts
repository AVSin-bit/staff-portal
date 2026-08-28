// lib/supabase/server.ts
// Единственный серверный клиент Supabase — и для server components, и для route handlers.
// Раньше в проекте было шесть разных клиентов на двух несовместимых библиотеках,
// из-за чего сессия то читалась из cookie, то из localStorage.

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from './env';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // В server component куки менять нельзя — обновлением сессии
          // занимается middleware, поэтому здесь молча пропускаем.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // см. комментарий выше
        }
      },
    },
  });
}

export type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;
