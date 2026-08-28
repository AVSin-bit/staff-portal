// app/api/whoami/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import {
  getCurrentEmployee,
  authFailureMessage,
  authFailureStatus,
} from '../../../lib/auth/employee';
import { navFor, ROLE_TITLE } from '../../../lib/roles';
import { serverError } from '../../../lib/api/guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const auth = await getCurrentEmployee(supabase);

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.reason, message: authFailureMessage(auth) },
        { status: authFailureStatus(auth) }
      );
    }

    return NextResponse.json({
      employee: auth.employee,
      salon: auth.salon,
      role: auth.role,
      role_title: ROLE_TITLE[auth.role],
      nav: navFor(auth.role),
    });
  } catch (e) {
    return serverError('api/whoami', e);
  }
}
