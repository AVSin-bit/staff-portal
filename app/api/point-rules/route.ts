import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

type Row = {
  id: string;
  code: string;
  title: string;
  delta?: number | null;         // РґРѕРїСѓСЃРєР°РµРј СЂР°Р·РЅС‹Рµ РЅР°Р·РІР°РЅРёСЏ РїРѕР»СЏ РІ Р‘Р”
  default_delta?: number | null; // РЅР° СЃС‚Р°СЂС‹С… СЃС…РµРјР°С…
  is_active?: boolean | null;
  active?: boolean | null;
  category?: string | null;
};

export async function GET() {
  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from<Row>('point_rules')
      .select('id, code, title, delta, default_delta, is_active, active, category')
      .order('code', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message, rules: [] }, { status: 500 });
    }

    // РќРѕСЂРјР°Р»РёР·СѓРµРј РІРѕР·РјРѕР¶РЅС‹Рµ РѕС‚Р»РёС‡РёСЏ СЃС…РµРјС‹ (delta vs default_delta, is_active vs active)
    const rules = (data ?? []).map(r => ({
      id: r.id,
      code: r.code,
      title: r.title,
      delta: (typeof r.delta === 'number' ? r.delta : (typeof r.default_delta === 'number' ? r.default_delta : 0)),
      is_active: (typeof r.is_active === 'boolean' ? r.is_active : !!r.active),
      category: r.category ?? null
    }));

    return NextResponse.json({ rules }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error', rules: [] }, { status: 500 });
  }
}


