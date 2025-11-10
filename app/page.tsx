"use client";

import { useState } from "react";
import { signInWithEmail } from "@/lib/auth-actions";

export default function Page() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await signInWithEmail(email);
    if (error) setMessage(`Ошибка: ${error}`);
    else setMessage("Письмо с ссылкой отправлено. Проверьте почту.");
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Портал мастеров</h1>
      <p style={{ marginBottom: 20 }}>Вход по e-mail (magic-link)</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#111",
            color: "white",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Отправляю..." : "Войти"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: 14, color: message.startsWith("Ошибка") ? "#b00020" : "green" }}>
          {message}
        </div>
      )}
    </main>
  );
}
