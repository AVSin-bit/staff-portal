// app/api/admin/route.ts
// Экран администратора: сотрудники ТОЛЬКО своего салона.
import { NextResponse } from 'next/server';
import { guard, queryError, serverError } from '../../../lib/api/guard';
import { loadSalonView, DataError } from '../../../lib/data/portal';
import { ROLE_TITLE } from '../../../lib/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const g = await guard('admin');
    if (!g.ok) return g.response;

    const data = await loadSalonView(g.supabase, g.current);

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
    if (e instanceof DataError) return queryError('api/admin', e.message);
    return serverError('api/admin', e);
  }
}
