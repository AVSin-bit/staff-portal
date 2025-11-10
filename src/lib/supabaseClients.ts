"use server";

import { cookies } from "next/headers";
import {
  createClientComponentClient,
  createServerComponentClient,
  createRouteHandlerClient,
  createMiddlewareClient,
  type CookieOptions,
} from "@supabase/auth-helpers-nextjs";
import type { Database } from "./types"; // если нет types — создай пустой тип ниже

// Клиент для компонентов (браузер)
export const supabaseBrowser = () =>
  createClientComponentClient<Database>();

// Клиент для серверных компонентов (app router)
export const supabaseServer = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// Клиент для route handlers (app/api/*)
export const supabaseRoute = (req: Request) =>
  createRouteHandlerClient<Database>({ cookies });

// Клиент для middleware.ts
export const supabaseMiddleware = (req: any, res: any) =>
  createMiddlewareClient<Database>({ req, res });

// Заглушка типов, если у тебя ещё нет сгенерированной схемы
export type Database = Record<string, never>;
