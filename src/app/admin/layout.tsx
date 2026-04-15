import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/shared/Sidebar";
import { Toaster } from "@/components/ui/index";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: dept } = await supabase
    .from("departments").select("name, is_admin").eq("id", session.user.id).single();

  if (!dept?.is_admin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isAdmin={true} deptName={dept.name} />
      <main className="flex-1 overflow-auto lg:pl-0 pl-0">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
