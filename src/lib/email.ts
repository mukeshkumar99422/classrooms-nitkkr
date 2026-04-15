import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function sendInviteEmail({ to, departmentName, password, loginUrl }: {
  to: string; departmentName: string; password: string; loginUrl: string;
}) {
  await transporter.sendMail({
    from: `"NIT KKR Classrooms" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Department Account – NIT KKR Classrooms",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#1e3a8a;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">NIT KKR Classrooms</h1>
        </div>
        <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 8px 8px">
          <h2 style="color:#111827;margin-top:0">Welcome, ${departmentName}!</h2>
          <p style="color:#374151">Your department account has been created. Here are your login credentials:</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:6px;margin:16px 0">
            <p style="margin:0;color:#111"><strong>Email:</strong> ${to}</p>
            <p style="margin:8px 0 0;color:#111"><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color:#374151">Please change your password after first login.</p>
          <a href="${loginUrl}" style="display:inline-block;background:#1e3a8a;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px">Login to Portal</a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">NIT Kurukshetra – Classroom Management System</p>
      </div>`,
  });
}

export async function sendPasswordResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
  await transporter.sendMail({
    from: `"NIT KKR Classrooms" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password – NIT KKR Classrooms",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#1e3a8a;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">NIT KKR Classrooms</h1>
        </div>
        <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 8px 8px">
          <h2 style="color:#111827;margin-top:0">Password Reset</h2>
          <p style="color:#374151">Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#1e3a8a;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px">Reset Password</a>
          <p style="color:#6b7280;font-size:13px;margin-top:20px">If you didn't request this, ignore this email.</p>
        </div>
      </div>`,
  });
}
