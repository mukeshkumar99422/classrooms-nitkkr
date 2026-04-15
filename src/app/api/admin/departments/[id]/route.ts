import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email } = await req.json();
    const supabase = await createAdminClient();
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    const { error } = await supabase.from("departments").update(updates).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (email) await supabase.auth.admin.updateUserById(params.id, { email });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
