import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LayoutDashboard, DoorOpen, CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/index";

export default async function UserDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: dept } = await supabase.from("departments").select("name").eq("id", session.user.id).single();
  const { data: mySlots } = await supabase.from("schedules").select("room_id, rooms(id, name)").eq("department_id", session.user.id);
  const { count: totalRooms } = await supabase.from("rooms").select("*", { count: "exact", head: true });

  const myRoomMap = new Map<string, { id: string; name: string }>();
  for (const slot of mySlots ?? []) {
    const r = slot.rooms as any;
    if (r && !myRoomMap.has(r.id)) myRoomMap.set(r.id, r);
  }
  const myRooms = Array.from(myRoomMap.values());

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <LayoutDashboard className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>Welcome, {dept?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>Total Rooms</p>
              <p className="text-3xl font-bold text-white mt-1">{totalRooms ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10"><DoorOpen className="h-5 w-5 text-blue-400" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>Your Assigned Rooms</p>
              <p className="text-3xl font-bold text-white mt-1">{myRooms.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10"><CalendarDays className="h-5 w-5 text-emerald-400" /></div>
          </CardContent>
        </Card>
      </div>

      {myRooms.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "hsl(215, 14%, 50%)" }}>
            Your Rooms
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {myRooms.map(room => (
              <Link key={room.id} href={`/dashboard/rooms/${room.id}`}>
                <Card className="hover:border-[hsl(217,80%,50%,0.5)] transition-all cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <DoorOpen className="h-7 w-7 mx-auto text-blue-400 mb-2" />
                    <p className="font-bold text-sm text-white">{room.name}</p>
                    <p className="text-xs flex items-center justify-center gap-0.5 mt-1"
                      style={{ color: "hsl(215, 14%, 50%)" }}>
                      Edit <ArrowRight className="h-3 w-3" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
