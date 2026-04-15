import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const supabase = await createAdminClient();

    // Check user exists (silently succeed either way for security)
    const { data: dept } = await supabase.from("departments").select("id").eq("email", email).single();
    if (!dept) return NextResponse.json({ success: true });

    // Generate reset link — redirects to /auth/callback which does the PKCE exchange
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset-password`,
      },
    });

    if (error || !data?.properties?.action_link) {
      return NextResponse.json({ error: "Could not generate reset link" }, { status: 500 });
    }

    await sendPasswordResetEmail({ to: email, resetUrl: data.properties.action_link });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
