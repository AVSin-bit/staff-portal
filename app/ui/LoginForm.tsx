"use client";

import { useState } from "react";
import { signInWithEmail } from "@/lib/auth-actions";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await signInWithEmail(email);
    if (error) setMsg(`Ошибка: ${error}`);
    else setMsg("Письмо с ссылкой отправлено. Проверьте почту.");
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 520, margin: "80px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Портал мастеров</h1>
      <p style={{ marginBottom: 20 }}>Вход по e-mail (magic-link)</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 12, border: "1px solid #ccc", borderRadius: 10 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Отправляю..." : "Войти"}
        </button>
      </form>

      {msg && (
        <div style={{ marginTop: 12, color: msg.startsWith("Ошибка") ? "#b00020" : "green" }}>
          {msg}
        </div>
      )}
    </main>
  );
}
