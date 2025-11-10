'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Employee = { id: string; full_name: string; salon_id?: string | null };
type PointRule = { id: string; title: string; amount: number };
type Me = { id: string; role_id?: string | null; salon_id?: string | null };

export default function AdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rules, setRules] = useState<PointRule[]>([]);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [ruleId, setRuleId] = useState<string>('');
  const [delta, setDelta] = useState<number | ''>('');
  const [note, setNote] = useState<string>('');
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const { data: actor } = await supabase
        .from('employees')
        .select('id, role_id, salon_id')
        .eq('user_id', user.id)
        .single();

      setMe(actor ?? null);

      const { data: emps } = await supabase
        .from('employees')
        .select('id, full_name, salon_id')
        .order('full_name');

      setEmployees(emps ?? []);

      const { data: prs } = await supabase
        .from('point_rules')
        .select('id, title, amount')
        .eq('active', true)
        .order('title');

      setRules(prs ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!ruleId) { setDelta(''); setNote(''); return; }
    const r = rules.find((x) => x.id === ruleId);
    if (r) { setDelta(r.amount); setNote(r.title); }
  }, [ruleId, rules]);

  async function add() {
    if (!employeeId) { alert('Р’С‹Р±РµСЂРё СЃРѕС‚СЂСѓРґРЅРёРєР°'); return; }
    const amount = typeof delta === 'number' ? delta : 0;

    const { error } = await supabase.from('points_ledger').insert({
      employee_id: employeeId,
      rule_id: ruleId || null,
      delta: amount,
      created_by: me?.id ?? null,
      note,
    });
    if (error) alert(error.message); else alert('Р“РѕС‚РѕРІРѕ');
  }

  return (
    <div style={{ padding: 20, display: 'grid', gap: 10, maxWidth: 520 }}>
      <h1>РќР°С‡РёСЃР»РёС‚СЊ/РЎРїРёСЃР°С‚СЊ Р±Р°Р»Р»С‹</h1>

      <label>РЎРѕС‚СЂСѓРґРЅРёРє</label>
      <select
        style={{ border: '1px solid #ccc', padding: 8, borderRadius: 8 }}
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      >
        <option value="">Р’С‹Р±РµСЂРёС‚Рµ СЃРѕС‚СЂСѓРґРЅРёРєР°</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>{e.full_name}</option>
        ))}
      </select>

      <label>РџСЂР°РІРёР»Рѕ</label>
      <select
        style={{ border: '1px solid #ccc', padding: 8, borderRadius: 8 }}
        value={ruleId}
        onChange={(e) => setRuleId(e.target.value)}
      >
        <option value="">вЂ” РІС‹Р±СЂР°С‚СЊ вЂ”</option>
        {rules.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title} ({r.amount > 0 ? '+' : ''}{r.amount})
          </option>
        ))}
      </select>

      <label>РР·РјРµРЅРµРЅРёРµ (РјРѕР¶РЅРѕ РѕС‚СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ)</label>
      <input
        style={{ border: '1px solid #ccc', padding: 8, borderRadius: 8 }}
        type="number"
        value={typeof delta === 'number' ? String(delta) : ''}
        onChange={(e) => setDelta(e.target.value === '' ? '' : Number(e.target.value))}
      />

      <label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label>
      <input
        style={{ border: '1px solid #ccc', padding: 8, borderRadius: 8 }}
        placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button
        onClick={add}
        style={{ padding: 10, border: 'none', borderRadius: 8, background: '#111', color: '#fff' }}
      >
        Р—Р°РїРёСЃР°С‚СЊ РѕРїРµСЂР°С†РёСЋ
      </button>
    </div>
  );
}

