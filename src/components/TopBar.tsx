'use client';
import { supabase } from '@/lib/supabase';

export default function TopBar() {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px',
      borderBottom: '1px solid #e5e5e5',
      position: 'sticky',
      top: 0,
      background: '#fff',
      zIndex: 10
    }}>
      <a href="/" style={{ fontWeight: 700 }}>РџРѕСЂС‚Р°Р» СЃРѕС‚СЂСѓРґРЅРёРєРѕРІ</a>
      <nav style={{ display: 'flex', gap: 12 }}>
        <a href="/dashboard">Р“Р»Р°РІРЅР°СЏ</a>
        <a href="/points">РњРѕСЏ Р»РµРЅС‚Р°</a>
        <a href="/ratings">Р РµР№С‚РёРЅРіРё</a>
        <a href="/admin">РђРґРјРёРЅ</a>
        <button onClick={logout}
          style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
          Р’С‹Р№С‚Рё
        </button>
      </nav>
    </header>
  );
}

