// app/api/motivation/route.ts
import { NextResponse } from 'next/server';
import { guard, queryError, serverError } from '../../../lib/api/guard';
import { loadMotivation, DataError } from '../../../lib/data/portal';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const g = await guard('master');
    if (!g.ok) return g.response;

    // Какие блоки видны сотруднику, решает RLS: глобальные (salon_id is null)
    // плюс блоки его салона.
    const { blocks } = await loadMotivation(g.supabase, g.current);
    return NextResponse.json({ blocks });
  } catch (e) {
    if (e instanceof DataError) return queryError('api/motivation', e.message);
    return serverError('api/motivation', e);
  }
}
