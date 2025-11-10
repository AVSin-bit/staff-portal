'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type NetRow = { employee_id: string; full_name: string; month_points: number; network_rank: number };
type SalonRow = { employee_id: string; full_name: string; month_points: number; salon_rank: number };

export default function RatingsPage() {
  const [net, setNet] = useState<NetRow[]>([]);
  const [salon, setSalon] = useState<SalonRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      // СѓР·РЅР°С‘Рј РјРѕР№ СЃР°Р»РѕРЅ
      const { data: me } = await supabase
        .from('employees')
        .select('salon_id')
        .eq('user_id', user.id)
        .single();

      // СЂРµР№С‚РёРЅРі РїРѕ СЃРµС‚Рё
      const { data: netData } = await supabase
        .from('v_rating_network')
        .select('employee_id, full_name, month_points, network_rank')
        .order('network_rank')
        .limit(100);

      // СЂРµР№С‚РёРЅРі РїРѕ РјРѕРµРјСѓ СЃР°Р»РѕРЅСѓ
      const { data: salonData } = await supabase
        .from('v_rating_salon')
        .select('employee_id, full_name, month_points, salon_rank')
        .eq('salon_id', me?.salon_id ?? '')
        .order('salon_rank');

      setNet(netData ?? []);
      setSalon(salonData ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Р—Р°РіСЂСѓР·РєР°вЂ¦</div>;

  return (
    <div style={{ padding: 20, display: 'grid', gap: 24 }}>
      <section>
        <h2>Р РµР№С‚РёРЅРі РїРѕ СЃРµС‚Рё (С‚РµРєСѓС‰РёР№ РјРµСЃСЏС†)</h2>
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>в„–</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>РЎРѕС‚СЂСѓРґРЅРёРє</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Р‘Р°Р»Р»С‹</th>
            </tr>
          </thead>
          <tbody>
            {net.map((r) => (
              <tr key={r.employee_id}>
                <td style={{ padding: 8 }}>{r.network_rank}</td>
                <td style={{ padding: 8 }}>{r.full_name}</td>
                <td style={{ padding: 8 }}>{r.month_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Р РµР№С‚РёРЅРі РїРѕ РјРѕРµРјСѓ СЃР°Р»РѕРЅСѓ (С‚РµРєСѓС‰РёР№ РјРµСЃСЏС†)</h2>
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>в„–</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>РЎРѕС‚СЂСѓРґРЅРёРє</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Р‘Р°Р»Р»С‹</th>
            </tr>
          </thead>
          <tbody>
            {salon.map((r) => (
              <tr key={r.employee_id}>
                <td style={{ padding: 8 }}>{r.salon_rank}</td>
                <td style={{ padding: 8 }}>{r.full_name}</td>
                <td style={{ padding: 8 }}>{r.month_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

