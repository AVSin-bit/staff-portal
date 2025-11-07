'use client';

import { useState } from 'react';
import { signInWithEmail } from '@/lib/auth-actions';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await signInWithEmail(email);
      setSent(true);
    } catch (e: any) {
      setErr(e?.message ?? 'Ошибка отправки письма');
    }
  }

  if (sent) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Письмо отправлено</h1>
        <p>Проверьте почту и перейдите по ссылке для входа.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Вход по e-mail</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, fontSize: 16 }}
        />
        <button type="submit" style={{ padding: 10, fontSize: 16 }}>
          Отправить письмо
        </button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </main>
  );
}
