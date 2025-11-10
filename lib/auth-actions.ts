'use client';
import { supabaseBrowser } from './supabase-browser';

export async function signInWithEmail(email: string) {
  const supabase = supabaseBrowser();
  await supabase.auth.signInWithOtp({
	email,
	options: {
		emailRedirectTo: 'https://staff-portal-woad.vercel.app/auth/callback',
	},
	});
}

