import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LayoutDashboard, Building2, DoorOpen, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/index";

export default async function AdminDashboard() {
  const supabase = createClient();
  const [{ count: depts }, { count: rooms }, { count: slots }] = await Promise.all([
    supabase.from("departments").select("*", { count: "exact", head: true }).eq("is_admin", false),
    supabase.from("rooms").select("*", { count: "exact", head: true }),
    supabase.from("schedules").select("*", { count: "exact", head: true }).not("department_id", "is", null),
  ]);
  const { data: recentRooms } = await supabase.from("rooms").select("id,name").order("name").limit(12);

  const stats = [
    { label: "Departments", value: depts ?? 0, icon: Building2, href: "/admin/departments", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Rooms", value: rooms ?? 0, icon: DoorOpen, href: "/admin/rooms", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Scheduled Slots", value: slots ?? 0, icon: CalendarDays, href: "/admin/rooms", color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <LayoutDashboard className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>NIT KKR Classroom Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:border-[hsl(217,80%,50%,0.4)] transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "hsl(215, 14%, 55%)" }}>{s.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {recentRooms && recentRooms.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DoorOpen className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-semibold" style={{ color: "hsl(215, 14%, 65%)" }}>Quick Room Access</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-3">
              {recentRooms.map(room => (
                <Link key={room.id} href={`/admin/rooms/${room.id}`}>
                  <div className="rounded-lg p-3 text-center transition-all cursor-pointer hover:border-[hsl(217,80%,50%,0.5)]"
                    style={{ border: "1px solid hsl(222, 14%, 24%)", background: "hsl(222, 18%, 20%)" }}>
                    <DoorOpen className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-xs font-bold text-white">{room.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
