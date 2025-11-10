import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 20);

  const { data, error } = await supabase
    .from("points")
    .select("created_at, delta, reason, rule_code, employee_id, created_by")
    .order("created_at", { ascending: false })
    .limit(isFinite(limit) ? limit : 20);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
