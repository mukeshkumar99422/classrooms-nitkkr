import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/index";

// Dynamic import prevents useContext/usePathname hydration mismatch
const Sidebar = dynamic(() => import("@/components/shared/Sidebar"), { ssr: false });

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
      <main className="lg:ml-64 flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}