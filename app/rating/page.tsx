'use client';

import React from 'react';

type LeaderRow = { employee_id: string; name: string; total: number };
type EventRow = {
  id: string;
  employee_id: string;
  name: string;
  rule_code: string | null;
  delta: number;
  created_at: string;
};

const wrap: React.CSSProperties = { padding: '16px 20px' };
const h1: React.CSSProperties = { fontSize: 28, fontWeight: 800, marginBottom: 12 };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr', gap: 16 };
const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' };
const tableWrap: React.CSSProperties = { overflowX: 'auto' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const thtd: React.CSSProperties = { borderBottom: '1px solid #e5e7eb', padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' };

export default function RatingPage() {
  const [leaderboard, setLeaderboard] = React.useState<LeaderRow[] | null>(null);
  const [latest, setLatest] = React.useState<EventRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/rating', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setLeaderboard(data.leaderboard as LeaderRow[]);
          setLatest(data.latest as EventRow[]);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main style={wrap}>
      <h1 style={h1}>Р РµР№С‚РёРЅРі</h1>
      {loading && <p>Р—Р°РіСЂСѓР·РєР°вЂ¦</p>}
      {error && <p style={{ color: '#b91c1c', fontWeight: 600 }}>РћС€РёР±РєР°: {error}</p>}

      {!loading && !error && (
        <div style={grid}>
          <section style={card} aria-labelledby="lead">
            <h2 id="lead" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Р›РёРґРµСЂР±РѕСЂРґ</h2>
            {leaderboard && leaderboard.length > 0 ? (
              <div style={tableWrap}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={thtd}>РњРµСЃС‚Рѕ</th>
                      <th style={thtd}>РЎРѕС‚СЂСѓРґРЅРёРє</th>
                      <th style={thtd}>Р‘Р°Р»Р»С‹</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((r, i) => (
                      <tr key={r.employee_id}>
                        <td style={thtd}>{i + 1}</td>
                        <td style={thtd}>{r.name}</td>
                        <td style={thtd}>{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ marginTop: 8 }}>РџРѕРєР° РЅРµС‚ РЅР°С‡РёСЃР»РµРЅРёР№.</p>
            )}
          </section>

          <section style={card} aria-labelledby="latest">
            <h2 id="latest" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>РџРѕСЃР»РµРґРЅРёРµ РЅР°С‡РёСЃР»РµРЅРёСЏ</h2>
            {latest && latest.length > 0 ? (
              <div style={tableWrap}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={thtd}>Р”Р°С‚Р°/РІСЂРµРјСЏ</th>
                      <th style={thtd}>РЎРѕС‚СЂСѓРґРЅРёРє</th>
                      <th style={thtd}>РџСЂР°РІРёР»Рѕ</th>
                      <th style={thtd}>О” Р±Р°Р»Р»РѕРІ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((e) => (
                      <tr key={e.id}>
                        <td style={thtd}>{new Date(e.created_at).toLocaleString()}</td>
                        <td style={thtd}>{e.name}</td>
                        <td style={thtd}><code>{e.rule_code ?? 'вЂ”'}</code></td>
                        <td style={thtd}>{e.delta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ marginTop: 8 }}>РќР°С‡РёСЃР»РµРЅРёР№ РЅРµС‚.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}


