import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

export default async function PointsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  // Загружаем справочники для формы
  const { data: rules } = await supabase
    .from("point_rules")
    .select("id, name, delta")
    .order("name", { ascending: true });

  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  return (
    <main style={{ padding: 24 }}>
      <h2>Начислить/Списать баллы</h2>
      <p>Пользователь: {user?.email ?? "неизвестно"}</p>

      <div style={{ marginTop: 16 }}>
        <div>Сотрудник (для примера выводим список):</div>
        <ul>
          {(employees ?? []).map((e) => (
            <li key={e.id}>{e.full_name}</li>
          ))}
        </ul>

        <div style={{ marginTop: 16 }}>Правила:</div>
        <ul>
          {(rules ?? []).map((r) => (
            <li key={r.id}>{r.name} ({r.delta > 0 ? "+" : ""}{r.delta})</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

