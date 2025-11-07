'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  full_name: string;
  position?: string | null;
  hired_at?: string | null;
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const { data: emp } = await supabase
        .from('employees')
        .select('id, full_name, position, hired_at')
        .eq('user_id', user.id)
        .single();

      if (emp) {
        setProfile(emp as Profile);
        const { data: ops } = await supabase
          .from('points_ledger')
          .select('delta')
          .eq('employee_id', emp.id);

        const sum = (ops ?? []).reduce((s, o) => s + (o.delta ?? 0), 0);
        setBalance(sum);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Загрузка…</div>;
  if (!profile) {
    return (
      <div style={{ padding: 20 }}>
        Профиль сотрудника не найден. Попроси админа добавить запись в <b>employees</b>.
      </div>
    );
  }

  const since = profile.hired_at ? new Date(profile.hired_at) : null;
  const months = since ? Math.max(0, Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0;

  return (
    <div style={{ padding: 20, display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
        <h2 style={{ margin: '0 0 8px' }}>Баланс баллов</h2>
        <div style={{ fontSize: 32 }}>{balance}</div>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
        <h2 style={{ margin: '0 0 8px' }}>Профиль</h2>
        <div>{profile.full_name} — {profile.position || 'Должность не указана'}</div>
        <div style={{ opacity: .8, marginTop: 4 }}>Стаж (мес.): {months}</div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
        <a href="/admin" style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 8, background: '#111', color: '#fff', width: 220, textAlign: 'center' }}>
          Панель администратора
        </a>
        <a href="/points" style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 8, background: '#eee', color: '#111', width: 200, textAlign: 'center' }}>
          Моя лента
        </a>
        <a href="/ratings" style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 8, background: '#eee', color: '#111', width: 200, textAlign: 'center' }}>
          Рейтинги
        </a>
      </div>
    </div>
  );
}
