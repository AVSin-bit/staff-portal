import { supabaseServer } from "@/lib/supabase-server";

function humanTenure(start: string) {
  const d0 = new Date(start);
  const d1 = new Date();
  let months = (d1.getFullYear() - d0.getFullYear()) * 12 + (d1.getMonth() - d0.getMonth());
  if (d1.getDate() < d0.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  months = months % 12;
  return { years, months };
}

export default async function DashboardPage() {
  const supabase = supabaseServer();

  // 1) Текущий пользователь
  const { data: { user } } = await supabase.auth.getUser();
  // middleware уже не пустит неавторизованного, но на всякий:
  if (!user) return <div>Нет сессии</div>;

  // 2) Берём свою карточку сотрудника
  const { data: me, error } = await supabase
    .from("v_employees")
    .select("id, full_name, role_slug, salon_id, start_date")
    .eq("user_id", user.id)
    .single();

  if (error || !me) {
    return (
      <main style={{ maxWidth: 780, margin: "40px auto", fontFamily: "system-ui" }}>
        <h1>Кабинет</h1>
        <p style={{ color: "#b00020" }}>Профиль сотрудника не найден. Попроси админа добавить запись в employees.</p>
      </main>
    );
  }

  // 3) Стаж + текущие баллы
  const { years, months } = humanTenure(me.start_date);
  const { data: pointsRow } = await supabase
    .from("v_employee_points")
    .select("total_points")
    .eq("employee_id", me.id)
    .maybeSingle();

  const total = pointsRow?.total_points ?? 0;

  return (
    <main style={{ maxWidth: 780, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Кабинет</h1>
      <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <div><b>Сотрудник:</b> {me.full_name}</div>
        <div><b>Роль:</b> {me.role_slug}</div>
        <div><b>Стаж:</b> {years} лет {months} мес.</div>
        <div><b>Баллы:</b> {total}</div>
      </div>
      <p style={{ marginTop: 16 }}>
        Дальше выведем рейтинг по салону/сети и страницу начисления баллов.
      </p>
    </main>
  );
}
