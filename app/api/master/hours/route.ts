export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const { rows } = await pool.query(`
      select employee_id, week_start, week_end, hours_current_week, hours_avg_4w
      from public.get_my_hours_snapshot();
    `);
    return NextResponse.json({ ok: true, data: rows[0] ?? null });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}


