import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient,
  createMiddlewareClient,
} from "@supabase/auth-helpers-nextjs";
import type { Database } from "./supabase-browser";

// Серверный клиент для Server Components
export const supabaseServer = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// Для app/api route handlers (если нужно)
export const supabaseRoute = (cookiesApi: any) =>
  createRouteHandlerClient<Database>({ cookies: cookiesApi });

// Для middleware.ts (если используешь)
export const supabaseMiddleware = (req: any, res: any) =>
  createMiddlewareClient<Database>({ req, res });
