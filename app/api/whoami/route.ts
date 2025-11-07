import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "no-url";
  const supabase = createRouteHandlerClient({
    cookies,
    supabaseUrl,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  });

  const { data: { user } } = await supabase.auth.getUser();

  return NextResponse.json({
    supabaseUrl,
    user_id: user?.id || null,
    email: user?.email || null,
  });
}
