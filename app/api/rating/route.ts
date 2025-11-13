import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

type PointsRow = {
  id: string;
  employee_id: string;
  rule_code?: string | null;
  delta?: number | null;
  amount?: number | null;
  created_at: string;
};

type EmployeeRow = { id: string; full_name?: string | null; name?: string | null; fio?: string | null };

async function getTableRows(supabase: any, table: string) {
  return supabase
    .from<PointsRow>(table)
    .select('id, employee_id, rule_code, delta, amount, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
}

export async function GET() {
  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });

    // 1) С‚СЏРЅРµРј СЃРѕР±С‹С‚РёСЏ Р±Р°Р»Р»РѕРІ (points -> point_events)
    let data: PointsRow[] | null = null;
    let err: any = null;

    {
      const { data: d1, error: e1 } = await getTableRows(supabase, 'points');
      if (e1) {
        const { data: d2, error: e2 } = await getTableRows(supabase, 'point_events');
        data = d2 ?? null;
        err = e2;
      } else {
        data = d1 ?? null;
      }
    }

    if (!data) {
      // РµСЃР»Рё РѕР±Рµ С‚Р°Р±Р»РёС†С‹ РЅРµРґРѕСЃС‚СѓРїРЅС‹ вЂ” РІРµСЂРЅС‘Рј РїСѓСЃС‚С‹Рµ РЅР°Р±РѕСЂС‹, РЅРѕ Р±РµР· 500
      return NextResponse.json({ leaderboard: [], latest: [] }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // 2) РїСЂРёРІРѕРґРёРј Рє РµРґРёРЅРѕРјСѓ РІРёРґСѓ delta
    const events = data.map(row => ({
      id: row.id,
      employee_id: row.employee_id,
      rule_code: row.rule_code ?? null,
      delta: typeof row.delta === 'number' ? row.delta : (typeof row.amount === 'number' ? row.amount : 0),
      created_at: row.created_at
    }));

    // 3) РїРѕРґС‚СЏРіРёРІР°РµРј РёРјРµРЅР° СЃРѕС‚СЂСѓРґРЅРёРєРѕРІ
    const employeeIds = Array.from(new Set(events.map(e => e.employee_id)));
    let employeesMap: Record<string, string> = {};
    if (employeeIds.length > 0) {
      const { data: emps } = await supabase
        .from<EmployeeRow>('employees')
        .select('id, full_name, name, fio')
        .in('id', employeeIds);

      (emps ?? []).forEach(e => {
        const name = e.full_name ?? e.name ?? e.fio ?? 'РЎРѕС‚СЂСѓРґРЅРёРє';
        employeesMap[e.id] = name;
      });
    }

    // 4) Р»РёРґРµСЂР±РѕСЂРґ
    const totals: Record<string, number> = {};
    events.forEach(e => { totals[e.employee_id] = (totals[e.employee_id] ?? 0) + (e.delta ?? 0); });

    const leaderboard = Object.entries(totals)
      .map(([employee_id, total]) => ({
        employee_id,
        total: Math.round(total),
        name: employeesMap[employee_id] ?? 'РЎРѕС‚СЂСѓРґРЅРёРє'
      }))
      .sort((a, b) => b.total - a.total);

    // 5) РїРѕСЃР»РµРґРЅРёРµ РЅР°С‡РёСЃР»РµРЅРёСЏ (СЃ РёРјРµРЅР°РјРё)
    const latest = events.slice(0, 50).map(e => ({
      ...e,
      name: employeesMap[e.employee_id] ?? 'РЎРѕС‚СЂСѓРґРЅРёРє'
    }));

    return NextResponse.json({ leaderboard, latest }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    // РґР°Р¶Рµ РїСЂРё РѕС€РёР±РєРµ вЂ” РѕС‚РґР°РґРёРј РїСѓСЃС‚Рѕ Р±РµР· РїР°РґРµРЅРёСЏ СЃС‚СЂР°РЅРёС†С‹
    return NextResponse.json({ leaderboard: [], latest: [], error: e?.message ?? 'server' }, { status: 200 });
  }
}


