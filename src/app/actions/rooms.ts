'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

//---------------
export async function createRoom(formData: FormData) {
  const name = formData.get('name') as string

  if (!name) {
    return { error: 'Room name is required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('rooms').insert({ name })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/rooms')
  return { success: true }
}

//----------------
export async function deleteRoom(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('rooms').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/rooms')
  return { success: true }
}


//----------------
export async function getAllRooms() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('rooms').select('*').order('name')
  if (error) throw new Error(error.message)
  return data || []
}