import Link from 'next/link';
import type { ReactNode } from 'react';

export function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {children}
      </div>
    </main>
  );
}

export function LoadingScreen({ text = 'Загружаем данные…' }: { text?: string }) {
  return (
    <CenteredCard>
      <p className="text-slate-600">{text}</p>
    </CenteredCard>
  );
}

export function ErrorScreen({
  title = 'Не удалось открыть раздел',
  message,
  backHref = '/dashboard',
  backLabel = 'В личный кабинет',
}: {
  title?: string;
  message: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <CenteredCard>
      <h1 className="mb-3 text-xl font-bold text-slate-900">{title}</h1>
      <p className="mb-6 text-slate-600">{message}</p>
      <Link
        href={backHref}
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {backLabel}
      </Link>
    </CenteredCard>
  );
}

/** Единая формулировка для «данных за месяц ещё нет». */
export function NoData({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {children ?? 'Нет данных за выбранный месяц'}
    </p>
  );
}
