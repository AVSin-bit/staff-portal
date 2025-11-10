import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  const employee_id: string = body.employee_id;
  const delta: number = Number(body.delta);
  const rule_code: string | null = body.rule_code ?? null;
  const reason: string | null = body.reason ?? null;

  if (!employee_id || !Number.isFinite(delta)) {
    return NextResponse.json({ error: "employee_id и delta обязательны" }, { status: 400 });
  }

  // Вставляем; created_by проставится default'ом
  const { error } = await supabase.from("points").insert({
    employee_id,
    delta,
    rule_code,
    reason
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
