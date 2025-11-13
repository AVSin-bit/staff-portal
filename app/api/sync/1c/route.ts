import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const sharedSecret = process.env.SYNC_1C_SECRET as string; // РѕРґРёРЅ Рё С‚РѕС‚ Р¶Рµ СЃРµРєСЂРµС‚ РЅР° СЃР°Р№С‚Рµ Рё Сѓ Р°РіРµРЅС‚Р°

type Row = {
  period_date: string;              // '2025-11-01' вЂ” РїРµСЂРІС‹Р№ РґРµРЅСЊ РјРµСЃСЏС†Р°
  employee_external_code: string;   // РєРѕРґ РёР· 1РЎ (РєР°Рє РІ РєР°СЂС‚РѕС‡РєРµ: РЅР°РїСЂ. "000000004")
  employee_name: string;            // Р¤РРћ РёР· 1РЎ (СЃС‚СЂР°С…РѕРІРєР° РЅР° СЃР»СѓС‡Р°Р№ РѕС‚СЃСѓС‚СЃС‚РІРёСЏ РІ employees)
  salon_code: string;               // РєРѕРґ СЃР°Р»РѕРЅР° РІ 1РЎ
  revenue: number;
  services_count: number;
  avg_ticket: number;
  conversion: number;
  kpi_score: number;
};

export async function POST(req: Request) {
  try {
    // РџСЂРѕРІРµСЂСЏРµРј СЃРµРєСЂРµС‚
    const auth = req.headers.get('x-sync-secret') || '';
    if (!sharedSecret || auth !== sharedSecret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Р§РёС‚Р°РµРј С‚РµР»Рѕ
    const body = (await req.json()) as { rows: Row[] };
    if (!body?.rows || !Array.isArray(body.rows)) {
      return NextResponse.json({ error: 'bad_payload' }, { status: 400 });
    }

    // Р—Р°РїРёСЃСЊ РІ Supabase
    const supabase = createClient(url, anon, { auth: { persistSession: false } });

    const upserts = body.rows.map(r => ({
      period_date: r.period_date,
      employee_external_code: r.employee_external_code,
      employee_name: r.employee_name,
      salon_code: r.salon_code,
      revenue: r.revenue,
      services_count: r.services_count,
      avg_ticket: r.avg_ticket,
      conversion: r.conversion,
      kpi_score: r.kpi_score
    }));

    const { error } = await supabase
      .from('kpi_1c_monthly')
      .upsert(upserts, { onConflict: 'period_date,employee_external_code' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, count: upserts.length }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server' }, { status: 500 });
  }
}


