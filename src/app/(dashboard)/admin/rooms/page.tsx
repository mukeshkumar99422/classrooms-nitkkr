import { getSessionUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoomsClient from './rooms-client'
import { getCachedDepartment } from '@/lib/supabase/user'

export default async function AdminRoomsPage() {
  const department = await getCachedDepartment()
  if (!department?.is_admin) redirect('/rooms')

  const {supabase} = await getSessionUser()

  const { data: rooms } = await supabase.from('rooms').select('*').order('name')
  const { data: departments } = await supabase.from('departments').select('*').order('name')

  return (
    <RoomsClient
      rooms={rooms || []}
      departments={departments || []}
    />
  )
}
