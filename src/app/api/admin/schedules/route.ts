import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { room_id, day_of_week, period_number, department_id } = await req.json();
    if (!room_id || !day_of_week || !period_number) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = createClient();

    if (!department_id) {
      await supabase.from("schedules").delete()
        .eq("room_id", room_id).eq("day_of_week", day_of_week).eq("period_number", period_number);
      return NextResponse.json({ schedule: null });
    }

    const { data, error } = await supabase.from("schedules").upsert(
      { room_id, day_of_week, period_number, department_id, course: null, branch: null, section: null, subsection: null, professor_name: null },
      { onConflict: "room_id,day_of_week,period_number" }
    ).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ schedule: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
