// app/api/my-stats/route.ts
import { NextResponse } from 'next/server';
import { guard, queryError, serverError } from '../../../lib/api/guard';
import { loadDashboard, DataError } from '../../../lib/data/portal';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const g = await guard('master');
    if (!g.ok) return g.response;

    const data = await loadDashboard(g.supabase, g.current);
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof DataError) return queryError('api/my-stats', e.message);
    return serverError('api/my-stats', e);
  }
}
