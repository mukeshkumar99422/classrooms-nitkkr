import { createClient } from '@/lib/supabase/server'
import RoomsClient from './rooms-client'

export const revalidate = 300 // Revalidate every 5 minutes

export default async function AdminRoomsPage() {
  const supabase = await createClient()

  const { data: rooms } = await supabase.from('rooms').select('*').order('name')
  const { data: departments } = await supabase.from('departments').select('*').order('name')
  const { data: schedules } = await supabase.from('schedules').select('*')

  return (
    <RoomsClient
      rooms={rooms || []}
      departments={departments || []}
      schedules={schedules || []}
    />
  )
}
