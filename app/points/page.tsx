"use client";

import { useEffect, useState } from "react";

type Emp = { id: string; full_name: string; role_slug: string; salon_id: string | null };
type Rule = { code: string; title: string; delta: number; active: boolean };
type Row  = { created_at: string; delta: number; reason: string | null; rule_code: string | null; employee_id: string; created_by: string };

export default function PointsPage() {
  const [loading, setLoading] = useState(true);
  const [emps, setEmps] = useState<Emp[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [history, setHistory] = useState<Row[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [ruleCode, setRuleCode] = useState("");
  const [delta, setDelta] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    const [eRes, rRes, hRes] = await Promise.all([
      fetch("/api/employees").then(r => r.json()),
      fetch("/api/point-rules").then(r => r.json()),
      fetch("/api/points/history?limit=30").then(r => r.json())
    ]);
    setEmps(eRes.data ?? []);
    setRules(rRes.data ?? []);
    setHistory(hRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const r = rules.find(x => x.code === ruleCode);
    if (r) setDelta(r.delta);
  }, [ruleCode, rules]);

  async function submit() {
    setMsg(null);
    if (!employeeId) { setMsg("Р’С‹Р±РµСЂРёС‚Рµ СЃРѕС‚СЂСѓРґРЅРёРєР°"); return; }
    if (delta === "" || !Number.isFinite(Number(delta))) { setMsg("РЈРєР°Р¶РёС‚Рµ РёР·РјРµРЅРµРЅРёРµ Р±Р°Р»Р»РѕРІ"); return; }

    const res = await fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: employeeId,
        delta: Number(delta),
        rule_code: ruleCode || null,
        reason: reason || null
      })
    });

    const data = await res.json();
    if (!res.ok) { setMsg(`РћС€РёР±РєР°: ${data.error}`); return; }

    setMsg("РЎРѕС…СЂР°РЅРµРЅРѕ");
    setReason("");
    setRuleCode("");
    setDelta("");
    await loadAll();
  }

  if (loading) return <main style={{ padding: 24 }}>Р—Р°РіСЂСѓР·РєР°вЂ¦</main>;

  return (
    <main style={{ maxWidth: 820, margin: "32px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>РќР°С‡РёСЃР»РёС‚СЊ/РЎРїРёСЃР°С‚СЊ Р±Р°Р»Р»С‹</h1>

      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}>
          <option value="">Р’С‹Р±РµСЂРёС‚Рµ СЃРѕС‚СЂСѓРґРЅРёРєР°</option>
          {emps.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>

        <select value={ruleCode} onChange={(e) => setRuleCode(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}>
          <option value="">вЂ” РІС‹Р±СЂР°С‚СЊ РїСЂР°РІРёР»Рѕ вЂ”</option>
          {rules.map(r => <option key={r.code} value={r.code}>{r.title} ({r.delta > 0 ? "+" : ""}{r.delta})</option>)}
        </select>

        <input type="number" placeholder="РР·РјРµРЅРµРЅРёРµ (РјРѕР¶РЅРѕ РѕС‚СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ)"
               value={delta === "" ? "" : String(delta)}
               onChange={(e) => setDelta(e.target.value === "" ? "" : Number(e.target.value))}
               style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />

        <input type="text" placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№"
               value={reason} onChange={(e) => setReason(e.target.value)}
               style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />

        <button onClick={submit}
                style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer" }}>
          Р—Р°РїРёСЃР°С‚СЊ РѕРїРµСЂР°С†РёСЋ
        </button>

        {msg && <div style={{ color: msg.startsWith("РћС€РёР±РєР°") ? "#b00020" : "green" }}>{msg}</div>}
      </div>

      <h2 style={{ fontSize: 20, margin: "24px 0 8px" }}>Р›РµРЅС‚Р° РѕРїРµСЂР°С†РёР№</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Р”Р°С‚Р°</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>РџСЂР°РІРёР»Рѕ</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #eee", padding: 8 }}>Р‘Р°Р»Р»С‹</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th>
          </tr>
        </thead>
        <tbody>
          {history.map((r, i) => (
            <tr key={i}>
              <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8 }}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8 }}>{r.rule_code ?? "вЂ”"}</td>
              <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8, textAlign: "right" }}>
                {r.delta > 0 ? `+${r.delta}` : r.delta}
              </td>
              <td style={{ borderBottom: "1px solid #f3f3f3", padding: 8 }}>{r.reason ?? ""}</td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 12, color: "#666" }}>РџРѕРєР° РЅРµС‚ РѕРїРµСЂР°С†РёР№</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}


