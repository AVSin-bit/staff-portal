import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  const redirectUrl = new URL(next, url.origin);
  const res = NextResponse.redirect(redirectUrl);

  if (code) {
    const supabase = createRouteHandlerClient({ cookies, res });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return res;
}
