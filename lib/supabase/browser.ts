// lib/supabase/browser.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from './env';

/**
 * Браузерный клиент. Хранит сессию в cookie (а не в localStorage),
 * поэтому её видят и middleware, и серверные компоненты.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
