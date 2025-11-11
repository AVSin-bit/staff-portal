import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import LoginForm from "./ui/LoginForm";

export default async function Page() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");
  return <LoginForm />;
}
