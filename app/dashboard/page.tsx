// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

const ROLE_RU: Record<string, string> = {
  director: "Директор",
  manager: "Управляющий",
  admin: "Администратор",
  master: "Парикмахер",
  cosmetologist: "Косметолог",
  nailmaster: "Нейл-мастер",
  massage: "Массажист",
};

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Кабинет</h1>
        <p>Нет сессии. Перейдите на главную страницу и войдите.</p>
      </main>
    );
  }

  const { data: emp, error: empError } = await supabase
    .from("v_employees")
    .select("full_name, role_name, role_slug, years, months")
    .eq("user_id", user.id)
    .single();

  if (empError || !emp) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Кабинет</h1>
        <p>
          <b>Профиль сотрудника не найден.</b> Попросите управляющую добавить Вас в портал.
        </p>
      </main>
    );
  }

  const roleRu = emp.role_name || ROLE_RU[emp.role_slug] || emp.role_slug;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Кабинет</h1>
      <p>Сотрудник: {emp.full_name}</p>
      <p>Роль: {roleRu}</p>
      <p>Стаж: {emp.years} лет {emp.months} мес.</p>
    </main>
  );
}
