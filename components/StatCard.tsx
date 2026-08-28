type Props = {
  label: string;
  value: string;
  accent?: 'val' | 'retail' | 'hours';
  hint?: string | null;
};

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  val: 'text-emerald-600',
  retail: 'text-amber-600',
  hours: 'text-indigo-600',
};

export default function StatCard({ label, value, accent = 'val', hint }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className={'text-xs font-semibold uppercase tracking-wide ' + ACCENT[accent]}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
