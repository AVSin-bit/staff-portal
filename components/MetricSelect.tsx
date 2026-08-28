'use client';

import { METRIC_SHORT } from '../lib/format';
import { METRICS } from '../lib/stats';
import type { Metric } from '../lib/types/db';

type Props = {
  label?: string;
  value: Metric;
  onChange: (metric: Metric) => void;
};

export default function MetricSelect({ label = 'Показатель', value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="whitespace-nowrap">{label}:</span>
      <select
        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        value={value}
        onChange={(e) => onChange(e.target.value as Metric)}
      >
        {METRICS.map((m) => (
          <option key={m} value={m}>
            {METRIC_SHORT[m]}
          </option>
        ))}
      </select>
    </label>
  );
}
