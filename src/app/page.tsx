import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: dept } = await supabase
    .from("departments").select("is_admin").eq("id", session.user.id).single();

  redirect(dept?.is_admin ? "/admin/dashboard" : "/dashboard");
}
