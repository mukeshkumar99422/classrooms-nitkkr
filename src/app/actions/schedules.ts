'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bulkUpsertSchedules(
  roomId: string,
  schedules: Array<{
    day_of_week: string
    period_number: number
    department_id: string | null
  }>
) {
  const supabase = await createClient()

  // First, delete all existing schedules for this room
  const { error: deleteError } = await supabase
    .from('schedules')
    .delete()
    .eq('room_id', roomId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  // Filter out empty slots
  const validSchedules = schedules
    .filter((s) => s.department_id)
    .map((s) => ({
      room_id: roomId,
      day_of_week: s.day_of_week,
      period_number: s.period_number,
      department_id: s.department_id,
    }))

  if (validSchedules.length === 0) {
    revalidatePath('/admin/rooms')
    return { success: true }
  }

  const { error } = await supabase.from('schedules').insert(validSchedules)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/rooms')
  revalidatePath('/rooms')
  return { success: true }
}

export async function updateScheduleDetails(
  scheduleId: string,
  data: {
    course: string
    branch: string
    section: string
    subsection?: string
    professor_name?: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('schedules')
    .update({
      course: data.course,
      branch: data.branch,
      section: data.section,
      subsection: data.subsection || null,
      professor_name: data.professor_name || null,
    })
    .eq('id', scheduleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/rooms')
  return { success: true }
}
