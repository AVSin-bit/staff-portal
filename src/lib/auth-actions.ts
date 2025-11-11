"use client";
import { supabaseBrowser } from "./supabase-browser";

function siteUrl() {
  // всегда явный, чтобы Supabase не пытался угадать домен
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

/** Вход по e-mail через magic-link */
export async function signInWithEmail(email: string) {
  const supabase = supabaseBrowser();

  const clean = String(email || "").trim().toLowerCase();
  if (!clean) return { error: "Укажите e-mail" };

  const { error } = await supabase.auth.signInWithOtp({
    email: clean,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  return {};
}

export async function signOut() {
  const supabase = supabaseBrowser();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return {};
}
