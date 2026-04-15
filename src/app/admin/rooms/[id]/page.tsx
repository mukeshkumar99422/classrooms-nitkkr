import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DoorOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AdminScheduleClient from "@/components/admin/AdminScheduleClient";

export default async function AdminRoomPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: room }, { data: schedules }, { data: departments }] = await Promise.all([
    supabase.from("rooms").select("*").eq("id", params.id).single(),
    supabase.from("schedules").select("*, departments(id, name)").eq("room_id", params.id),
    supabase.from("departments").select("id, name").eq("is_admin", false).order("name"),
  ]);
  if (!room) notFound();
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/rooms" className="flex items-center gap-1.5 text-sm mb-3 hover:text-white transition-colors"
          style={{ color: "hsl(215, 14%, 55%)" }}>
          <ArrowLeft className="h-4 w-4" /> Back to Rooms
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <DoorOpen className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Room {room.name}</h1>
            <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>
              Click any cell to assign a department
            </p>
          </div>
        </div>
      </div>
      <AdminScheduleClient room={room} schedules={schedules ?? []} departments={departments ?? []} />
    </div>
  );
}
