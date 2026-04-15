import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseScheduleExcel } from "@/lib/excel";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const room_id = formData.get("room_id") as string | null;
    if (!file || !room_id) return NextResponse.json({ error: "File and room_id required" }, { status: 400 });

    const supabase = createClient();
    const { data: departments } = await supabase.from("departments").select("id, name").eq("is_admin", false);
    const validNames = (departments ?? []).map(d => d.name);
    const deptByName = Object.fromEntries((departments ?? []).map(d => [d.name.toLowerCase(), d]));

    const buffer = await file.arrayBuffer();
    const { data: rows, errors } = parseScheduleExcel(buffer, validNames);

    if (rows.length === 0 && errors.length > 0) return NextResponse.json({ error: "No valid rows", errors }, { status: 422 });

    // Clear existing and re-insert
    await supabase.from("schedules").delete().eq("room_id", room_id);
    if (rows.length > 0) {
      const inserts = rows.map(row => ({
        room_id, day_of_week: row.day, period_number: row.period,
        department_id: deptByName[row.departmentName.toLowerCase()]?.id ?? null,
      }));
      const { error } = await supabase.from("schedules").insert(inserts);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: freshSchedules } = await supabase.from("schedules")
      .select("*, departments(id, name)").eq("room_id", room_id);

    return NextResponse.json({ schedules: freshSchedules, updated: rows.length, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
