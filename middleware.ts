import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

/**
 * Закрывает ВСЕ приватные разделы портала и заодно продлевает сессию.
 * Раньше здесь были только /dashboard и /points, поэтому /admin, /manager
 * и /director открывались вообще без входа.
 */
const PROTECTED = ['/dashboard', '/motivation', '/admin', '/manager', '/director'];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED.some(
    (prefix) => path === prefix || path.startsWith(prefix + '/')
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Уже вошедшего сотрудника не держим на форме входа.
  if (path === '/' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/motivation/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/director/:path*',
  ],
};
