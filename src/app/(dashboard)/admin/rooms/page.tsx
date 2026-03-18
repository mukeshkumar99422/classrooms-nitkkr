import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoomsClient from './rooms-client'

export default async function AdminRoomsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('departments')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentUser?.is_admin) redirect('/rooms')

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
