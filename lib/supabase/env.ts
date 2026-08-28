// lib/supabase/env.ts
// Одна точка чтения переменных окружения, чтобы ошибка конфигурации
// была понятной, а не «Invalid URL» где-то в глубине supabase-js.

export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      'Не задана переменная NEXT_PUBLIC_SUPABASE_URL. ' +
        'Заполните .env.local (локально) и переменные проекта в Vercel.'
    );
  }
  return url;
}

export function supabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Не задана переменная NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Заполните .env.local (локально) и переменные проекта в Vercel.'
    );
  }
  return key;
}
