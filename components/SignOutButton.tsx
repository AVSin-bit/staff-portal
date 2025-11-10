'use client';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function SignOutButton() {
  const router = useRouter();
  async function onClick() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.replace('/');
  }
  return <button onClick={onClick}>Р’С‹Р№С‚Рё</button>;
}

