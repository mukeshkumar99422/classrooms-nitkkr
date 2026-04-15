import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email } = await req.json();
    const id=params.id;

    //create admin client
    const supabase = await createAdminClient();


    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    //update department record
    const { error } = await supabase.from("departments").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    //update auth user email if changed
    if (email) await supabase.auth.admin.updateUserById(id, { email });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createAdminClient();
    const id = params.id;

    //delete all schedules
    const { error: schedError } = await supabase
      .from('schedules')
      .delete()
      .eq('department_id', id)

    if (schedError) {
      return NextResponse.json({ error: schedError.message }, { status: 400 });
    }

    //delete department record
    const { error: dbError } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    // Then delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }


    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
