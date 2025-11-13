"use client";

import { useEffect, useState } from "react";

type HoursDTO = {
  employee_id: string;
  week_start: string;     // YYYY-MM-DD
  week_end: string;       // YYYY-MM-DD
  hours_current_week: number;
  hours_avg_4w: number;
};

export default function MasterHoursCard() {
  const [data, setData] = useState<HoursDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/master/hours", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (alive && j.ok) setData(j.data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const fmt = (s: string) => new Date(s).toLocaleDateString("ru-RU");

  if (loading) {
    return (
      <div className="rounded-xl border p-4 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 mb-2" />
        <div className="h-6 w-24 bg-gray-200" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border p-4">
        <div className="font-semibold">РњРѕРё С‡Р°СЃС‹</div>
        <div className="text-sm text-gray-500 mt-1">Р”Р°РЅРЅС‹С… Р·Р° С‚РµРєСѓС‰СѓСЋ РЅРµРґРµР»СЋ РЅРµС‚</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="font-semibold">РњРѕРё С‡Р°СЃС‹ (РЅРµРґРµР»СЏ)</div>
      <div className="text-xs text-gray-500">
        {fmt(data.week_start)} вЂ” {fmt(data.week_end)}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3">
          <div className="text-xs text-gray-500">РўРµРєСѓС‰Р°СЏ РЅРµРґРµР»СЏ</div>
          <div className="text-2xl font-bold">
            {Number(data.hours_current_week).toFixed(1)} С‡
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-gray-500">РЎСЂРµРґРЅРµРµ Р·Р° 4 РЅРµРґРµР»Рё</div>
          <div className="text-2xl font-bold">
            {Number(data.hours_avg_4w).toFixed(1)} С‡/РЅРµРґ
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Р”Р°РЅРЅС‹Рµ РёР· 1РЎ. РћС‚РїСѓСЃРєРЅС‹Рµ РјРµСЃСЏС†С‹ РёСЃРєР»СЋС‡Р°СЋС‚СЃСЏ РёР· РЅРѕСЂРјР°С‚РёРІР° В«С‡РёСЃС‚С‹С… РјРµСЃСЏС†РµРІВ».
      </div>
    </div>
  );
}


