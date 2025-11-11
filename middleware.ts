import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  // ВАЖНО: передаём res в клиент, чтобы Supabase мог обновить куки
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Единственный источник истины — getSession()
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") || path.startsWith("/points");

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  return res; // возвращаем res, где уже могут быть обновлённые куки
}

// Матчим ТОЛЬКО защищённые страницы
export const config = {
  matcher: ["/dashboard/:path*", "/points/:path*"],
};
