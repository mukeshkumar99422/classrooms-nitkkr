import { createClient } from "@/lib/supabase/server";
import { DoorOpen } from "lucide-react";
import RoomsAdminClient from "@/components/admin/RoomsAdminClient";

export default async function AdminRoomsPage() {
  const supabase = createClient();
  const [{ data: rooms }, { data: departments }] = await Promise.all([
    supabase.from("rooms").select("*").order("name"),
    supabase.from("departments").select("id, name").eq("is_admin", false).order("name"),
  ]);
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <DoorOpen className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Rooms</h1>
          <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>Manage classrooms and schedules</p>
        </div>
      </div>
      <RoomsAdminClient initialRooms={rooms ?? []} departments={departments ?? []} />
    </div>
  );
}
