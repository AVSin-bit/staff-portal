// app/auth/callback/hash/route.ts
// Принимает токены, вынутые из фрагмента magic-link, и ставит серверную cookie-сессию.
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

function safeNext(raw: string | null): string {
  if (!raw) return '/dashboard';
  if (raw.charAt(0) !== '/') return '/dashboard';
  if (raw.charAt(1) === '/') return '/dashboard';
  return raw;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const next = safeNext(params.get('next'));

  const url = request.nextUrl.clone();
  url.search = '';

  if (!accessToken || !refreshToken) {
    url.pathname = '/';
    url.searchParams.set('error', 'Ссылка для входа неполная. Запросите новую.');
    return NextResponse.redirect(url);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    url.pathname = '/';
    url.searchParams.set('error', 'Не удалось сохранить сессию. Запросите новую ссылку.');
    return NextResponse.redirect(url);
  }

  url.pathname = next;
  return NextResponse.redirect(url);
}
