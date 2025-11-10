import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: me, error } = await supabase
    .from("employees")
    .select("id, auth_user_id, email, full_name, role_id, salon_id, position, is_active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!me || error) {
    return (
      <div style={{ padding: 24 }}>
        Профиль сотрудника не найден. Попроси админа добавить запись в <b>employees</b>.
      </div>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Привет, {me.full_name}</h2>
      <div>Должность: {me.position}</div>
      <div>Статус: {me.is_active ? "Активен" : "Не активен"}</div>
    </main>
  );
}
