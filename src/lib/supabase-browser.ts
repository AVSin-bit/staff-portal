"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Если нет сгенерированных типов — этого достаточно
export type Database = Record<string, never>;

export const supabaseBrowser = () =>
  createClientComponentClient<Database>();
