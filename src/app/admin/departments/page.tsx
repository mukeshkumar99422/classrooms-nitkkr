import { createClient } from "@/lib/supabase/server";
import { Building2 } from "lucide-react";
import DepartmentsClient from "@/components/admin/DepartmentsClient";

export default async function DepartmentsPage() {
  const supabase = createClient();
  const { data: departments } = await supabase
    .from("departments").select("*").eq("is_admin", false).order("name");
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Building2 className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>Manage department accounts</p>
        </div>
      </div>
      <DepartmentsClient initialDepts={departments ?? []} />
    </div>
  );
}
