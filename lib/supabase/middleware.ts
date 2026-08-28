// lib/supabase/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from './env';

/**
 * Обновляет access-token в куках и отдаёт и ответ, и текущего пользователя.
 * Вызывается из middleware.ts на каждый защищённый запрос.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // getUser(), а не getSession(): он проверяет токен на сервере Supabase,
  // поэтому протухшую или подделанную куку не примет.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
