// app/auth/callback/route.ts
// Обработка перехода по magic-link. Раньше это была клиентская страница,
// которая умела только hash-токены. Supabase по умолчанию присылает
// PKCE-код в query, поэтому вход ломался. Здесь поддержаны оба варианта.

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { implicitFlowBridgeHtml } from '../../../lib/auth/implicit-bridge';

export const dynamic = 'force-dynamic';

/** Пускаем только внутренние пути: ссылку нельзя увести на чужой сайт. */
function safeNext(raw: string | null): string {
  if (!raw) return '/dashboard';
  if (raw.charAt(0) !== '/') return '/dashboard';
  if (raw.charAt(1) === '/') return '/dashboard';
  return raw;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url);
}

function errorRedirect(request: NextRequest, message: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/';
  url.search = '';
  url.searchParams.set('error', message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get('next'));

  const providerError = params.get('error_description') ?? params.get('error');
  if (providerError) {
    return errorRedirect(request, providerError);
  }

  const supabase = createSupabaseServerClient();

  // Вариант 1: PKCE — Supabase вернул код обмена в query.
  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return errorRedirect(request, 'Ссылка для входа недействительна или устарела.');
    }
    return redirectTo(request, next);
  }

  // Вариант 2: OTP-ссылка — token_hash + type.
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: (type as 'magiclink' | 'email' | 'recovery' | 'invite') ?? 'magiclink',
    });
    if (error) {
      return errorRedirect(request, 'Ссылка для входа недействительна или устарела.');
    }
    return redirectTo(request, next);
  }

  // Вариант 3: implicit-флоу — токены пришли во фрагменте ссылки,
  // который на сервер не попадает. Отдаём страницу-мостик.
  return new NextResponse(implicitFlowBridgeHtml(next), {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
