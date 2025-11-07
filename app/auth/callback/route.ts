import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({
      cookies,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL('/dashboard', url.origin));
  }

  return NextResponse.redirect(new URL('/', url.origin));
}
