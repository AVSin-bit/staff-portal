// app/api/my-motivation/route.ts
import { NextResponse } from 'next/server';
import { guard, queryError, serverError } from '../../../lib/api/guard';
import { loadMotivation, DataError } from '../../../lib/data/portal';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const g = await guard('master');
    if (!g.ok) return g.response;

    const data = await loadMotivation(g.supabase, g.current);
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof DataError) return queryError('api/my-motivation', e.message);
    return serverError('api/my-motivation', e);
  }
}
