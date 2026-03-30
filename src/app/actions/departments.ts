'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/gmail'


export async function createDepartment(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) return { error: 'All fields are required' }

  const supabase = await createAdminClient()

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (authError) return { error: authError.message }

  // 2. Insert DB Record
  const { error: dbError } = await supabase.from('departments').insert({
    id: authData.user.id, name, email, is_admin: false,
  })

  if (dbError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: dbError.message }
  }

  // 3. FIRE AND FORGET: Don't 'await' the email to speed up the response
  sendEmail({
    to: email,
    subject: 'Your NIT Kurukshetra Classroom Scheduling Account',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #d97706, #b45309); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">NIT Kurukshetra</h1>
          <p style="color: #fef3c7; margin: 8px 0 0; font-size: 14px;">Classroom Scheduling System</p>
        </div>
        <div style="padding: 32px; color: #e2e8f0;">
          <h2 style="color: #fbbf24; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="line-height: 1.6;">Your department account has been created on the NIT Kurukshetra Classroom Scheduling System. You can now log in using the credentials below:</p>
          <div style="background: #334155; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #d97706;">
            <p style="margin: 0 0 12px;"><strong style="color: #fbbf24;">Email:</strong> <span style="color: #ffffff;">${email}</span></p>
            <p style="margin: 0;"><strong style="color: #fbbf24;">Password:</strong> <span style="color: #ffffff;">${password}</span></p>
          </div>
          <p style="line-height: 1.6; color: #94a3b8;">
            <strong style="color: #f59e0b;">⚠ Important:</strong> Please change your password after your first login by going to Settings.
          </p>
          <div style="margin-top: 32px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login"
                style="background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Login Now
            </a>
          </div>
        </div>
        <div style="background: #0f172a; padding: 16px; text-align: center;">
          <p style="color: #64748b; margin: 0; font-size: 12px;">NIT Kurukshetra — Classroom Scheduling System</p>
        </div>
      </div>
    `,
  })
  .catch(err => console.error("Background email failed", err))

  revalidatePath('/admin/departments')
  return { success: true, emailError: false }
}

export async function updateDepartment(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!id || !name || !email) {
    return { error: 'All fields are required' }
  }

  const supabase = await createAdminClient()

  // Update auth user email
  const { error: authError } = await supabase.auth.admin.updateUserById(id, {
    email,
  })

  if (authError) {
    return { error: authError.message }
  }

  // Update department record
  const { error: dbError } = await supabase
    .from('departments')
    .update({ name, email })
    .eq('id', id)

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/admin/departments')
  return { success: true }
}

export async function deleteDepartment(id: string) {
  const supabase = await createAdminClient()

  // Cascade delete department record (RLS)
  const { error: dbError } = await supabase.from('departments').delete().eq('id', id)
  if (dbError) return { error: dbError.message }

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  if (authError) return { error: authError.message };

  revalidatePath('/admin/departments')
  return { success: true }
}