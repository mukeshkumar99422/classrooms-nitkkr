import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendInviteEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "All fields required" }, { status: 400 });

    const supabase = await createAdminClient();

    // Create auth user (email_confirm:true bypasses confirmation requirement)
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email, 
      password, 
      email_confirm: true,
    });
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

    // Create department linked to auth user
    const { data: dept, error: deptErr } = await supabase
      .from("departments")
      .insert({ id: authData.user.id, name, email, is_admin: false })
      .select().single();
    if (deptErr) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: deptErr.message }, { status: 400 });
    }

    
    //send invite email
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`;
    try { await sendInviteEmail({ to: email, departmentName: name, password, loginUrl }); }
    catch (emailErr) { console.error("Email failed:", emailErr); }

    return NextResponse.json({ department: dept }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
