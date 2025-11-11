import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import LoginForm from "./ui/LoginForm";

export default async function Page() {
  // Сервером проверяем сессию
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Если уже залогинен — сразу в кабинет
  if (user) redirect("/dashboard");

  // Иначе показываем форму входа
  return <LoginForm />;
}
