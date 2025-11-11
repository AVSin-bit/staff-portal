import { supabaseServer } from "@/lib/supabase-server";

function humanTenure(start: string) {
  const a = new Date(start), b = new Date();
  let m = (b.getFullYear()-a.getFullYear())*12 + (b.getMonth()-a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return { years: Math.floor(m/12), months: m%12 };
}

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main style={{padding:24}}>Нет сессии</main>;

  const { data: me } = await supabase.from("v_employees")
    .select("id, full_name, role_slug, start_date").eq("user_id", user.id).maybeSingle();

  if (!me) {
    return <main style={{padding:24}}>
      <b>Профиль сотрудника не найден.</b> Попроси админа добавить запись в <i>employees</i>.
    </main>;
  }

  const { years, months } = humanTenure(me.start_date);
  return <main style={{padding:24, fontFamily:"system-ui"}}>
    <h1>Кабинет</h1>
    <div>Сотрудник: {me.full_name}</div>
    <div>Роль: {me.role_slug}</div>
    <div>Стаж: {years} лет {months} мес.</div>
  </main>;
}
