'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDepartment(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'All fields are required' }
  }

  const supabase = await createAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  // Insert department record
  const { error: dbError } = await supabase
    .from('departments')
    .insert({
      id: authData.user.id,
      name,
      email,
      is_admin: false,
    })

  if (dbError) {
    // Cleanup: delete the auth user if department insert fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: dbError.message }
  }

  revalidatePath('/admin/departments')
  return { success: true }
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

  // Delete auth user (cascades to departments table)
  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/departments')
  return { success: true }
}
