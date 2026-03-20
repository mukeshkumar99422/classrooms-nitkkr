import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MyScheduleClient from './my-schedule-client'

export default async function MySchedulePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: department } = await supabase
    .from('departments')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!department) redirect('/login')
  if (department.is_admin) redirect('/admin/departments')

  // Fetch all schedules for this department
  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('department_id', user.id)

  const { data: rooms } = await supabase.from('rooms').select('*')

  return (
    <MyScheduleClient
      department={department}
      schedules={schedules || []}
      rooms={rooms || []}
    />
  )
}
