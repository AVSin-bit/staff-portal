// app/api/director/route.ts
// Экран директора: вся сеть — сводка по салонам и единый рейтинг сотрудников.
import { NextResponse } from 'next/server';
import { guard, queryError, serverError } from '../../../lib/api/guard';
import { loadNetworkView, DataError } from '../../../lib/data/portal';
import { ROLE_TITLE } from '../../../lib/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const g = await guard('director');
    if (!g.ok) return g.response;

    const data = await loadNetworkView(g.supabase);

    return NextResponse.json({
      viewer: {
        full_name: g.current.employee.full_name,
        position: g.current.employee.position,
        role: g.current.role,
        role_title: ROLE_TITLE[g.current.role],
      },
      ...data,
    });
  } catch (e) {
    if (e instanceof DataError) return queryError('api/director', e.message);
    return serverError('api/director', e);
  }
}
