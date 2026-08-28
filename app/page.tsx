'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error');
  const next = searchParams.get('next');

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Введите рабочий e-mail.');
      return;
    }

    setSending(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // origin берём из браузера: одна и та же сборка работает
      // и на localhost, и на боевом домене без правки кода.
      const target =
        window.location.origin +
        '/auth/callback?next=' +
        encodeURIComponent(next && next.charAt(0) === '/' ? next : '/dashboard');

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: target },
      });

      if (authError) {
        console.error(authError);
        setError('Не удалось отправить ссылку. Проверьте e-mail и попробуйте ещё раз.');
        return;
      }

      setSent(true);
    } catch (e) {
      console.error(e);
      setError('Не удалось связаться с сервером. Попробуйте позже.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
            СП
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Портал сотрудников
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Вход по рабочему e-mail. Мы отправим письмо со ссылкой для входа.
          </p>
        </div>

        {callbackError ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {callbackError}
          </p>
        ) : null}

        {sent ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <p className="font-medium">Письмо отправлено.</p>
            <p className="mt-1">
              Откройте ссылку из письма на этом же устройстве — она действует ограниченное время.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Рабочий e-mail
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? 'Отправляем ссылку…' : 'Войти по e-mail'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs leading-snug text-slate-400">
          Вводя e-mail, вы подтверждаете, что являетесь сотрудником компании,
          и соглашаетесь с обработкой персональных данных.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
