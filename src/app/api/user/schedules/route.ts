import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  try {
    const { schedule_id, course, branch, section, subsection, professor_name } = await req.json();
    if (!schedule_id) return NextResponse.json({ error: "schedule_id required" }, { status: 400 });

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify this slot belongs to current user's department
    const { data: schedule } = await supabase.from("schedules").select("department_id").eq("id", schedule_id).single();
    if (!schedule || schedule.department_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden — slot not assigned to your department" }, { status: 403 });
    }

    const { data, error } = await supabase.from("schedules")
      .update({ course, branch, section, subsection, professor_name })
      .eq("id", schedule_id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ schedule: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
