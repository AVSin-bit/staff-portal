export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirect = url.searchParams.get("redirect") ?? "/dashboard";

  const supabase = createRouteHandlerClient({ cookies });

  if (!code) {
    url.pathname = "/";
    url.searchParams.set("auth_error", "no_code");
    return NextResponse.redirect(url);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    url.pathname = "/";
    url.searchParams.set("auth_error", error.message);
    return NextResponse.redirect(url);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    url.pathname = "/";
    url.searchParams.set("auth_error", "no_user_after_exchange");
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(redirect, url.origin));
}
